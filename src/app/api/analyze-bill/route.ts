import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { extractBillData, NonMedicalBillError, LowConfidenceOCRError } from '@/lib/bill-analyzer/ocr'
import { analyzeBill } from '@/lib/bill-analyzer/analyzer'
import { LLMUnavailableError } from '@/lib/llm'

export const maxDuration = 60 // Vercel Pro — up to 60s for OCR + analysis

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Rate limits: burst (per minute) + sustained (per hour)
const BURST_MAX = 2
const BURST_WINDOW_MS = 60 * 1000 // 1 minute
const HOURLY_MAX = 5
const HOURLY_WINDOW_MS = 60 * 60 * 1000 // 1 hour

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; message?: string }> {
  const now = Date.now()
  const burstStart = new Date(now - BURST_WINDOW_MS).toISOString()
  const hourlyStart = new Date(now - HOURLY_WINDOW_MS).toISOString()

  // Check burst limit (2 per minute)
  const { count: burstCount } = await supabaseAdmin
    .from('bill_analysis_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', burstStart)

  if ((burstCount ?? 0) >= BURST_MAX) {
    return { allowed: false, message: 'Please wait a minute before analyzing another bill.' }
  }

  // Check hourly limit (5 per hour)
  const { count: hourlyCount } = await supabaseAdmin
    .from('bill_analysis_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', hourlyStart)

  if ((hourlyCount ?? 0) >= HOURLY_MAX) {
    return { allowed: false, message: 'You can analyze up to 5 bills per hour. Please try again later.' }
  }

  // Log this request
  await supabaseAdmin.from('bill_analysis_rate_limits').insert({ ip })

  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    // Rate limit check
    const { allowed, message } = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ error: message }, { status: 429 })
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const incomeStr = formData.get('income') as string | null
    const householdSizeStr = formData.get('householdSize') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const mediaType = file.type as string
    if (!ALLOWED_TYPES.has(mediaType)) {
      return NextResponse.json(
        { error: 'File must be a PDF, JPEG, PNG, or WebP image' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    const income = incomeStr ? Number(incomeStr) : undefined
    const householdSize = householdSizeStr ? Number(householdSizeStr) : undefined

    // Step 1: OCR — extract bill data (Gemini 3 Flash → Claude Sonnet fallback)
    const billData = await extractBillData(
      base64,
      mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'
    )

    if (!billData.lineItems.length) {
      return NextResponse.json(
        {
          error:
            "We couldn't read the line items from your bill. Make sure the image is clear and well-lit, or try uploading a PDF version.",
        },
        { status: 422 }
      )
    }

    // Step 2: Analyze (Gemini 3.1 Flash-Lite → Claude Haiku fallback)
    const result = await analyzeBill(billData, income, householdSize)

    // Step 3: Save results to storage (48h TTL, no PII, no bill image)
    const resultId = crypto.randomUUID()
    const stored = { analysis: result, createdAt: new Date().toISOString() }
    await supabaseAdmin.storage
      .from('bill-results')
      .upload(`${resultId}.json`, JSON.stringify(stored), {
        contentType: 'application/json',
      })
      .catch(err => console.error('Failed to save results:', err))

    return NextResponse.json({ ...result, resultId })
  } catch (error) {
    if (error instanceof NonMedicalBillError) {
      return NextResponse.json(
        { error: "This doesn't look like a medical bill. Please upload a hospital or provider bill — we can't analyze grocery receipts, insurance cards, or other documents." },
        { status: 422 }
      )
    }
    if (error instanceof LowConfidenceOCRError) {
      return NextResponse.json(
        { error: "The image quality is too low to read accurately. Try uploading a clearer photo with good lighting, or export a PDF directly from your patient portal." },
        { status: 422 }
      )
    }
    if (error instanceof LLMUnavailableError) {
      return NextResponse.json(
        { error: "Our analysis service is temporarily unavailable. Please try again in a few minutes." },
        { status: 503 }
      )
    }
    // Unreadable image/PDF (JSON parse failed after retry)
    if (error instanceof Error && error.message.includes("couldn't read your bill")) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('Bill analysis error:', error)
    return NextResponse.json(
      { error: 'Something went wrong analyzing your bill. Please try again.' },
      { status: 500 }
    )
  }
}

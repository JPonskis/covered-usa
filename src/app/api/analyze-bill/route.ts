import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { extractBillData } from '@/lib/bill-analyzer/ocr'
import { analyzeBill } from '@/lib/bill-analyzer/analyzer'

export const maxDuration = 60 // Vercel Pro — up to 60s for OCR + analysis

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

async function checkRateLimit(ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

  const { count } = await supabaseAdmin
    .from('bill_analysis_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT_MAX) return false

  await supabaseAdmin
    .from('bill_analysis_rate_limits')
    .insert({ ip })

  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    // Rate limit check
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can analyze up to 5 bills per hour.' },
        { status: 429 }
      )
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

    // Step 1: OCR — extract bill data
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

    // Step 2: Analyze
    const result = await analyzeBill(billData, income, householdSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Bill analysis error:', error)
    return NextResponse.json(
      {
        error:
          'Something went wrong analyzing your bill. Please try again.',
      },
      { status: 500 }
    )
  }
}

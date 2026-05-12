import { llm, OCR_PRIMARY, OCR_FALLBACK } from '@/lib/llm'
import type { BillData, BillLineItem } from './types'

// Thrown when the uploaded file is not a medical/healthcare bill
export class NonMedicalBillError extends Error {
  constructor() {
    super('NotAMedicalBill')
    this.name = 'NonMedicalBillError'
  }
}

// Thrown when OCR confidence is too low to produce useful results
export class LowConfidenceOCRError extends Error {
  constructor(avgConfidence: number) {
    super(`OCR confidence too low: ${avgConfidence.toFixed(2)}`)
    this.name = 'LowConfidenceOCRError'
  }
}

const OCR_PROMPT = `You are a medical billing expert extracting line items from a hospital or medical bill.

FIRST, determine if this is a medical/healthcare bill:
- Set "documentType" to "medical_bill" if it contains medical services, CPT codes, hospital charges, doctor fees, lab fees, etc.
- Set "documentType" to "other" if it's a grocery receipt, restaurant bill, utility bill, personal photo, screenshot, or any non-medical document.

If documentType is "other", still return valid JSON with empty lineItems but set documentType correctly.

Extract ALL line items from this bill. For each item return:
- description: plain English description of the service
- code: the CPT, HCPCS, or revenue code if visible (string, or null if not shown)
- quantity: number of units (default 1)
- unitCharge: charge per unit
- totalCharge: total charge for this line
- confidence: 0.0-1.0 — how confident you are in the extraction

Also extract:
- providerName: the hospital/clinic/provider name
- providerState: 2-letter state code if visible
- providerAddress: full address if visible
- patientName: patient name if visible (we will NOT store this)
- patientAddress: patient mailing address if visible (street, city, state, zip)
- accountNumber: patient account number or billing account number if visible
- dateOfService: date(s) of service in YYYY-MM-DD format
- totalBilled: total amount billed (before insurance)
- insuranceAdjustment: insurance adjustment amount if shown (or null)
- patientResponsibility: amount patient owes after insurance (or null)

IMPORTANT RULES:
- Do NOT hallucinate codes that aren't visible on the bill. If no code is shown, return null for code.
- Separate line items — do not combine. Each charge should be its own entry.
- Exclude subtotals, totals, and tax lines from lineItems.
- If you see a charge described as "room & board" or "accommodation", keep it as one item.
- If the bill is a summary (not itemized), extract whatever summary charges are shown.

Return ONLY valid JSON in this exact format:
{
  "documentType": "medical_bill" | "other",
  "provider": { "name": string, "state": string|null, "address": string|null },
  "patient": { "name": string|null, "address": string|null, "accountNumber": string|null },
  "dateOfService": string|null,
  "lineItems": [
    { "description": string, "code": string|null, "quantity": number, "unitCharge": number, "totalCharge": number, "confidence": number }
  ],
  "totalBilled": number,
  "insuranceAdjustment": number|null,
  "patientResponsibility": number|null
}`

export async function extractBillData(
  fileBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'
): Promise<BillData> {
  const isImage = mediaType.startsWith('image/')

  const llmRequest = {
    prompt: OCR_PROMPT,
    maxTokens: 8192,
    ...(isImage
      ? { image: { base64: fileBase64, mediaType } }
      : { document: { base64: fileBase64, mediaType } }),
  }

  // Try to parse the LLM response, with one retry on bad JSON
  let parsed: Record<string, unknown> | null = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    const text = await llm(OCR_PRIMARY, OCR_FALLBACK, llmRequest)

    // Strip markdown code fences if present
    const stripped = text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '')
    const jsonMatch = stripped.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn(`[OCR] No JSON found in response (attempt ${attempt}), raw length=${text.length}, first 200 chars: ${text.slice(0, 200)}`)
      if (attempt === 2) throw new Error("We couldn't read your bill. Please try again with a clearer image or PDF.")
      continue
    }

    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
      break
    } catch (e) {
      console.warn(`[OCR] JSON parse failed (attempt ${attempt}): ${e instanceof Error ? e.message : e}, json length=${jsonMatch[0].length}`)
      if (attempt === 2) throw new Error("We couldn't read your bill. Please try again with a clearer image or PDF.")
    }
  }

  if (!parsed) {
    throw new Error("We couldn't read your bill. Please try again with a clearer image or PDF.")
  }

  // Non-medical bill detection
  if (parsed.documentType === 'other') {
    throw new NonMedicalBillError()
  }

  type RawLineItem = {
    description: string
    code?: string | null
    quantity?: number
    unitCharge?: number
    totalCharge?: number
    confidence?: number
  }
  const lineItems: BillLineItem[] = ((parsed.lineItems as RawLineItem[]) ?? []).map(
    (item) => ({
      description: item.description ?? 'Unknown service',
      code: item.code ?? undefined,
      quantity: Number(item.quantity ?? 1),
      unitCharge: Number(item.unitCharge ?? 0),
      totalCharge: Number(item.totalCharge ?? 0),
      confidence: Number(item.confidence ?? 0.8),
    })
  )

  // Low confidence check — if average confidence < 0.4, the image is too unclear
  if (lineItems.length > 0) {
    const avgConfidence = lineItems.reduce((sum, item) => sum + item.confidence, 0) / lineItems.length
    if (avgConfidence < 0.4) {
      throw new LowConfidenceOCRError(avgConfidence)
    }
  }

  const provider = parsed.provider as { name?: string; state?: string; address?: string } | undefined
  const patient = parsed.patient as { name?: string; address?: string; accountNumber?: string } | undefined

  return {
    provider: {
      name: provider?.name ?? 'Unknown Provider',
      state: provider?.state ?? undefined,
      address: provider?.address ?? undefined,
    },
    patient: {
      name: patient?.name ?? undefined,
      address: patient?.address ?? undefined,
      accountNumber: patient?.accountNumber ?? undefined,
    },
    dateOfService: (parsed.dateOfService as string | undefined) ?? undefined,
    lineItems,
    totalBilled: Number(parsed.totalBilled ?? 0),
    insuranceAdjustment:
      parsed.insuranceAdjustment != null
        ? Number(parsed.insuranceAdjustment)
        : undefined,
    patientResponsibility:
      parsed.patientResponsibility != null
        ? Number(parsed.patientResponsibility)
        : undefined,
  }
}

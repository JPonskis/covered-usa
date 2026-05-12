import Anthropic from '@anthropic-ai/sdk'
import type { BillData, BillLineItem } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const OCR_PROMPT = `You are a medical billing expert extracting line items from a hospital or medical bill.

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
  "provider": { "name": string, "state": string|null, "address": string|null },
  "patient": { "name": string|null },
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

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          isImage
            ? {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
                  data: fileBase64,
                },
              }
            : {
                type: 'document' as const,
                source: {
                  type: 'base64' as const,
                  media_type: 'application/pdf' as const,
                  data: fileBase64,
                },
              },
          {
            type: 'text' as const,
            text: OCR_PROMPT,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from response (may have markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from OCR response')
  }

  const parsed = JSON.parse(jsonMatch[0])

  const lineItems: BillLineItem[] = (parsed.lineItems ?? []).map((item: {
    description: string
    code?: string | null
    quantity?: number
    unitCharge?: number
    totalCharge?: number
    confidence?: number
  }) => ({
    description: item.description ?? 'Unknown service',
    code: item.code ?? undefined,
    quantity: Number(item.quantity ?? 1),
    unitCharge: Number(item.unitCharge ?? 0),
    totalCharge: Number(item.totalCharge ?? 0),
    confidence: Number(item.confidence ?? 0.8),
  }))

  return {
    provider: {
      name: parsed.provider?.name ?? 'Unknown Provider',
      state: parsed.provider?.state ?? undefined,
      address: parsed.provider?.address ?? undefined,
    },
    patient: {
      name: parsed.patient?.name ?? undefined,
    },
    dateOfService: parsed.dateOfService ?? undefined,
    lineItems,
    totalBilled: Number(parsed.totalBilled ?? 0),
    insuranceAdjustment: parsed.insuranceAdjustment != null
      ? Number(parsed.insuranceAdjustment)
      : undefined,
    patientResponsibility: parsed.patientResponsibility != null
      ? Number(parsed.patientResponsibility)
      : undefined,
  }
}

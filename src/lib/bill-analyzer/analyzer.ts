import { supabaseAdmin } from '@/lib/supabase-admin'
import { llm, CODE_ID_PRIMARY, CODE_ID_FALLBACK } from '@/lib/llm'
import { getMedicareRates } from './cms-data'
import {
  type BillData,
  type AnalysisResult,
  type AnalyzedLineItem,
  type CharityCareResult,
  getFPLPercent,
} from './types'

/**
 * Identify likely HCPCS/CPT codes for line items that don't have visible codes.
 * These codes are backend-only — never returned to the client.
 */
async function identifyCodes(
  lineItems: BillData['lineItems']
): Promise<Map<number, string>> {
  const needsCodes = lineItems
    .map((item, idx) => ({ idx, item }))
    .filter(({ item }) => !item.code && item.confidence > 0.5)

  if (needsCodes.length === 0) return new Map()

  const prompt = `You are a medical coding expert. For each medical service description below, identify the most likely HCPCS/CPT code.

Services:
${needsCodes.map(({ idx, item }) => `${idx}: "${item.description}" — charged $${item.totalCharge}`).join('\n')}

Return ONLY a JSON object mapping index to code: {"0": "99213", "1": "71046", ...}
If you cannot confidently identify a code, omit that index.
Do not include codes you are not confident about (>80% confidence only).`

  const text = await llm(CODE_ID_PRIMARY, CODE_ID_FALLBACK, {
    prompt,
    maxTokens: 512,
  })

  const jsonMatch = text.match(/\{[^{}]*\}/)
  if (!jsonMatch) return new Map()

  const codeMap: Record<string, string> = JSON.parse(jsonMatch[0])
  const result = new Map<number, string>()
  for (const [idxStr, code] of Object.entries(codeMap)) {
    result.set(Number(idxStr), String(code).toUpperCase())
  }
  return result
}

/**
 * Look up hospital nonprofit status from our database
 */
async function lookupHospital(providerName: string, state?: string) {
  const nameFragment = providerName.substring(0, 20)

  // Try with state filter first
  if (state) {
    const q = supabaseAdmin
      .from('hospital_fap_urls')
      .select('hospital_name, system_name, is_nonprofit, fap_url, income_limit_fpl_percent')
      .ilike('hospital_name', `%${nameFragment}%`)
      .eq('state', state)
      .limit(1)
      .single()
    const { data } = await q
    if (data) return data
  }

  // Fallback: name match without state
  const { data: fallback } = await supabaseAdmin
    .from('hospital_fap_urls')
    .select('hospital_name, system_name, is_nonprofit, fap_url, income_limit_fpl_percent')
    .ilike('hospital_name', `%${providerName.substring(0, 15)}%`)
    .limit(1)
    .single()

  return fallback ?? null
}

/**
 * Check for duplicate charges (same description billed multiple times)
 */
function detectDuplicates(lineItems: BillData['lineItems']): Set<number> {
  const seen = new Map<string, number>()
  const duplicates = new Set<number>()

  for (let i = 0; i < lineItems.length; i++) {
    const key = `${lineItems[i].code ?? lineItems[i].description.toLowerCase().trim()}`
    if (seen.has(key)) {
      duplicates.add(i)
      duplicates.add(seen.get(key)!)
    } else {
      seen.set(key, i)
    }
  }
  return duplicates
}

/**
 * Main analysis function — orchestrates OCR output into full AnalysisResult
 */
export async function analyzeBill(
  billData: BillData,
  income?: number,
  householdSize?: number
): Promise<AnalysisResult> {
  // Step 1: Identify codes for items without them
  const inferredCodes = await identifyCodes(billData.lineItems)

  // Merge codes into line items (for internal use only)
  const itemsWithCodes = billData.lineItems.map((item, idx) => ({
    ...item,
    code: item.code ?? inferredCodes.get(idx),
  }))

  // Step 2: Look up Medicare rates for all identified codes
  const codes = itemsWithCodes
    .map(item => item.code)
    .filter((c): c is string => !!c)
  const rateMap = await getMedicareRates(codes)

  // Step 3: Detect duplicates
  const duplicates = detectDuplicates(itemsWithCodes)

  // Step 4: Build analyzed line items (strip codes before returning)
  const analyzedItems: AnalyzedLineItem[] = itemsWithCodes.map((item, idx) => {
    const rate = item.code ? rateMap.get(item.code.toUpperCase()) : null
    const medicareRate = rate ? rate.nonFacilityRate : null
    const overchargeAmount =
      medicareRate != null ? Math.max(0, item.totalCharge - medicareRate) : null
    const overchargePercent =
      medicareRate != null && medicareRate > 0
        ? Math.round(((item.totalCharge - medicareRate) / medicareRate) * 100)
        : null

    const flags = []
    if (duplicates.has(idx)) {
      flags.push({
        type: 'duplicate' as const,
        explanation: `This charge appears more than once on your bill. Duplicate charges are a common billing error.`,
        severity: 'high' as const,
      })
    }
    if (overchargePercent != null && overchargePercent > 500) {
      flags.push({
        type: 'overcoding' as const,
        explanation: `This charge is more than ${overchargePercent}% above the Medicare rate — unusually high even for hospital pricing.`,
        severity: 'high' as const,
      })
    }

    return {
      description: item.description,
      // NOTE: item.code intentionally excluded from response (AMA copyright)
      billedAmount: item.totalCharge,
      medicareRate,
      overchargeAmount,
      overchargePercent,
      flags,
    }
  })

  // Step 5: Calculate summary
  const itemsWithRates = analyzedItems.filter(i => i.medicareRate != null)
  const totalMedicareRate = itemsWithRates.reduce(
    (sum, i) => sum + (i.medicareRate ?? 0),
    0
  )
  const totalOvercharge = Math.max(0, billData.totalBilled - totalMedicareRate)
  const overchargePercent =
    totalMedicareRate > 0
      ? Math.round(((billData.totalBilled - totalMedicareRate) / totalMedicareRate) * 100)
      : 0
  const errorsFound = analyzedItems.reduce((sum, i) => sum + i.flags.length, 0)

  // Step 6: Charity care check
  const hospitalData = await lookupHospital(
    billData.provider.name,
    billData.provider.state
  )
  const charityCare = buildCharityCareResult(
    hospitalData,
    income,
    householdSize,
    billData.provider.name
  )

  // Step 7: Log anonymous aggregate stats (no PII)
  await supabaseAdmin.from('bill_analyses').insert({
    total_billed: billData.totalBilled,
    total_savings: totalOvercharge,
    errors_found: errorsFound,
    charity_eligible: charityCare.eligible,
  })

  return {
    provider: {
      name: billData.provider.name,
      isNonprofit: hospitalData?.is_nonprofit ?? false,
      fapUrl: hospitalData?.fap_url ?? undefined,
    },
    lineItems: analyzedItems,
    summary: {
      totalBilled: billData.totalBilled,
      totalMedicareRate,
      totalOvercharge,
      overchargePercent,
      errorsFound,
      lineItemsAnalyzed: billData.lineItems.length,
      lineItemsWithRates: itemsWithRates.length,
    },
    charityCare,
    disclaimer:
      'This analysis is for informational purposes only and does not constitute medical or legal advice. Medicare rates are provided as a benchmark — actual fair prices vary. Consult a medical billing advocate or attorney before taking legal action.',
  }
}

function buildCharityCareResult(
  hospitalData: { is_nonprofit?: boolean; fap_url?: string; income_limit_fpl_percent?: number; hospital_name?: string } | null,
  income?: number,
  householdSize?: number,
  providerName?: string
): CharityCareResult {
  const isNonprofit = hospitalData?.is_nonprofit ?? false

  if (!isNonprofit) {
    return {
      eligible: false,
      hospitalIsNonprofit: false,
      explanation:
        'This appears to be a for-profit hospital. For-profit hospitals are not required to have charity care programs under federal law, though some states require it.',
      nextSteps: [
        'Call the billing department and ask if they have a financial hardship program',
        'Ask to speak with a financial counselor',
        'Negotiate a payment plan or lump-sum settlement',
      ],
    }
  }

  if (!income || !householdSize) {
    return {
      eligible: true,
      hospitalIsNonprofit: true,
      fapUrl: hospitalData?.fap_url,
      hospitalName: hospitalData?.hospital_name ?? providerName,
      explanation:
        'This is a nonprofit hospital. Under federal 501(r) law, they must have a Financial Assistance Policy and cannot charge more than the lowest negotiated rate to patients who qualify.',
      nextSteps: [
        'Call the billing department and ask about their Financial Assistance Program',
        'Income limits typically range from 200-400% of the Federal Poverty Level',
        hospitalData?.fap_url
          ? `View their Financial Assistance Policy at ${hospitalData.fap_url}`
          : 'Ask for their Financial Assistance Policy in writing',
        'Submit a financial assistance application — hospitals must process it before sending to collections',
      ],
    }
  }

  const fplPercent = getFPLPercent(income, householdSize)
  const incomeLimit = hospitalData?.income_limit_fpl_percent ?? 300 // default assumption
  const eligible = fplPercent <= incomeLimit

  return {
    eligible,
    hospitalIsNonprofit: true,
    fplPercent,
    fapUrl: hospitalData?.fap_url,
    hospitalName: hospitalData?.hospital_name ?? providerName,
    explanation: eligible
      ? `At ${fplPercent}% of the Federal Poverty Level, you likely qualify for financial assistance. This nonprofit hospital must have a charity care program under federal 501(r) law.`
      : `At ${fplPercent}% of the Federal Poverty Level, you may be above the typical threshold for free care, but you may still qualify for reduced-cost care or a negotiated settlement.`,
    nextSteps: eligible
      ? [
          'Request a financial assistance application immediately — do not pay the bill yet',
          hospitalData?.fap_url
            ? `Download their Financial Assistance Policy at ${hospitalData.fap_url}`
            : 'Ask the billing department for their Financial Assistance Policy',
          'Gather proof of income (pay stubs, tax return, benefit letters)',
          'Hospitals cannot send your bill to collections while a financial assistance application is pending',
        ]
      : [
          'Contact the billing department to ask about partial financial assistance',
          'Request a payment plan — interest-free plans are often available',
          'Ask about a self-pay discount (usually 20-40% off)',
          'Consider a medical billing advocate if the bill is over $5,000',
        ],
  }
}

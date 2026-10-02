import { supabaseAdmin } from '@/lib/supabase-admin'
import { llm, CODE_ID_PRIMARY, CODE_ID_FALLBACK } from '@/lib/llm'
import { getMedicareRates } from './cms-data'
import { classifyLine } from './code-router'
import { buildAnalyzedItems, buildSummary, type RoutedLine } from './summary'
import { buildCharityCareResult } from './charity'
import { isConfidentHospitalMatch, type HospitalRow } from './hospital-match'
import {
  type AnalysisResult,
  type BillData,
  type CodeSource,
  type NonprofitStatus,
} from './types'

/**
 * Orchestration only. The arithmetic lives in `summary.ts` and the charity
 * logic in `charity.ts`, both database-free so they can be proven on fixtures.
 */

/**
 * Identify likely HCPCS/CPT codes for line items that don't have visible codes.
 * These codes are backend-only — never returned to the client.
 *
 * A code we guessed is NOT the same fact as a code printed on the bill: a wrong
 * guess attaches a real Medicare rate to the wrong service. Every line
 * benchmarked off a guess is tracked as `inferred` and labeled all the way out.
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

const FAP_COLUMNS =
  'hospital_name, system_name, state, is_nonprofit, fap_url, income_limit_fpl_percent'

/**
 * Look up hospital nonprofit status from our database.
 *
 * Returns null on a miss OR on a match we would not stand behind — both mean
 * UNKNOWN, never for-profit. The `ilike` is a candidate search, not an answer;
 * `isConfidentHospitalMatch` decides, because a loose substring hit on this
 * small table lands on the wrong hospital more often than the right one.
 */
async function lookupHospital(providerName: string, state?: string) {
  const nameFragment = providerName.substring(0, 20)
  const candidates: Array<Record<string, unknown>> = []

  // Candidates in the bill's own state first.
  if (state) {
    const { data } = await supabaseAdmin
      .from('hospital_fap_urls')
      .select(FAP_COLUMNS)
      .ilike('hospital_name', `%${nameFragment}%`)
      .eq('state', state)
      .limit(5)
    if (data) candidates.push(...data)
  }

  // Then anywhere, for the case where the bill does not name a state.
  const { data: anywhere } = await supabaseAdmin
    .from('hospital_fap_urls')
    .select(FAP_COLUMNS)
    .ilike('hospital_name', `%${providerName.substring(0, 15)}%`)
    .limit(5)
  if (anywhere) candidates.push(...anywhere)

  for (const row of candidates) {
    if (isConfidentHospitalMatch(row as HospitalRow, providerName, state)) {
      return row as {
        hospital_name?: string
        is_nonprofit?: boolean
        fap_url?: string
        income_limit_fpl_percent?: number
      }
    }
  }

  return null
}

/**
 * Main analysis function — orchestrates OCR output into full AnalysisResult
 */
export async function analyzeBill(
  billData: BillData,
  income?: number,
  householdSize?: number
): Promise<AnalysisResult> {
  // Step 1: Identify codes for items without them, keeping provenance
  const inferredCodes = await identifyCodes(billData.lineItems)

  // Step 2: Route each line to the payment system that actually governs it
  const routed: RoutedLine[] = billData.lineItems.map((item, idx) => {
    const inferred = inferredCodes.get(idx)
    const code = item.code ?? inferred
    const codeSource: CodeSource = item.code
      ? 'printed'
      : inferred
        ? 'inferred'
        : 'none'
    return {
      description: item.description,
      code,
      codeSource,
      family: classifyLine(code, item.description),
      quantity: item.quantity,
      totalCharge: item.totalCharge,
    }
  })

  // Step 3: Look up Medicare rates — only for lines the router sent to PFS
  const pfsCodes = routed
    .filter(line => line.family === 'pfs')
    .map(line => line.code)
    .filter((c): c is string => !!c)
  const rateMap = await getMedicareRates(pfsCodes)

  // Step 4 + 5: per-line analysis and the summary roll-up
  const analyzedItems = buildAnalyzedItems(routed, rateMap)
  const summary = buildSummary(analyzedItems, {
    totalBilled: billData.totalBilled,
    insuranceAdjustment: billData.insuranceAdjustment,
    patientResponsibility: billData.patientResponsibility,
  })

  // Step 6: Charity care check
  const hospitalData = await lookupHospital(
    billData.provider.name,
    billData.provider.state
  )
  const nonprofitStatus: NonprofitStatus = !hospitalData
    ? 'unknown'
    : hospitalData.is_nonprofit
      ? 'nonprofit'
      : 'for_profit'

  const charityCare = buildCharityCareResult(
    nonprofitStatus,
    hospitalData,
    income,
    householdSize,
    billData.provider.name
  )

  // Step 7: Log anonymous aggregate stats (no PII)
  await supabaseAdmin.from('bill_analyses').insert({
    total_billed: billData.totalBilled,
    total_savings: summary.totalOvercharge,
    errors_found: summary.errorsFound,
    charity_eligible: charityCare.eligibility === 'likely',
  })

  return {
    provider: {
      name: billData.provider.name,
      nonprofitStatus,
      fapUrl: hospitalData?.fap_url ?? undefined,
    },
    lineItems: analyzedItems,
    summary,
    charityCare,
    disclaimer:
      'This analysis is an estimate for informational purposes only and is not medical, billing, or legal advice. It compares charges to Medicare physician fee schedule rates, which are a reference floor — not what your insurer pays and not what you owe. Consult a medical billing advocate or attorney before taking legal action.',
  }
}

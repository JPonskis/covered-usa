// Medical Bill Analyzer — Core Types

export interface BillLineItem {
  description: string
  code?: string // CPT/HCPCS if visible on bill — backend only, never sent to client
  quantity: number
  unitCharge: number
  totalCharge: number
  confidence: number // 0-1, how confident the OCR was
}

export interface BillData {
  provider: {
    name: string
    state?: string
    address?: string
  }
  patient: {
    name?: string
    address?: string
    accountNumber?: string
  }
  dateOfService?: string
  lineItems: BillLineItem[]
  totalBilled: number
  insuranceAdjustment?: number
  patientResponsibility?: number
}

export type ErrorFlag =
  | 'duplicate'
  | 'unbundled'
  | 'upcoding'
  | 'modifier_error'
  | 'overcoding'

export interface LineItemFlag {
  type: ErrorFlag
  explanation: string
  severity: 'high' | 'medium' | 'low'
}

/**
 * A hospital bill is several payment systems stapled together. Only `pfs`
 * (physician fee schedule) has a benchmark loaded today — every other family
 * is labeled unbenchmarked with a family-specific reason rather than being
 * silently priced against the wrong fee schedule.
 */
export type CodeFamily =
  | 'pfs'
  | 'anesthesia'
  | 'drug'
  | 'opps_facility'
  | 'lab'
  | 'dme'
  | 'ambulance'
  | 'inpatient_drg'
  | 'unknown'

/** Where the code we benchmarked against came from. */
export type CodeSource = 'printed' | 'inferred' | 'none'

/** Tri-state. A lookup miss is `unknown`, never `for_profit`. */
export type NonprofitStatus = 'nonprofit' | 'for_profit' | 'unknown'

/** Tri-state. Missing income or a missing published FPL limit is `unknown`. */
export type CharityEligibility = 'likely' | 'unlikely' | 'unknown'

/** What the dollar figures are measured against. */
export type AnalysisBasis =
  | 'gross'
  | 'post_insurance_adjustment'
  | 'patient_responsibility'

/** How much of the bill we were actually able to price. */
export type CoverageLevel = 'none' | 'low' | 'good'

export interface AnalyzedLineItem {
  description: string
  billedAmount: number
  quantity: number
  family: CodeFamily
  // NOTE: the code itself is intentionally never returned (AMA copyright).
  codeSource: CodeSource
  medicareRate: number | null
  /** Named benchmark, e.g. "Medicare physician fee schedule, facility rate". */
  benchmarkSource: string | null
  /** Why this line could not be benchmarked. Null when it was. */
  unbenchmarkedReason: string | null
  /** `estimated` when the code was inferred by the model, not printed on the bill. */
  benchmarkConfidence: 'high' | 'estimated' | null
  overchargeAmount: number | null
  overchargePercent: number | null
  flags: LineItemFlag[]
}

export interface CharityCareResult {
  eligibility: CharityEligibility
  nonprofitStatus: NonprofitStatus
  fplPercent?: number
  /** The hospital's published FPL cutoff, when we have one on file. */
  incomeLimitFplPercent?: number
  explanation: string
  nextSteps: string[]
  fapUrl?: string
  hospitalName?: string
}

export interface AnalysisSummary {
  totalBilled: number
  /** Sum of billed charges on benchmarked lines only. */
  totalBenchmarkedBilled: number
  /** Sum of Medicare benchmarks on benchmarked lines only. */
  totalMedicareRate: number
  /** Sum of billed charges we could NOT benchmark. */
  totalUnbenchmarked: number
  unbenchmarkedCount: number
  /**
   * Sum of per-line overcharge over BENCHMARKED LINES ONLY.
   * Never `totalBilled - totalMedicareRate` — that mixes denominators and
   * turns every unpriced line's full charge into phantom overcharge.
   */
  totalOvercharge: number
  /** totalOvercharge / totalMedicareRate — both rated-only, so they match. */
  overchargePercent: number
  /** Low end: charges above a defensible fair-cash ceiling (FAIR_CASH_MULTIPLE x Medicare). */
  overchargeRangeLow: number
  /** High end: charges above the raw Medicare rate. Equals totalOvercharge. */
  overchargeRangeHigh: number
  errorsFound: number
  lineItemsAnalyzed: number
  lineItemsWithRates: number
  coverageLevel: CoverageLevel
  insuranceAdjustment?: number
  patientResponsibility?: number
  analysisBasis: AnalysisBasis
}

export interface AnalysisResult {
  provider: {
    name: string
    nonprofitStatus: NonprofitStatus
    fapUrl?: string
  }
  lineItems: AnalyzedLineItem[]
  summary: AnalysisSummary
  charityCare: CharityCareResult
  disclaimer: string
}

export interface DisputeLetter {
  text: string
  generatedAt: string
}

/**
 * Commercial insurers pay roughly 224-254% of Medicare for hospital services
 * (RAND Hospital Price Transparency Study, round 5). A cash price at or under
 * ~2.5x Medicare is therefore defensible, so only the amount above that
 * ceiling is the conservative end of the overcharge range.
 */
export const FAIR_CASH_MULTIPLE = 2.5

/**
 * Charges above this multiple of the Medicare facility rate are far beyond any
 * defensible commercial or cash ceiling. Set deliberately high because the
 * benchmark is the FACILITY column (lower than non-facility), which inflates
 * every percentage, and because a flag here becomes a question in a letter a
 * real person mails to a hospital.
 */
export const OVERCODING_MULTIPLE = 10

// FPL thresholds 2026 (HHS)
export const FPL_2026: Record<number, number> = {
  1: 15650,
  2: 21150,
  3: 26650,
  4: 32150,
  5: 37650,
  6: 43150,
  7: 48650,
  8: 54150,
}

export function getFPL(householdSize: number): number {
  const capped = Math.min(Math.max(householdSize, 1), 8)
  return FPL_2026[capped] ?? FPL_2026[8] + (householdSize - 8) * 5500
}

export function getFPLPercent(income: number, householdSize: number): number {
  return Math.round((income / getFPL(householdSize)) * 100)
}

/** Plain-language label for the basis of every dollar figure in a result. */
export function basisLabel(summary: AnalysisSummary): string {
  switch (summary.analysisBasis) {
    case 'patient_responsibility':
      return 'Based on what you owe after insurance.'
    case 'post_insurance_adjustment':
      return 'Based on gross charges. Your insurance adjustment has been applied to the total, but not to individual charges.'
    default:
      return 'Based on gross charges, not what you owe after insurance.'
  }
}

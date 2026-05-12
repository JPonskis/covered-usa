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

export interface AnalyzedLineItem {
  description: string
  billedAmount: number
  medicareRate: number | null
  overchargeAmount: number | null
  overchargePercent: number | null
  flags: LineItemFlag[]
}

export interface CharityCareResult {
  eligible: boolean
  hospitalIsNonprofit: boolean
  fplPercent?: number
  explanation: string
  nextSteps: string[]
  fapUrl?: string
  hospitalName?: string
}

export interface AnalysisSummary {
  totalBilled: number
  totalMedicareRate: number
  totalOvercharge: number
  overchargePercent: number
  errorsFound: number
  lineItemsAnalyzed: number
  lineItemsWithRates: number
}

export interface AnalysisResult {
  provider: {
    name: string
    isNonprofit: boolean
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

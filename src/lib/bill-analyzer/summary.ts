import type { MedicareRate } from './cms-data'
import { getBenchmark } from './benchmark'
import {
  type AnalysisBasis,
  type AnalysisSummary,
  type AnalyzedLineItem,
  type CodeFamily,
  type CodeSource,
  type CoverageLevel,
  type LineItemFlag,
  FAIR_CASH_MULTIPLE,
  OVERCODING_MULTIPLE,
} from './types'

/**
 * The arithmetic of the analysis, with no database in it, so it can be proven
 * on fixtures. The headline figure this file produces is the single number the
 * whole tool is judged on, and the bug it exists to prevent is specific:
 * `totalBilled - partialBenchmarkSum` turns every charge we could not price
 * into phantom overcharge.
 */

export interface RoutedLine {
  description: string
  code?: string
  codeSource: CodeSource
  family: CodeFamily
  quantity: number
  totalCharge: number
}

/**
 * Families where the same code appearing twice on one bill is routine, not
 * suspicious: two doses of a drug, two draws of the same lab, two of the same
 * supply. Flagging these as duplicates is a false accusation that ends up in a
 * letter a real person mails to a hospital.
 */
export const REPEAT_LEGIT_FAMILIES = new Set<CodeFamily>([
  'drug',
  'lab',
  'dme',
  'ambulance',
])

/**
 * Group lines that share a code (or, with no code, an identical description).
 * Returns one entry per repeated group — NOT one per line — so a pair counts
 * as a single finding instead of two.
 */
export function findRepeatGroups(
  items: Array<{ code?: string; description: string; family: CodeFamily }>
): Array<{ indices: number[]; family: CodeFamily }> {
  const groups = new Map<string, number[]>()

  for (let i = 0; i < items.length; i++) {
    const key = items[i].code
      ? `code:${items[i].code!.toUpperCase()}`
      : `desc:${items[i].description.toLowerCase().replace(/\s+/g, ' ').trim()}`
    const existing = groups.get(key)
    if (existing) existing.push(i)
    else groups.set(key, [i])
  }

  const repeats: Array<{ indices: number[]; family: CodeFamily }> = []
  for (const indices of groups.values()) {
    if (indices.length < 2) continue
    repeats.push({ indices, family: items[indices[0]].family })
  }
  return repeats
}

function repeatFlags(routed: RoutedLine[]): Map<number, LineItemFlag> {
  const byIndex = new Map<number, LineItemFlag>()

  for (const group of findRepeatGroups(routed)) {
    if (REPEAT_LEGIT_FAMILIES.has(group.family)) continue

    const count = group.indices.length
    // The flag goes on the second and later occurrences only, so one repeated
    // pair contributes one finding to errorsFound rather than two.
    for (const idx of group.indices.slice(1)) {
      byIndex.set(idx, {
        type: 'duplicate',
        explanation: `This charge appears ${count} times on your bill. Repeats are sometimes legitimate — ask the billing department to confirm this is not one service billed more than once.`,
        severity: group.family === 'pfs' ? 'medium' : 'low',
      })
    }
  }

  return byIndex
}

export function buildAnalyzedItems(
  routed: RoutedLine[],
  rateMap: Map<string, MedicareRate>
): AnalyzedLineItem[] {
  const flagsByIndex = repeatFlags(routed)

  return routed.map((item, idx) => {
    const rate = item.code ? rateMap.get(item.code.toUpperCase()) : null
    const benchmark = getBenchmark(item.family, rate, item.quantity)

    const medicareRate = benchmark.benchmarked ? benchmark.amount : null
    const overchargeAmount =
      medicareRate != null ? Math.max(0, item.totalCharge - medicareRate) : null
    const overchargePercent =
      medicareRate != null && medicareRate > 0
        ? Math.round(((item.totalCharge - medicareRate) / medicareRate) * 100)
        : null

    const flags: LineItemFlag[] = []
    const repeatFlag = flagsByIndex.get(idx)
    if (repeatFlag) flags.push(repeatFlag)

    // An overcoding flag becomes a question in a mailed letter, so it only
    // fires on a code PRINTED on the bill — never on one we guessed — and only
    // well above any defensible commercial or cash multiple of Medicare.
    if (
      item.codeSource === 'printed' &&
      medicareRate != null &&
      medicareRate > 0 &&
      item.totalCharge > medicareRate * OVERCODING_MULTIPLE
    ) {
      const multiple = (item.totalCharge / medicareRate).toFixed(1)
      flags.push({
        type: 'overcoding',
        explanation: `This charge is about ${multiple} times the Medicare rate for the same service — high enough to be worth asking about.`,
        severity: 'medium',
      })
    }

    return {
      description: item.description,
      // NOTE: item.code intentionally excluded from response (AMA copyright)
      billedAmount: item.totalCharge,
      quantity: item.quantity,
      family: item.family,
      codeSource: item.codeSource,
      medicareRate,
      benchmarkSource: benchmark.benchmarked ? benchmark.source : null,
      unbenchmarkedReason: benchmark.benchmarked ? null : benchmark.reason,
      benchmarkConfidence: benchmark.benchmarked
        ? item.codeSource === 'inferred'
          ? 'estimated'
          : 'high'
        : null,
      overchargeAmount,
      overchargePercent,
      flags,
    }
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function buildSummary(
  analyzedItems: AnalyzedLineItem[],
  bill: {
    totalBilled: number
    insuranceAdjustment?: number
    patientResponsibility?: number
  }
): AnalysisSummary {
  const benchmarked = analyzedItems.filter(i => i.medicareRate != null)
  const unbenchmarked = analyzedItems.filter(i => i.medicareRate == null)

  const totalMedicareRate = round2(
    benchmarked.reduce((sum, i) => sum + (i.medicareRate ?? 0), 0)
  )
  const totalBenchmarkedBilled = round2(
    benchmarked.reduce((sum, i) => sum + i.billedAmount, 0)
  )
  const totalUnbenchmarked = round2(
    unbenchmarked.reduce((sum, i) => sum + i.billedAmount, 0)
  )

  // THE headline. Sum of per-line overcharges on benchmarked lines only.
  let totalOvercharge = round2(
    benchmarked.reduce((sum, i) => sum + (i.overchargeAmount ?? 0), 0)
  )
  // Conservative end of the range: only charges above a defensible fair-cash
  // ceiling, and only on lines whose code was printed on the bill.
  let overchargeRangeLow = round2(
    benchmarked
      .filter(i => i.codeSource === 'printed')
      .reduce(
        (sum, i) =>
          sum +
          Math.max(0, i.billedAmount - (i.medicareRate ?? 0) * FAIR_CASH_MULTIPLE),
        0
      )
  )

  // You cannot save more than you owe, so a stated patient responsibility is
  // the ceiling on both ends of the range.
  const patientResponsibility =
    bill.patientResponsibility != null && bill.patientResponsibility >= 0
      ? bill.patientResponsibility
      : undefined
  const insuranceAdjustment =
    bill.insuranceAdjustment != null && bill.insuranceAdjustment > 0
      ? bill.insuranceAdjustment
      : undefined
  // A "patient responsibility" equal to the whole bill means no insurance
  // touched it. Calling that basis "after insurance" would be a false
  // reassurance, so it stays gross — the cap below still applies either way.
  const insuranceReducedIt =
    patientResponsibility != null && patientResponsibility < bill.totalBilled
  const analysisBasis: AnalysisBasis = insuranceReducedIt
    ? 'patient_responsibility'
    : insuranceAdjustment
      ? 'post_insurance_adjustment'
      : 'gross'

  if (patientResponsibility != null) {
    totalOvercharge = Math.min(totalOvercharge, patientResponsibility)
    overchargeRangeLow = Math.min(overchargeRangeLow, patientResponsibility)
  }
  overchargeRangeLow = Math.min(overchargeRangeLow, totalOvercharge)

  const overchargePercent =
    totalMedicareRate > 0
      ? Math.round((totalOvercharge / totalMedicareRate) * 100)
      : 0

  const lineItemsAnalyzed = analyzedItems.length
  const lineItemsWithRates = benchmarked.length
  const coverageLevel: CoverageLevel =
    lineItemsWithRates === 0
      ? 'none'
      : lineItemsWithRates / Math.max(1, lineItemsAnalyzed) < 0.5
        ? 'low'
        : 'good'

  return {
    totalBilled: bill.totalBilled,
    totalBenchmarkedBilled,
    totalMedicareRate,
    totalUnbenchmarked,
    unbenchmarkedCount: unbenchmarked.length,
    totalOvercharge,
    overchargePercent,
    overchargeRangeLow,
    overchargeRangeHigh: totalOvercharge,
    errorsFound: analyzedItems.reduce((sum, i) => sum + i.flags.length, 0),
    lineItemsAnalyzed,
    lineItemsWithRates,
    coverageLevel,
    insuranceAdjustment,
    patientResponsibility,
    analysisBasis,
  }
}

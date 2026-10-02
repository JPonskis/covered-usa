import type { AnalysisResult } from './types'

/**
 * Nothing leaves the building with a dollar figure we cannot trace.
 *
 * The email and the dispute letter are the two artifacts a real person
 * forwards, prints, and mails to a hospital. Every dollar amount in them must
 * be one of: a per-line billed charge, a per-line Medicare benchmark, a
 * per-line overcharge, the reconciled headline range, the unbenchmarked
 * subtotal, the bill total, or what the patient actually owes. A stray
 * whole-bill figure dressed up as savings is the exact failure this guard
 * exists to catch.
 */
export function buildAllowedFigures(analysis: AnalysisResult): Set<number> {
  const { summary, lineItems } = analysis
  const allowed = new Set<number>()

  const add = (n: number | null | undefined) => {
    if (n == null || !Number.isFinite(n)) return
    allowed.add(Math.round(n))
  }

  add(summary.totalBilled)
  add(summary.totalBenchmarkedBilled)
  add(summary.totalMedicareRate)
  add(summary.totalUnbenchmarked)
  add(summary.totalOvercharge)
  add(summary.overchargeRangeLow)
  add(summary.overchargeRangeHigh)
  add(summary.patientResponsibility)
  add(summary.insuranceAdjustment)

  for (const item of lineItems) {
    add(item.billedAmount)
    add(item.medicareRate)
    add(item.overchargeAmount)
  }

  return allowed
}

/** Every dollar amount in a string, as rounded numbers. */
export function extractDollarFigures(text: string): number[] {
  const matches = text.match(/\$\s?[\d,]+(?:\.\d{1,2})?/g) ?? []
  return matches
    .map(m => Number(m.replace(/[$,\s]/g, '')))
    .filter(n => Number.isFinite(n))
    .map(n => Math.round(n))
}

export interface ScrubResult {
  ok: boolean
  /** Figures in the text that are not traceable to the analysis. */
  violations: number[]
}

/**
 * Assert that `text` contains no untraceable dollar figure. Small amounts are
 * ignored because real letters legitimately contain thresholds and fees (the
 * $400 Good Faith Estimate dispute right, a $25 records fee) that are facts
 * about the law rather than claims about this bill.
 */
export function scrubOutbound(
  text: string,
  allowed: Set<number>,
  { ignoreBelow = 0 }: { ignoreBelow?: number } = {}
): ScrubResult {
  const violations: number[] = []
  for (const figure of extractDollarFigures(text)) {
    if (figure < ignoreBelow) continue
    if (allowed.has(figure)) continue
    // Tolerate rounding drift of a dollar either way.
    if (allowed.has(figure - 1) || allowed.has(figure + 1)) continue
    violations.push(figure)
  }
  return { ok: violations.length === 0, violations }
}

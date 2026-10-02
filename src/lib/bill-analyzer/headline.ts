import type { AnalysisSummary } from './types'

/**
 * One source of truth for the copy around every dollar figure, shared by the
 * embedded renderer, the standalone results page, the email, and the letter —
 * so no surface can drift into a more confident claim than another.
 */

export function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** "We compared 2 of 15 charges to a federal benchmark." */
export function coverageSentence(summary: AnalysisSummary): string {
  const { lineItemsWithRates: n, lineItemsAnalyzed: m } = summary
  if (m === 0) return 'We did not find any charges to compare.'
  if (n === 0) {
    return `We could not compare any of the ${m} charge${m === 1 ? '' : 's'} on this bill to a federal benchmark.`
  }
  return `We compared ${n} of ${m} charge${m === 1 ? '' : 's'} to a federal benchmark.`
}

/** The label above the headline figure. Scoped, never a whole-bill verdict. */
export function headlineLabel(summary: AnalysisSummary): string {
  const n = summary.lineItemsWithRates
  return `Above the Medicare rate on the ${n} priced charge${n === 1 ? '' : 's'} (estimate)`
}

/**
 * The headline figure as a range. The high end is the amount above the raw
 * Medicare facility rate; the low end is the amount above a defensible
 * fair-cash ceiling of 2.5x Medicare, counting only codes printed on the bill.
 * Returns null when there is nothing honest to put a number on.
 */
export function headlineRange(summary: AnalysisSummary): string | null {
  if (summary.coverageLevel === 'none' || summary.overchargeRangeHigh <= 0) {
    return null
  }
  const low = summary.overchargeRangeLow
  const high = summary.overchargeRangeHigh
  if (low <= 0) return `up to ${money(high)}`
  if (Math.round(low) === Math.round(high)) return money(high)
  return `${money(low)} to ${money(high)}`
}

/** The sentence that explains what the headline range actually means. */
export function headlineExplanation(summary: AnalysisSummary): string {
  const range = headlineRange(summary)
  if (!range) {
    return 'We could not price enough of this bill to estimate an overcharge. That does not mean the charges are correct — it means we have no benchmark for them yet.'
  }
  return `These ${summary.lineItemsWithRates} charge${summary.lineItemsWithRates === 1 ? '' : 's'} run about ${range} above the Medicare physician rate. Medicare is a reference floor, not a fair price and not what you owe — treat this as a starting point for questions.`
}

/** The unbenchmarked bucket copy, so the bill reconciles on screen. */
export function unbenchmarkedSentence(summary: AnalysisSummary): string | null {
  if (summary.unbenchmarkedCount === 0) return null
  const n = summary.unbenchmarkedCount
  const one = n === 1
  return `We could not price ${n} charge${one ? '' : 's'} totaling ${money(summary.totalUnbenchmarked)}. That does not mean ${one ? 'it is' : 'they are'} correct — ${one ? 'it' : 'they'} may still be worth questioning. Facility fees, lab tests, drugs, and anesthesia are paid on separate fee schedules we have not loaded yet.`
}

/** Shown wherever results appear, so nobody reads this as a determination. */
export const WHAT_THIS_IS =
  'This is an estimate built from Medicare physician fee schedule rates — a starting point for questions, not a legal determination and not what you owe. We cannot see your insurer’s negotiated rates or your final balance.'

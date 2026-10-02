import type { CodeFamily } from './types'
import type { MedicareRate } from './cms-data'
import { unbenchmarkedReasonFor } from './code-router'

export type BenchmarkResult =
  | { benchmarked: true; amount: number; source: string }
  | { benchmarked: false; reason: string }

/** Human-readable name of the only benchmark we have loaded. */
export const PFS_FACILITY_SOURCE =
  'Medicare physician fee schedule, facility rate (national)'

/**
 * A handful of rows in `medicare_rates` carry a non-facility value that is
 * orders of magnitude off the facility value (0446T: facility 54.67,
 * non-facility 5846.63 — a ~107x split from practice-expense and global-period
 * artifacts). We benchmark against the facility column because a hospital bill
 * is a facility setting, which sidesteps that noise; this guard catches the
 * mirror case where the facility value itself is the broken one.
 */
const ARTIFACT_RATIO = 20

/**
 * Price one line. Only PFS resolves today; every other family returns a
 * labeled refusal so the UI can say what it could not price and why, instead
 * of showing a bare null that reads like "nothing wrong here".
 */
export function getBenchmark(
  family: CodeFamily,
  rate: MedicareRate | null | undefined,
  quantity: number
): BenchmarkResult {
  if (family !== 'pfs') {
    return { benchmarked: false, reason: unbenchmarkedReasonFor(family) }
  }

  if (!rate) {
    return { benchmarked: false, reason: unbenchmarkedReasonFor('pfs') }
  }

  const facility = Number(rate.facilityRate)
  const nonFacility = Number(rate.nonFacilityRate)

  // No usable facility rate. Do NOT fall back to the non-facility column —
  // it is the wrong setting for a hospital bill and it is the noisy one.
  if (!Number.isFinite(facility) || facility <= 0) {
    return {
      benchmarked: false,
      reason:
        'Medicare publishes no facility-setting rate for this service, so we have nothing to compare it to.',
    }
  }

  // Facility wildly above non-facility is the artifact pattern inverted.
  if (
    Number.isFinite(nonFacility) &&
    nonFacility > 0 &&
    facility / nonFacility > ARTIFACT_RATIO
  ) {
    return {
      benchmarked: false,
      reason:
        'The published Medicare rates for this service are inconsistent, so we left it out rather than compare against a bad number.',
    }
  }

  // Rates are per unit of service; the bill charges per unit too.
  const units = Number.isFinite(quantity) && quantity > 0 ? quantity : 1

  return {
    benchmarked: true,
    amount: Math.round(facility * units * 100) / 100,
    source: PFS_FACILITY_SOURCE,
  }
}

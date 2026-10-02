/**
 * Decide whether a row from `hospital_fap_urls` is really the hospital on the
 * bill.
 *
 * This matters more than it looks. The table holds a small slice of US
 * hospitals, so a loose `ilike` on a 20-character prefix hits the WRONG
 * hospital far more often than the right one — a bill reading "Valley Medical
 * Center" matched "Valley Medical Center Phoenix" and the tool then quoted
 * that hospital's financial assistance URL and its 300% cutoff, and told the
 * user they likely qualified. A confident answer about the wrong hospital is
 * worse than no answer, so a weak match resolves to unknown.
 */

const GENERIC_TOKENS = new Set([
  'the', 'a', 'of', 'at', 'and',
  'hospital', 'hospitals', 'medical', 'center', 'centre', 'health',
  'healthcare', 'system', 'systems', 'inc', 'llc', 'corp', 'corporation',
  'regional', 'memorial', 'community', 'general',
])

export function normalizeHospitalName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    // Apostrophes vanish rather than splitting a word, so "St. Luke's" and
    // "St Lukes" are the same hospital.
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The tokens that actually identify a hospital, generic words removed. */
export function distinctiveTokens(name: string): string[] {
  return normalizeHospitalName(name)
    .split(' ')
    .filter(t => t.length > 1 && !GENERIC_TOKENS.has(t))
}

export interface HospitalRow {
  hospital_name?: string
  state?: string
}

/**
 * `true` only when we would stand behind quoting this row's policy to the
 * person holding the bill.
 *
 * - Names that normalize to the same string are the same hospital.
 * - Otherwise the state has to agree AND every distinctive word on the bill
 *   has to appear in the stored name, so "Valley Medical Center" can match
 *   "Valley Medical Center" in the same state but never "Valley Medical
 *   Center Phoenix" in another one.
 */
export function isConfidentHospitalMatch(
  row: HospitalRow | null | undefined,
  billProviderName: string,
  billState?: string
): boolean {
  if (!row?.hospital_name) return false

  const rowNorm = normalizeHospitalName(row.hospital_name)
  const billNorm = normalizeHospitalName(billProviderName)
  if (!rowNorm || !billNorm) return false

  if (rowNorm === billNorm) return true

  // Different names: only trust it when the state agrees.
  if (!billState || !row.state) return false
  if (billState.trim().toUpperCase() !== row.state.trim().toUpperCase()) return false

  const billTokens = distinctiveTokens(billProviderName)
  if (billTokens.length === 0) return false

  const rowTokens = new Set(distinctiveTokens(row.hospital_name))
  return billTokens.every(t => rowTokens.has(t))
}

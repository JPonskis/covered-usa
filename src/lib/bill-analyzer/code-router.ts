import type { CodeFamily } from './types'

/**
 * Classify a bill line into the payment system that actually governs it.
 *
 * A hospital bill is several fee schedules stapled together. Only the
 * physician fee schedule (PFS) is loaded in `medicare_rates` today, so the
 * point of this router is NOT to price more lines — it is to stop pricing
 * non-PFS lines against PFS rates, and to say out loud why a line has no
 * benchmark instead of returning a bare null.
 *
 * Rules follow the CMS code families: HCPCS letter prefixes and the CPT
 * numeric ranges, plus UB-04 revenue codes when the bill carries them.
 */

/** UB-04 revenue code prefixes → family. Longest match wins. */
const REVENUE_CODE_FAMILIES: Array<[string, CodeFamily]> = [
  ['0250', 'drug'],
  ['0251', 'drug'],
  ['0252', 'drug'],
  ['0253', 'drug'],
  ['0254', 'drug'],
  ['0255', 'drug'],
  ['0256', 'drug'],
  ['0257', 'drug'],
  ['0258', 'drug'],
  ['0259', 'drug'],
  ['0636', 'drug'],
  ['0300', 'lab'],
  ['0301', 'lab'],
  ['0302', 'lab'],
  ['0305', 'lab'],
  ['0306', 'lab'],
  ['0307', 'lab'],
  ['0310', 'lab'],
  ['0311', 'lab'],
  ['0312', 'lab'],
  ['0314', 'lab'],
  ['0320', 'opps_facility'],
  ['0350', 'opps_facility'],
  ['0352', 'opps_facility'],
  ['0360', 'opps_facility'],
  ['0361', 'opps_facility'],
  ['0370', 'anesthesia'],
  ['0371', 'anesthesia'],
  ['0450', 'opps_facility'],
  ['0451', 'opps_facility'],
  ['0452', 'opps_facility'],
  ['0456', 'opps_facility'],
  ['0459', 'opps_facility'],
  ['0540', 'ambulance'],
  ['0541', 'ambulance'],
  ['0542', 'ambulance'],
  ['0543', 'ambulance'],
  ['0544', 'ambulance'],
  ['0545', 'ambulance'],
  ['0546', 'ambulance'],
  ['0547', 'ambulance'],
  ['0548', 'ambulance'],
  ['0120', 'inpatient_drg'],
  ['0121', 'inpatient_drg'],
  ['0122', 'inpatient_drg'],
  ['0123', 'inpatient_drg'],
  ['0124', 'inpatient_drg'],
  ['0200', 'inpatient_drg'],
  ['0201', 'inpatient_drg'],
  ['0202', 'inpatient_drg'],
  ['0203', 'inpatient_drg'],
]

/** Description keywords that identify a family when no usable code is present. */
const DESCRIPTION_HINTS: Array<[RegExp, CodeFamily]> = [
  [/\banesthes/i, 'anesthesia'],
  [/\bcrna\b/i, 'anesthesia'],
  [/\b(ambulance|paramedic|als|bls)\b/i, 'ambulance'],
  [/\b(lab|laboratory|panel|culture|urinalysis|venipuncture|blood draw|cbc|metabolic|specimen)\b/i, 'lab'],
  [/\b(pharmacy|injection of|iv push|infusion of|vial|mg\/ml|saline|dose)\b/i, 'drug'],
  [/\b(room (and|&) board|semi-?private|icu|daily room|bed charge)\b/i, 'inpatient_drg'],
  [/\b(facility fee|emergency (room|dept|department)|er visit|operating room|recovery room|treatment room)\b/i, 'opps_facility'],
  [/\b(wheelchair|walker|crutch|brace|orthotic|prosthe|cpap|nebulizer|oxygen|supplies?)\b/i, 'dme'],
]

export function classifyLine(
  code: string | undefined,
  description: string,
  revenueCode?: string
): CodeFamily {
  const c = code?.trim().toUpperCase() ?? ''

  // 1. HCPCS Level II letter prefixes — unambiguous.
  if (/^[A-Z]\d{4}$/.test(c)) {
    const letter = c[0]
    const numeric = Number(c.slice(1))
    if (letter === 'J') return 'drug'
    if (letter === 'Q' || letter === 'C') return 'drug'
    if (letter === 'E' || letter === 'K' || letter === 'L') return 'dme'
    if (letter === 'A') {
      // A0021-A0999 is transport; the rest of the A range is supplies.
      return numeric <= 999 ? 'ambulance' : 'dme'
    }
    if (letter === 'P') return 'lab'
    if (letter === 'G') {
      // G0027-G0107 and the G0300s are lab/screening; the rest are procedures.
      return numeric <= 499 ? 'lab' : 'pfs'
    }
    if (letter === 'V') return 'dme'
    return 'unknown'
  }

  // 2. CPT numeric ranges.
  if (/^\d{5}$/.test(c)) {
    const n = Number(c)
    if (n >= 100 && n <= 1999) return 'anesthesia'
    if (n >= 80000 && n <= 89999) return 'lab'
    if (n >= 10000 && n <= 79999) return 'pfs'
    if (n >= 90000 && n <= 99999) return 'pfs'
    return 'unknown'
  }

  // 3. Revenue code, when the bill is a UB-04 and the line has no CPT.
  if (revenueCode) {
    const rc = revenueCode.trim().padStart(4, '0')
    for (const [prefix, family] of REVENUE_CODE_FAMILIES) {
      if (rc === prefix) return family
    }
  }

  // 4. Last resort: what the line says it is.
  for (const [pattern, family] of DESCRIPTION_HINTS) {
    if (pattern.test(description)) return family
  }

  return 'unknown'
}

/**
 * Why a line in this family has no benchmark. Shown to the user verbatim, so
 * it has to be true and plain: these fee schedules are not loaded, which is a
 * gap in our data, not a verdict on the charge.
 */
export function unbenchmarkedReasonFor(family: CodeFamily): string {
  switch (family) {
    case 'anesthesia':
      return 'Anesthesia is paid on base units times time, not a flat fee schedule rate. We cannot price it yet.'
    case 'drug':
      return 'Drugs and injections are paid on the Medicare average sales price list, which we have not loaded yet.'
    case 'lab':
      return 'Lab tests are paid on the Clinical Laboratory Fee Schedule, which we have not loaded yet.'
    case 'dme':
      return 'Equipment and supplies are paid on the DMEPOS fee schedule, which we have not loaded yet.'
    case 'ambulance':
      return 'Ambulance trips are paid on the Ambulance Fee Schedule, which we have not loaded yet.'
    case 'opps_facility':
      return 'Facility and emergency-room charges are paid per outpatient payment group, not per physician code. We cannot price them yet.'
    case 'inpatient_drg':
      return 'Inpatient room and board is paid as one bundled amount for the whole stay, so there is no per-line rate to compare.'
    case 'pfs':
      return 'This service is in the physician fee schedule but we could not find a published rate for it.'
    default:
      return 'We could not match this charge to a billing code, so we have no rate to compare it to.'
  }
}

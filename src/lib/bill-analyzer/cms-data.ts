import { supabaseAdmin } from '@/lib/supabase-admin'

export interface MedicareRate {
  hcpcsCode: string
  modifier: string
  facilityRate: number
  nonFacilityRate: number
  description: string
}

/**
 * Look up the Medicare national payment rate for a HCPCS/CPT code.
 * Codes are used backend-only — never exposed to users (AMA copyright).
 */
export async function getMedicareRate(
  code: string,
  modifier?: string
): Promise<MedicareRate | null> {
  const mod = modifier ?? ''

  const { data, error } = await supabaseAdmin
    .from('medicare_rates')
    .select('hcpcs_code, modifier, facility_rate, non_facility_rate, description')
    .eq('hcpcs_code', code.toUpperCase())
    .eq('modifier', mod.toUpperCase())
    .single()

  if (error || !data) {
    // Try without modifier if no match found
    if (mod) {
      const { data: fallback } = await supabaseAdmin
        .from('medicare_rates')
        .select('hcpcs_code, modifier, facility_rate, non_facility_rate, description')
        .eq('hcpcs_code', code.toUpperCase())
        .eq('modifier', '')
        .single()

      if (!fallback) return null
      return {
        hcpcsCode: fallback.hcpcs_code,
        modifier: fallback.modifier,
        facilityRate: Number(fallback.facility_rate),
        nonFacilityRate: Number(fallback.non_facility_rate),
        description: fallback.description,
      }
    }
    return null
  }

  return {
    hcpcsCode: data.hcpcs_code,
    modifier: data.modifier,
    facilityRate: Number(data.facility_rate),
    nonFacilityRate: Number(data.non_facility_rate),
    description: data.description,
  }
}

/**
 * Batch lookup for multiple codes at once (more efficient than individual calls)
 */
export async function getMedicareRates(
  codes: string[]
): Promise<Map<string, MedicareRate>> {
  const upperCodes = codes.map(c => c.toUpperCase())

  const { data, error } = await supabaseAdmin
    .from('medicare_rates')
    .select('hcpcs_code, modifier, facility_rate, non_facility_rate, description')
    .in('hcpcs_code', upperCodes)
    .eq('modifier', '')

  if (error || !data) return new Map()

  const result = new Map<string, MedicareRate>()
  for (const row of data) {
    result.set(row.hcpcs_code, {
      hcpcsCode: row.hcpcs_code,
      modifier: row.modifier,
      facilityRate: Number(row.facility_rate),
      nonFacilityRate: Number(row.non_facility_rate),
      description: row.description,
    })
  }
  return result
}

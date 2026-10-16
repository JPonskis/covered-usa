/**
 * Normalized state data interface for benefits eligibility
 * Contains all state-specific program information
 */

export interface StateData {
  state: {
    name: string;                    // "California"
    abbreviation: string;            // "CA"
    fips: string;                    // "06"
    medicaidExpansion: boolean;      // true
    mainPortal: string;              // "https://www.coveredca.com"
    generalPhone: string;            // "(800) 300-1506"
  };

  fpl: {
    // Federal Poverty Level - same for most states, higher for AK/HI
    adjustment: number;              // 1.0 for 48 states, 1.25 for AK, 1.15 for HI
  };

  smi: {
    // State Median Income by household size (annual)
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
    "6": number;
    perAdditional?: number;          // Increment for 7+ person households
  };

  /**
   * Medicaid/CHIP income limits, as % of the CURRENT poverty guidelines.
   *
   * CONVENTION (eligibility audit 2026-10, item A5A6A7): every limit is stored INCLUDING the
   * 5-point MAGI disregard (42 CFR 435.603(d)(4)), the way KFF publishes them and the way the
   * adult 138 already is. A state whose own chart prints the limit without the disregard
   * (Delaware 212, Massachusetts 300, Tennessee 250) is stored as published + 5. A state whose
   * chart already carries it (Oklahoma 211, Alabama 317, Maryland 264) is stored as printed.
   * Tell the two apart by the state's own adult row: if it reads 138, the chart includes it.
   *
   * These rows are identical to BenefitsUSA's (its commit 9ea08f27), and
   * scripts/check-medicaid-state-limits.mjs pins them, so the two sites cannot drift.
   */
  medicaid: {
    localName: string;               // "Medi-Cal"
    applicationUrl: string;
    phone: string;
    /** 138 in expansion states. A non-expansion state's own adult limit where it has one
     *  (Wisconsin BadgerCare Plus 100, Georgia Pathways 100), otherwise 0. */
    adultLimitFpl: number;
    /** The TOP of children's coverage, Medicaid and CHIP combined. chip.ts reads it as the
     *  CHIP ceiling; medicaid.ts as the children's limit. */
    childLimitFpl: number;
    /** The highest public coverage a pregnant woman can get: Medicaid, CHIP, or the
     *  unborn-child option. When that top is not regular Medicaid, see pregnantUpperBand. */
    pregnantLimitFpl: number;
    hasAssetLimit: boolean;
    assetLimit?: number;
    /**
     * Adult coverage in a non-expansion state that carries a condition beyond income. Georgia
     * Pathways covers adults 19 to 64 up to adultLimitFpl only if they complete the monthly
     * hours. When set, an adult at or under the limit gets 'maybe' with the hours stated, never
     * 'likely', because we cannot see whether they meet them.
     */
    adultActivityRequirement?: { programName: string; hoursPerMonth: number; url: string };
    /**
     * Set when pregnantLimitFpl is reached through CHIP or the unborn-child option rather than
     * regular pregnancy Medicaid. `aboveFpl` is where regular Medicaid ends; `note` is one
     * sentence naming the program and its condition, shown only to a woman whose income is
     * above that line.
     */
    pregnantUpperBand?: { aboveFpl: number; note: string };
  };

  snap: {
    localName: string;               // "CalFresh"
    applicationUrl: string;
    phone: string;
    bbce: boolean;
    grossLimitFpl: number;
    netLimitFpl: number;
    skipNetIncomeTest?: boolean;
    hasAssetLimit: boolean;
    assetLimit?: number;
    studentExemptions?: boolean;
    calGrantExemption?: boolean;
    lpiePrograms?: string[];
  };

  liheap: {
    localName: string;
    applicationUrl: string;
    phone?: string;
    incomeBasis: 'fpl' | 'smi';
    limitPercent: number;
  };

  childcare: {
    localName: string;
    applicationUrl: string;
    phone?: string;
    incomeBasis: 'fpl' | 'smi';
    limitPercent: number;
  };

  tanf: {
    localName: string;
    applicationUrl: string;
    phone?: string;
    lifetimeLimitMonths: number;
  };

  wic: {
    applicationUrl: string;
    phone: string;
  };

  veterans?: {
    department: string;
    website: string;
    phone?: string;
  };

  aca?: {
    marketplaceType: 'federal' | 'state';
    marketplaceUrl: string;
    exchangeName?: string;
    marketplaceName?: string;
    phone?: string;
  };

  medicare?: {
    shipName: string;
    shipPhone: string;
    shipUrl: string;
  };

  ssi?: {
    stateSupplement: boolean;
    stateSupplementAmount?: number | null;
    ssaPhone: string;
    ssaUrl: string;
  };
}

// Partial type for validation and incremental data building
export type PartialStateData = Partial<StateData>;

// Type for state abbreviation keys
export type StateAbbreviation =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'DC';

// Map of all state data
export type StateDataMap = Record<StateAbbreviation, StateData>;

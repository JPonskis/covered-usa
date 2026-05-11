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

  medicaid: {
    localName: string;               // "Medi-Cal"
    applicationUrl: string;
    phone: string;
    adultLimitFpl: number;           // 138 for expansion, varies for non-expansion
    childLimitFpl: number;           // Usually 200-300
    pregnantLimitFpl: number;        // Usually 185-200
    hasAssetLimit: boolean;
    assetLimit?: number;
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

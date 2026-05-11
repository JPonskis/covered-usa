/**
 * ZIP Code to State Lookup Utility
 * 
 * Uses the first 3 digits (prefix) of a ZIP code to determine the state.
 * Returns 2-letter state codes for all 50 US states + DC.
 */

// ZIP prefix ranges mapped to state codes
// Format: [startPrefix, endPrefix, stateCode]
const ZIP_RANGES: [number, number, string][] = [
  // New England
  [10, 27, 'MA'],   // Massachusetts
  [28, 29, 'RI'],   // Rhode Island
  [30, 38, 'NH'],   // New Hampshire
  [39, 49, 'ME'],   // Maine (039, 040-049)
  [50, 59, 'VT'],   // Vermont
  [60, 69, 'CT'],   // Connecticut
  
  // Mid-Atlantic
  [70, 89, 'NJ'],   // New Jersey
  [100, 149, 'NY'], // New York
  [150, 196, 'PA'], // Pennsylvania
  [197, 199, 'DE'], // Delaware
  
  // DC and South Atlantic
  [200, 205, 'DC'], // District of Columbia
  [206, 219, 'MD'], // Maryland
  [220, 246, 'VA'], // Virginia
  [247, 268, 'WV'], // West Virginia
  [270, 289, 'NC'], // North Carolina
  [290, 299, 'SC'], // South Carolina
  [300, 319, 'GA'], // Georgia
  [320, 339, 'FL'], // Florida
  [344, 344, 'FL'], // Florida (additional)
  [346, 347, 'FL'], // Florida (additional)
  
  // South Central
  [350, 369, 'AL'], // Alabama
  [370, 385, 'TN'], // Tennessee
  [386, 397, 'MS'], // Mississippi
  [700, 714, 'LA'], // Louisiana
  [716, 729, 'AR'], // Arkansas
  [730, 749, 'OK'], // Oklahoma
  [750, 799, 'TX'], // Texas
  
  // East North Central
  [400, 427, 'KY'], // Kentucky
  [430, 459, 'OH'], // Ohio
  [460, 479, 'IN'], // Indiana
  [480, 499, 'MI'], // Michigan
  [600, 629, 'IL'], // Illinois
  
  // West North Central
  [500, 528, 'IA'], // Iowa
  [530, 549, 'WI'], // Wisconsin
  [550, 567, 'MN'], // Minnesota
  [570, 577, 'SD'], // South Dakota
  [580, 588, 'ND'], // North Dakota
  [630, 658, 'MO'], // Missouri
  [660, 679, 'KS'], // Kansas
  [680, 693, 'NE'], // Nebraska
  
  // Mountain
  [590, 599, 'MT'], // Montana
  [800, 816, 'CO'], // Colorado
  [820, 831, 'WY'], // Wyoming
  [832, 838, 'ID'], // Idaho
  [840, 847, 'UT'], // Utah
  [850, 865, 'AZ'], // Arizona
  [870, 884, 'NM'], // New Mexico
  [889, 898, 'NV'], // Nevada
  
  // Pacific
  [900, 961, 'CA'], // California
  [967, 968, 'HI'], // Hawaii
  [970, 979, 'OR'], // Oregon
  [980, 994, 'WA'], // Washington
  [995, 998, 'AK'], // Alaska (999 prefix not assigned)
  
  // Additional Idaho ranges
  [833, 834, 'ID'], // Idaho (additional)
  [836, 837, 'ID'], // Idaho (additional)
];

// Build a lookup map for O(1) access
const prefixToState: Map<number, string> = new Map();

for (const [start, end, state] of ZIP_RANGES) {
  for (let prefix = start; prefix <= end; prefix++) {
    prefixToState.set(prefix, state);
  }
}

/**
 * Get the 2-letter state code from a ZIP code
 * 
 * @param zip - A 5-digit ZIP code string
 * @returns The 2-letter state code (e.g., "NH", "CA") or null if invalid
 * 
 * @example
 * getStateFromZip("03301") // returns "NH"
 * getStateFromZip("90210") // returns "CA"
 * getStateFromZip("78701") // returns "TX"
 * getStateFromZip("99999") // returns null (invalid)
 */
export function getStateFromZip(zip: string): string | null {
  // Validate: must be a string of exactly 5 digits
  if (!zip || typeof zip !== 'string') {
    return null;
  }
  
  // Remove any whitespace
  const cleaned = zip.trim();
  
  // Must be exactly 5 digits
  if (!/^\d{5}$/.test(cleaned)) {
    return null;
  }
  
  // Extract the first 3 digits as the prefix
  const prefix = parseInt(cleaned.substring(0, 3), 10);
  
  // Look up the state
  return prefixToState.get(prefix) ?? null;
}

/**
 * Check if a ZIP code is valid (belongs to a US state or DC)
 * 
 * @param zip - A 5-digit ZIP code string
 * @returns true if valid, false otherwise
 */
export function isValidZip(zip: string): boolean {
  return getStateFromZip(zip) !== null;
}

/**
 * Get all valid state codes
 * 
 * @returns Array of all 2-letter state codes supported
 */
export function getSupportedStates(): string[] {
  return [...new Set(prefixToState.values())].sort();
}

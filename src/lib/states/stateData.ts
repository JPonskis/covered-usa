/**
 * State Data Loader
 * Provides access to normalized state benefit data
 */

import { StateData } from './types';

// Import all state data
import ak from './data/ak.json';
import al from './data/al.json';
import ar from './data/ar.json';
import az from './data/az.json';
import ca from './data/ca.json';
import co from './data/co.json';
import ct from './data/ct.json';
import dc from './data/dc.json';
import de from './data/de.json';
import fl from './data/fl.json';
import ga from './data/ga.json';
import hi from './data/hi.json';
import ia from './data/ia.json';
import id from './data/id.json';
import il from './data/il.json';
import inData from './data/in.json'; // 'in' is reserved keyword
import ks from './data/ks.json';
import ky from './data/ky.json';
import la from './data/la.json';
import ma from './data/ma.json';
import md from './data/md.json';
import me from './data/me.json';
import mi from './data/mi.json';
import mn from './data/mn.json';
import mo from './data/mo.json';
import ms from './data/ms.json';
import mt from './data/mt.json';
import nc from './data/nc.json';
import nd from './data/nd.json';
import ne from './data/ne.json';
import nh from './data/nh.json';
import nj from './data/nj.json';
import nm from './data/nm.json';
import nv from './data/nv.json';
import ny from './data/ny.json';
import oh from './data/oh.json';
import ok from './data/ok.json';
import or from './data/or.json';
import pa from './data/pa.json';
import ri from './data/ri.json';
import sc from './data/sc.json';
import sd from './data/sd.json';
import tn from './data/tn.json';
import tx from './data/tx.json';
import ut from './data/ut.json';
import va from './data/va.json';
import vt from './data/vt.json';
import wa from './data/wa.json';
import wi from './data/wi.json';
import wv from './data/wv.json';
import wy from './data/wy.json';

const STATE_DATA: Record<string, StateData> = {
  'AK': ak as unknown as StateData,
  'AL': al as unknown as StateData,
  'AR': ar as unknown as StateData,
  'AZ': az as unknown as StateData,
  'CA': ca as unknown as StateData,
  'CO': co as unknown as StateData,
  'CT': ct as unknown as StateData,
  'DC': dc as unknown as StateData,
  'DE': de as unknown as StateData,
  'FL': fl as unknown as StateData,
  'GA': ga as unknown as StateData,
  'HI': hi as unknown as StateData,
  'IA': ia as unknown as StateData,
  'ID': id as unknown as StateData,
  'IL': il as unknown as StateData,
  'IN': inData as unknown as StateData,
  'KS': ks as unknown as StateData,
  'KY': ky as unknown as StateData,
  'LA': la as unknown as StateData,
  'MA': ma as unknown as StateData,
  'MD': md as unknown as StateData,
  'ME': me as unknown as StateData,
  'MI': mi as unknown as StateData,
  'MN': mn as unknown as StateData,
  'MO': mo as unknown as StateData,
  'MS': ms as unknown as StateData,
  'MT': mt as unknown as StateData,
  'NC': nc as unknown as StateData,
  'ND': nd as unknown as StateData,
  'NE': ne as unknown as StateData,
  'NH': nh as unknown as StateData,
  'NJ': nj as unknown as StateData,
  'NM': nm as unknown as StateData,
  'NV': nv as unknown as StateData,
  'NY': ny as unknown as StateData,
  'OH': oh as unknown as StateData,
  'OK': ok as unknown as StateData,
  'OR': or as unknown as StateData,
  'PA': pa as unknown as StateData,
  'RI': ri as unknown as StateData,
  'SC': sc as unknown as StateData,
  'SD': sd as unknown as StateData,
  'TN': tn as unknown as StateData,
  'TX': tx as unknown as StateData,
  'UT': ut as unknown as StateData,
  'VA': va as unknown as StateData,
  'VT': vt as unknown as StateData,
  'WA': wa as unknown as StateData,
  'WI': wi as unknown as StateData,
  'WV': wv as unknown as StateData,
  'WY': wy as unknown as StateData,
};

/** All state codes (50 states + DC) */
export const ALL_STATES = Object.keys(STATE_DATA);

/** State names lookup */
export const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida',
  'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
  'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
  'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
  'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin',
  'WY': 'Wyoming'
};

/**
 * Get state data by state code
 */
export function getStateData(stateCode: string): StateData | null {
  if (!stateCode) return null;
  const normalized = stateCode.toUpperCase().trim();
  return STATE_DATA[normalized] || null;
}

/**
 * Get state name from code
 */
export function getStateName(stateCode: string): string {
  if (!stateCode) return '';
  const normalized = stateCode.toUpperCase().trim();
  return STATE_NAMES[normalized] || normalized;
}

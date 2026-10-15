/**
 * Law-change caveats on screener results (audit item A8A9A10-cusa).
 *
 * P.L. 119-21 changed three things the CoveredUSA screener cannot test, because it never asks
 * about immigration status or work hours. Jacob's decision (2026-10-14): say so on the result
 * in one plain line, do not add a question. So a caveat NEVER changes `eligible`, the status or
 * the dollar value. It only adds a line under the reason. The engine decides which caveats apply
 * and from what date; this file holds the rule, the sources and the words (English and Spanish).
 *
 * Sources (all from the audit's worker and critic files; where they differ the critic wins):
 *
 * 1. Medicaid and CHIP, from Oct 1, 2026 (W8-08, W5-06, W9_critic_W8, W9_critic_W5).
 *    P.L. 119-21 section 71109, new SSA 1903(v)(5): "beginning on October 1, 2026, except as
 *    provided in paragraphs (2) and (4), in no event shall payment be made to a State ... unless
 *    such individual is" a citizen or national, a green card holder, a Cuban/Haitian entrant, or
 *    a COFA migrant. (b) applies it to CHIP. The carve-outs the critic says the copy must keep:
 *    paragraph (2) emergency Medicaid; paragraph (4) the state option to cover lawfully residing
 *    children and pregnant women; and CMS SHO #26-001: "states must continue to apply the
 *    five-year waiting period to LPRs" (refugees and asylees who later got a green card are not
 *    held to it).
 *
 * 2. ACA premium tax credit, for 2027 coverage (W8-08, W5-11, W9_critic_W5). Section 71301(b),
 *    new 26 USC 36B(e)(2)(B): only green card holders, Cuban/Haitian entrants and COFA citizens
 *    among non-citizens; section 71301(e): "taxable years beginning after December 31, 2026".
 *    The screener answers for 2027 coverage from Nov 1, 2026 (acaCoverageYear in aca.ts), so the
 *    caveat follows that switch and never shows before it.
 *
 * 3. Medicaid work requirement and 6-month renewals (W8-09, W5-08, W5-12, both critics).
 *    Section 71119, SSA 1902(xx)(1): "beginning not later than the first day of the first quarter
 *    that begins after December 31, 2026, or, at the option of the State ... such earlier date";
 *    80 hours a month; good-faith exemptions can run to Dec 31, 2028. It is "a condition of
 *    eligibility", so the copy says GET and keep (critic W5-08). Exempt include the parent or
 *    caretaker "of a dependent child 13 years of age and under", pregnant women and the medically
 *    frail. It reaches expansion adults and waiver adults like Wisconsin's and Georgia's (critic
 *    W8-09, 1902(xx)(9)(A)(i)(II)). States already enforcing: Nebraska (May 1, 2026), Montana
 *    (July 1, 2026; denials from October 2026), Iowa (Dec 1, 2026 for people who apply on or after
 *    that date). Section 71107: expansion adults renew "once every 6 months" for renewals
 *    scheduled from Jan 1, 2027. Whether Wisconsin's waiver adults also get 6-month renewals is
 *    unresolved (W9_critic_W5, W5-02), so the Wisconsin line leaves renewals out.
 */

import type { ProgramResult, ResultCaveat, ScreenerInput } from './types';

/** From this instant federal Medicaid/CHIP money stops for most non-green-card immigrants. */
export const MEDICAID_IMMIGRATION_EFFECTIVE = new Date('2026-10-01T00:00:00-04:00');

/** States enforcing the work requirement before the federal date, with their own start. */
const WORK_RULE_STARTED: Record<string, 'in_effect' | 'iowa_dec_2026'> = {
  NE: 'in_effect',
  MT: 'in_effect',
  IA: 'iowa_dec_2026',
};

/** A household that told us everyone is a citizen or green card holder has nothing to learn
 *  from an immigration line. Every other answer, including no answer (the CoveredUSA screener
 *  never asks, so that is every real caller today), gets it. */
function mayIncludeNonCitizen(input: Pick<ScreenerInput, 'citizenshipStatus'>): boolean {
  return input.citizenshipStatus !== 'all';
}

/** For a Medicaid or CHIP result the person is being told they may get. */
export function medicaidImmigrationCaveats(
  input: Pick<ScreenerInput, 'citizenshipStatus'>,
  now: Date = new Date(),
): ResultCaveat[] {
  if (now.getTime() < MEDICAID_IMMIGRATION_EFFECTIVE.getTime()) return [];
  return mayIncludeNonCitizen(input) ? [{ id: 'medicaid_immigration' }] : [];
}

/** For an ACA tax-credit result the person is being told they may get. A 'none' household
 *  already gets the full status explanation as its reason (aca.ts), so it is not repeated. */
export function ptcImmigrationCaveats(
  input: Pick<ScreenerInput, 'citizenshipStatus'>,
  coverageYear: number,
): ResultCaveat[] {
  if (coverageYear < 2027) return [];
  if (input.citizenshipStatus === 'none') return [];
  return mayIncludeNonCitizen(input) ? [{ id: 'ptc_immigration_2027' }] : [];
}

/** For an adult 19-64 being told they may get Medicaid as an expansion adult (or a waiver adult
 *  in Wisconsin). Pregnant women and people with a disability are exempt (W5-08), so they get
 *  nothing. A parent may or may not be exempt (it turns on the child's age, which the screener
 *  does not ask), so a parent gets the line with the exemption in it. */
export function medicaidWorkCaveats(
  input: Pick<ScreenerInput, 'age' | 'isPregnant' | 'hasDisability'>,
  state: string,
  isExpansionState: boolean,
): ResultCaveat[] {
  if (input.age < 19 || input.age >= 65) return [];
  if (input.isPregnant || input.hasDisability) return [];
  return [{ id: 'medicaid_work', state, renewEvery6Months: isExpansionState }];
}

/** Append caveats to a result, leaving `caveats` absent (not []) when there are none, so a
 *  result the law changes do not touch is byte-identical to what it was before them. */
export function withCaveats(result: ProgramResult, add: ResultCaveat[] = []): void {
  if (!add.length) return;
  result.caveats = [...(result.caveats ?? []), ...add];
}

/** Stable identity, so a page showing Medicaid AND CHIP prints the same line once. */
export function caveatKey(c: ResultCaveat): string {
  return c.id === 'medicaid_work' ? `${c.id}:${c.state}:${c.renewEvery6Months}` : c.id;
}

const STATE_NAMES: Record<string, { en: string; es: string }> = {
  NE: { en: 'Nebraska', es: 'Nebraska' },
  MT: { en: 'Montana', es: 'Montana' },
  IA: { en: 'Iowa', es: 'Iowa' },
};

/** The words. No em dashes (house rule). Every figure and date is from the sources above. */
export function caveatText(c: ResultCaveat, locale: string): { label: string; body: string } {
  const es = locale === 'es';

  if (c.id === 'medicaid_immigration') {
    return es
      ? {
          label: 'Estatus migratorio:',
          body: 'Desde el 1 de octubre de 2026, Medicaid y CHIP completos se limitan a ciudadanos, residentes permanentes (con green card), entrantes cubanos y haitianos, y ciudadanos de Micronesia, las Islas Marshall y Palaos. Los refugiados, asilados y otros inmigrantes sin green card por lo general ya no califican, aunque algunos estados todavía cubren a niños y mujeres embarazadas que residen legalmente en el país. La mayoría de los residentes permanentes deben haber tenido su green card por 5 años, a menos que hayan llegado como refugiados o asilados. Medicaid de emergencia sigue pagando la atención de emergencia de quienes de otro modo calificarían.',
        }
      : {
          label: 'Immigration status:',
          body: 'Since October 1, 2026, full Medicaid and CHIP are limited to citizens, green card holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau. Refugees, asylees and other immigrants without a green card generally no longer qualify, though some states still cover lawfully residing children and pregnant women. Most green card holders must have had their card for 5 years, unless they came as a refugee or asylee. Emergency Medicaid still pays for emergency care for people who would otherwise qualify.',
        };
  }

  if (c.id === 'ptc_immigration_2027') {
    return es
      ? {
          label: 'Estatus migratorio:',
          body: 'A partir de la cobertura de 2027, el crédito fiscal para primas se limita a ciudadanos, residentes permanentes (con green card), entrantes cubanos y haitianos, y ciudadanos de Micronesia, las Islas Marshall y Palaos que viven aquí bajo el Pacto de Libre Asociación. Los refugiados, asilados, titulares de TPS y titulares de visas ya no califican para el crédito.',
        }
      : {
          label: 'Immigration status:',
          body: 'Starting with 2027 coverage, the premium tax credit is limited to citizens, green card holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau living here under the Compact of Free Association. Refugees, asylees, TPS holders and visa holders no longer qualify for it.',
        };
  }

  // medicaid_work
  const started = WORK_RULE_STARTED[c.state];
  const name = STATE_NAMES[c.state]?.[es ? 'es' : 'en'] ?? c.state;
  const when = es
    ? started === 'in_effect'
      ? `${name} ya exige a los adultos con esta cobertura demostrar 80 horas al mes de trabajo, estudios, capacitación laboral o voluntariado para obtenerla y mantenerla.`
      : started === 'iowa_dec_2026'
        ? `${name} exige a los adultos que soliciten esta cobertura a partir del 1 de diciembre de 2026 demostrar 80 horas al mes de trabajo, estudios, capacitación laboral o voluntariado para obtenerla y mantenerla.`
        : 'Es posible que tenga que demostrar trabajo, estudios, capacitación laboral o voluntariado (80 horas al mes) para obtener y mantener esta cobertura, a partir de enero de 2027 o más tarde, según su estado.'
    : started === 'in_effect'
      ? `${name} already requires adults covered this way to show 80 hours a month of work, school, job training or volunteering to get and keep coverage.`
      : started === 'iowa_dec_2026'
        ? `${name} requires adults who apply on or after December 1, 2026 to show 80 hours a month of work, school, job training or volunteering to get and keep coverage.`
        : 'You may need to show work, school, job training or volunteering (80 hours a month) to get and keep this coverage, starting as early as January 2027 depending on your state.';
  const exempt = es
    ? 'Los padres de un niño de 13 años o menos, las mujeres embarazadas y las personas con una enfermedad grave o una discapacidad pueden estar exentos.'
    : 'Parents of a child 13 or younger, pregnant women, and people with a serious illness or disability can be exempt.';
  const renew = c.renewEvery6Months
    ? es
      ? ' A partir de 2027, los adultos con esta cobertura también deben renovarla cada 6 meses en lugar de una vez al año.'
      : ' Starting in 2027, adults covered this way also have to renew every 6 months instead of once a year.'
    : '';
  return {
    label: es ? 'Requisitos de trabajo:' : 'Work rules:',
    body: `${when} ${exempt}${renew}`,
  };
}

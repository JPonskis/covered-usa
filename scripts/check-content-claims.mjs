#!/usr/bin/env node
/**
 * check:content-claims — the never-say guard for CoveredUSA content/.
 *
 * check-federal-constants.mjs guards NUMBERS in src/. This script guards the RULE claims the
 * 2026-10 eligibility audit corrected in content/ (blog markdown and every content/data JSON page),
 * so the next writer run cannot quietly put them back. Each rule names the claim, why it is false,
 * and the primary source (audit notes: engine-fixes/notes/CUSA-content-medicaid.md and
 * CUSA-content-followup.md):
 *
 *   A refugee-immediate    "Refugees ... qualify for Medicaid immediately" with no green-card / Oct 1
 *                          qualifier. P.L. 119-21 s.71109 (SSA 1903(v)(5)): from Oct 1, 2026 full
 *                          Medicaid/CHIP only for citizens, green card holders, Cuban/Haitian entrants,
 *                          COFA citizens. CMS SHO #26-001.
 *   B no-work-requirement  "no work requirement" / "regardless of employment status" for Medicaid,
 *                          outside the non-expansion states. s.71119, SSA 1902(xx): expansion adults
 *                          must show 80 hours a month from Jan 2027 at the latest (NE, MT already; IA
 *                          from Dec 1, 2026).
 *   C part-b-185           $185 (or $2,220 a year) stated as the current Part B premium. CMS: "$202.90
 *                          for 2026", "from $185.00 in 2025".
 *   D daca-marketplace     DACA recipients told they can use the Marketplace / get tax credits.
 *                          90 FR 27074 (June 25, 2025), effective Aug 25, 2025; HealthCare.gov: "DACA
 *                          recipients aren't eligible for Marketplace coverage."
 *   E ptc-2027             A premium tax credit promised to refugees, asylees, TPS, parolees, visa
 *                          holders or "lawfully present immigrants" with no 2026/2027 date. s.71301:
 *                          for tax years after Dec 31, 2026 only green card holders, Cuban/Haitian
 *                          entrants and COFA citizens. HealthCare.gov: "starting January 1, 2027".
 *   F below-100-exception  Lawfully present immigrants below 100% FPL can still get the credit / "no
 *                          income floor". s.71302 struck 36B(c)(1)(B) for tax years after Dec 31, 2025.
 *   G forty-quarters       40 quarters of work shown as a way around the Medicaid 5-year bar. Not in
 *                          8 U.S.C. 1613(b); SHO #26-001 n.30: LPRs "must also meet the five-year
 *                          waiting period, unless an exception applies."
 *   H vawa-sijs-exempt     VAWA self-petitioners or Special Immigrant Juveniles shown as exempt from the
 *                          5-year bar. 8 U.S.C. 1613(b) lists neither.
 *   I daca-court-order     DACA recipients' Medicaid ineligibility blamed on a court order. They were
 *                          never qualified aliens (SHO #26-001 Table 1 n.9, SHO #12-002).
 *
 * The date gate is the point: a claim that is true for a past period stays legal when the sentence
 * says so ("Before October 1, 2026, refugees could..."; "$185 in 2025"; "2026 coverage"). What is
 * banned is the claim stated as current or undated. A genuine historical mention the patterns cannot
 * see goes in scripts/content-claims-allow.json ({file, rule, contains, why}); an allowlist entry that
 * no longer matches anything fails the build (a stale allowlist is a hole).
 *
 * Usage:
 *   node scripts/check-content-claims.mjs                walk content/blog + content/data (the gate)
 *   node scripts/check-content-claims.mjs --self-test    run the built-in fixtures only
 *   node scripts/check-content-claims.mjs --text "..."   judge one sentence
 * The gate runs the fixtures first: a regex edit that stops catching an old claim fails the build.
 * Output for a bad page is "❌ <slug>.json" then "  - ..." lines, the format
 * coveredusa-drip-publish.js parses, so a drip page that fails is sent back, never shipped.
 * Exit: 0 clean, 1 violations or failed fixtures, 2 the walk could not run.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const WALK = ['content/blog', 'content/data'];
const ALLOW_FILE = join(ROOT, 'scripts/content-claims-allow.json');
/** JSON keys that never render as prose. */
const SKIP_KEY = /^(_.*|@.*|sources|slug|url|href|sourceUrl|govStartingUrl|manufacturerStartingUrl|portalUrl|marketplaceUrl|medicaidAgencyUrl|chipProgramUrl|lastUpdated|dateModified|date)$/;
/** Files that are pipeline state, not pages. */
const SKIP_FILE = /(^|\/)_[^/]*\.json$/;

// ---------------------------------------------------------------------------------------------
// Shared vocabulary
// ---------------------------------------------------------------------------------------------
const MEDICAID = /\b(Medicaid|Medi-Cal|CHIP|TennCare|ARHOME|SoonerCare|BadgerCare|MassHealth|Apple Health|KanCare|HUSKY|Healthy Connections|Healthy Louisiana|NC Medicaid|expansion|expansión)\b/i;
/** Non-expansion states whose "no work requirement" is true. Georgia (Pathways) and Wisconsin
 *  (waiver adults are "applicable individuals", critic W8-09) are deliberately NOT here. */
const NON_EXPANSION = /\b(Alabama|Florida|Kansas|Mississippi|South Carolina|Tennessee|Texas|Wyoming|Carolina del Sur|Misisipi)\b/i;
const NON_EXPANSION_FILE = /(^|[/-])(alabama|florida|kansas|mississippi|south-carolina|tennessee|texas|wyoming)(\.json|\.md|-|$)/;
/** Any state named in the sentence decides it; the file's state only counts when the sentence names none. */
const STATES = /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|Carolina del Sur|Misisipi)\b/gi;
function nonExpansionContext(s, file) {
  const named = [...s.matchAll(STATES)].map((m) => m[0]);
  if (named.length) return named.every((n) => NON_EXPANSION.test(n));
  return NON_EXPANSION_FILE.test(file);
}
const PAST = /\b(before|until|prior to|through|historically|previously|used to|had been|was|were|antes del?|hasta( el)?|anteriormente|solía|tenían|era)\b/i;

const isNeg = (re) => (s) => re.test(s);

// A: refugees told they get Medicaid right away, as a current rule.
const A_WHO = /\b(refugees?|asylees?|refugiad[oa]s?|asilad[oa]s?)\b/i;
const A_WHEN = /\b(immediate(ly)?|right away|upon arrival|on arrival|from (the )?(day|date|moment) (of|they|you)|de inmediato|inmediat[ao](mente)?|desde (el|la) (día|fecha) (de|en que))\b|\binmediata(mente)?\b/i;
const A_QUAL = /(qualif|eligib|access|covered|cover |enrol|califica|elegib|acceso|cubiert|inscrib)/i;
const A_SAFE = /(green card|LPR|permanent resident|tarjeta verde|residentes? permanentes?|October 1, 2026|1 de octubre de 2026|October 2026|octubre de 2026|historically|previously|used to|anteriormente|solía|no longer|ya no|Marketplace|Mercado|Special Enrollment|SEP\b|Open Enrollment|Refugee Medical Assistance|RMA\b|without waiting for)/i;

// B: Medicaid with no work requirement.
/** The strong claim ("no work requirement") is never excused by a correct sentence elsewhere in the unit:
 *  two contradicting sentences in one answer is still a wrong answer. The weak one ("regardless of
 *  employment status", true of having a job) is fine when the same unit states the 2027 work rule. */
const B_STRONG = /\b(no|without( a| any)?|does not have( a| any)?|doesn't have( a| any)?|do not have( a| any)?|has no|have no|not subject to( a| any)?|free of)\s+(federal\s+|state\s+|Medicaid\s+)?work requirements?\b|sin (ningún )?requisitos? de trabajo|no (tiene|tienen|hay|exige|exigen) (un |ningún )?requisitos? (de trabajo|laboral)/i;
const B_CLAIM = /\b(no|without( a| any)?|does not have( a| any)?|doesn't have( a| any)?|do not have( a| any)?|has no|have no|not subject to( a| any)?|free of)\s+(federal\s+|state\s+|Medicaid\s+)?work requirements?\b|regardless of (employment|work|job) status|sin (ningún )?requisitos? de trabajo|no (tiene|tienen|hay|exige|exigen) (un |ningún )?requisitos? (de trabajo|laboral)|independientemente de (su )?(situación|estado|estatus) laboral/i;
const B_SAFE = /(income test|prueba de ingresos|former foster|foster care|crianza temporal|has not expanded|have not expanded|non-?expansion|did not expand|not expanded|no ha expandido|no han expandido|no expandió|sin expansión|Marketplace|Mercado|CHIP\b|Medicare|SNAP|pregnan|disabilit|disabled|exempt|65 (or|and) older|aged 65|embaraz|discapacidad|exent|until \w+( \d{1,2},)? 2027|before (\w+ )?2027|hasta (\w+ de )?2027|antes de (enero de )?2027|in 2025|en 2025)/i;

/** A unit that already states the work rule with its date (e.g. "Working does not disqualify you ...
 *  starting January 1, 2027, expansion adults must meet new work requirements of 80 hours") is fine. */
const B_UNIT_SAFE = /80 hours|80 horas|work requirements?[^.]{0,180}2027|2027[^.]{0,180}work requirements?|requisitos? de trabajo[^.]{0,180}2027|2027[^.]{0,180}requisitos? de trabajo/i;

// C: $185 as the current Part B premium.
const C_AMT = /\$\s?185(\.00)?(?!\d)|\$2,220(?!\d)/;
const C_CTX = /(Part B|Parte B)/i;
const C_PREM = /(premium|\bprima\b|per month|a month|al mes|\/month|\/mes|\/mo\b|monthly|mensual|per year|al año|a year)/i;
const C_SAFE = /2025|(from|up from|rose from|increased from|was|de|desde|era|subió de|aumentó de)\s+(~\s?)?\$\s?185/i;

// D: DACA told they can use the Marketplace or get tax credits. Judged per CLAUSE, because the old
// claim was "may purchase marketplace plans at healthcare.gov but are not eligible for premium tax
// credits": the negation belongs to the credit, the purchase claim is still there.
const D_WHO = /\b(DACA|Dreamers?|Deferred Action for Childhood|Acción Diferida)\b/i;
const D_WHAT = /(marketplace|healthcare\.gov|\bexchanges?\b|Covered California|kynect|Pennie|Get Covered|\bmercado\b|premium tax credits?|tax credits?|\bPTCs?\b|\bAPTC\b|subsid\w*|crédito\w*|subsidio\w*)/i;
const D_CAN = /\b(can|may|could|eligible|qualif\w*|purchase|buy|apply|enroll(s|ed|ing)?\b|access|became|explore|pueden|puede|elegibles?|califica\w*|comprar|solicitar|explorar|inscrib\w*)\b/i;
const D_NEG = /(unavailable|no disponible\w*|\bnot\b|\bno\b|\bnunca\b|attempt\w*|intentar|off-Marketplace|off-exchange|premium assistance|asistencia|substitut\w*|replac\w*|reemplaz\w*|estatal\w*|cannot|can't|can not|could not|not eligible|ineligible|no longer|lost|lose|loses|losing|exclud\w*|removed|remov\w*|barred|bars\b|aren't|isn't|is not|are not|not allowed|never|stripped|reversed|terminat\w*|disenroll\w*|no pueden|no puede|no son|no es\b|excluid\w*|perdi\w*|ya no|tampoco|either\b|inelegible\w*|outside (of )?the (Marketplace|marketplace|exchange)|directly from|fuera del (Mercado|mercado)|directamente|state[- ]funded|state subsid|state premium|state funds|Essential Plan|Healthplanfinder|Cascade|OmniSalud|Medi-Cal|fondos estatales|Plan Esencial)/i;
const D_HIST = /(\bwindow\b|\bventana\b|\bbrief\b|\bbreve\b|November 2024 through|2024 rule|regla de 2024|November 1, 2024|1 de noviembre de 2024|briefly|brief window|breve|until August 25, 2025|before August 25, 2025|through August 25, 2025|hasta el 25 de agosto de 2025|antes del 25 de agosto de 2025|had been|Biden)/i;
/** The clauses whose subject is DACA recipients: the clause names them (or says "they"), or it
 *  follows a clause that does and opens with a verb ("DACA recipients, also called Dreamers, can buy"). */
const D_SUBJ = /\b(DACA|Dreamers?|Deferred Action for Childhood|Acción Diferida|they|ellos)\b/i;
const D_VERBFIRST = /^\s*(can|may|could|are|is|qualify|pueden|puede|son|califican)\b/i;
function aboutDaca(clauses) {
  return clauses.filter((c, i) => D_SUBJ.test(c) || (i > 0 && D_SUBJ.test(clauses[i - 1]) && D_VERBFIRST.test(c)));
}
const CLAUSES = /;|,(?!\d)|\bbut\b|\bthough\b|\balthough\b|\bwhile\b|\baunque\b|\bpero\b|\bsin embargo\b/i;

// E: tax credit promised to non-green-card lawfully present immigrants with no date.
const E_WHO = /\b(refugees?|asylees?|TPS|Temporary Protected Status|parolees?|visa holders?|H-1B|F-1|non-?immigrants?|lawfully present (immigrants?|non-?citizens?|noncitizens?|members?|spouses?)|refugiad\w*|asilad\w*|titulares de (TPS|visas?)|con presencia legal|legalmente presentes?)\b/i;
const E_WHAT = /(premium tax credits?|tax credits?|\bPTCs?\b|\bAPTC\b|subsidi[sz]\w*|subsid(y|ies)|cost-sharing reductions?|crédito\w* fiscal\w*|créditos? tributari\w*|subsidi\w*|reducciones? de costos? compartidos?)/i;
const E_CAN = /\b(can|may|qualif\w*|eligible|gets?|receiv\w*|keeps?|access|available|entitled|pueden|puede|califica\w*|elegibles?|reciben|recibir|obtener|mantienen|disponibles?)\b/i;
const E_NEG = /(must|require[sd]?|need to|have to|deben|requiere\w*|necesitan|barr\w*|block\w*|bloque\w*|repeal\w*|derog\w*|no one|nadie|cliff|tope del subsidio|por encima del|affect\w*|afecta\w*|unsubsidi[sz]ed|without (a )?(subsid|tax credit)|full (sticker )?price|sin subsidio|precio completo|no longer|not eligible|cannot|can't|can not|lose|loses|losing|lost|ineligible|not available|aren't|isn't|is not|are not|never|undocumented|indocumentad\w*|ya no|no califica\w*|no son elegibles|no pueden|no puede|pierden|perdieron|no reciben|no recibe|sin crédito)/i;
const E_DATED = /(\b(in|for|during|as of|since|after|en|para|durante|desde)\b[^.;$]{0,25}\b2026\b(?![^.;]{0,3}(single|person|family|para una|por persona))|2026 (coverage|plan year)|plan year 2026|for 2026\b|for all of (plan year )?2026|cobertura de 2026|año del plan 2026|para 2026\b|through (December 31, )?2026|until (the end of )?2026|hasta (el final de |el 31 de diciembre de )?2026|in 2026 only|solo en 2026)/i;

const E_STRIP = /(green card holders?|LPRs?|residentes? permanentes?|titulares de (la )?tarjeta verde)?\s*(who|que) (came|llegaron|llegó|vinieron)( here)? (as|como) (an? )?(refugees?|asylees?|refugiad\w*|asilad\w*)( (or|o) (an? )?(asylees?|asilad\w*))?|Qualified Health Plans?|Planes? Calificados?( de Salud)?/gi;

// F: the repealed below-100% exception.
const F_BELOW = /(below|under|less than|por debajo del?|menos del?|inferiores? al?)\s+(the\s+)?100\s?%/i;
const F_WHO = /(lawfully present|immigrant|non-?citizen|refugee|asylee|green card|inmigrante|presencia legal|refugiad|asilad)/i;
const F_WHAT = /(tax credit|\bPTC\b|subsid|crédito|subsidio)/i;
const F_CAN = /\b(can|may|qualif\w*|eligible|access|still|special rule|exception|as though|pueden|puede|califica\w*|elegibles?|excepción|regla especial|como si)\b/i;
const F_NEG = /(\bno\b|nadie|\bsin (opción|ningún|ninguna)|\bnot\b|unavailable|no disponibles?|clos\w*|cerr\w*|prior exception|excepción anterior|used to|solía|permitía|block\w*|bloque\w*|barr\w*|full (sticker )?price|precio completo|(buy|purchase|comprar)\b[^.;]{0,30}(plan|coverage|cobertura)|no longer|not eligible|cannot|can't|can not|repeal\w*|removed|remov\w*|ended|eliminat\w*|struck|strik\w*|no tax credit|no PTC|ya no|derog\w*|eliminó|elimin\w*|no pueden|no son elegibles|lost|lose|loses|perdieron|before 2026|until 2026|through 2025|in 2025|antes de 2026|hasta 2026|en 2025|no (hay|existe) (ningún )?crédito|sin crédito)/i;
const F_FLOOR = /\bno income floor\b|sin (un |ningún )?piso de ingresos/i;

// G: forty quarters as a way around the 5-year bar.
const G_40 = /\b(40|forty) (qualifying )?(quarters|work quarters)\b|\b10\+? years (of )?(U\.S\. )?work|\b(40|cuarenta) trimestres|10\+? años de (historial laboral|trabajo)/i;
const G_BAR = /(5-year|five-year|5 year|five year|waiting period|\bbar\b|\bwait\b|espera|regla de 5|regla de cinco|5 años|cinco años)/i;
const G_EXEMPT = /(exempt|waiv\w*|skip|bypass|immediately|no wait|without waiting|exento\w*|exime\w*|sin esperar|sin espera|de inmediato)/i;
const G_NEG = /(\bnot\b|\bno\b (?:acortan|exime|eximen)|do not|does not|don't|doesn't|still subject|siguen sujetos|no acortan|no la eximen|no lo eximen|no los exime|is not|isn't|aren't|nunca)/i;

// H: VAWA / SIJS shown as exempt from the 5-year bar. Checked in a window around the name.
const H_WHO = /(VAWA|battered|Violence Against Women|Special Immigrant Juveniles?( Status)?|\bSIJS?\b|maltratad\w*|Juvenil Especial)/gi;
const H_EXEMPT = /(exempt|exento\w*|without (the )?(five|5)-year (bar|wait)|no (5|five)-year (bar|wait)|sin la regla de (5|cinco)|immediate access|acceso inmediato)/i;
const H_NEG = /(\bnot\b|\bnever\b|\bno longer\b|\bnunca\b|\bni\b|isn't|aren't|does not|do not|still subject|sujet\w*|no (están|son|los exime|las exime|lo exime|la exime)|ya no)/i;

// I: DACA Medicaid ineligibility blamed on a court.
const I_WHO = /\b(DACA|Dreamers?)\b/i;
const I_COURT = /(court order|court ruling|court rulings|court freeze|DACA freeze|orden judicial|fallo judicial|fallos judiciales|congelamiento)/i;

/** Every rule returns a reason string or null. `ctx` = { unit, file }. */
const RULES = [
  { id: 'A', name: 'refugee-immediate', test: (s, c) =>
      A_WHO.test(s) && A_WHEN.test(s) && A_QUAL.test(s) && MEDICAID.test(c.unit) && !A_SAFE.test(s)
        ? 'refugees/asylees told they get Medicaid immediately with no green-card or Oct 1, 2026 qualifier (s.71109)' : null },
  { id: 'B', name: 'no-work-requirement', test: (s, c) =>
      B_CLAIM.test(s) && (MEDICAID.test(s) || MEDICAID.test(c.unit)) && !B_SAFE.test(s)
        && (B_STRONG.test(s) || !B_UNIT_SAFE.test(c.unit)) && !nonExpansionContext(s, c.file)
        ? 'Medicaid "no work requirement" outside a non-expansion state (s.71119: 80 hours a month, from Jan 2027 at the latest)' : null },
  { id: 'C', name: 'part-b-185', test: (s) =>
      C_AMT.test(s) && C_CTX.test(s) && C_PREM.test(s) && !C_SAFE.test(s)
        ? '$185 stated as the current Part B premium (2026 is $202.90; $185.00 was 2025)' : null },
  { id: 'D', name: 'daca-marketplace', test: (s) =>
      D_WHO.test(s) && !D_HIST.test(s) && aboutDaca(s.split(CLAUSES)).some((c) => D_WHAT.test(c) && D_CAN.test(c) && !D_NEG.test(c))
        ? 'DACA recipients told they can use the Marketplace or get tax credits (90 FR 27074, effective Aug 25, 2025)' : null },
  { id: 'E', name: 'ptc-2027', test: (s, c) =>
      ((t) => E_WHO.test(t) && E_WHAT.test(t) && E_CAN.test(t))(s.replace(E_STRIP, ' ')) && !E_NEG.test(s) && !E_DATED.test(s) && !/2027/.test(c.unit)
        ? 'tax credit promised to non-green-card immigrants with no 2026/2027 date (s.71301: from 2027 coverage only green card holders, Cuban/Haitian entrants, COFA)' : null },
  { id: 'F', name: 'below-100-exception', test: (s) =>
      ((F_BELOW.test(s) && F_WHO.test(s) && F_WHAT.test(s) && F_CAN.test(s) && !F_NEG.test(s)) || (F_FLOOR.test(s) && F_WHO.test(s) && F_WHAT.test(s)))
        ? 'below-100%-FPL tax credit exception for immigrants (repealed by s.71302 from 2026)' : null },
  { id: 'G', name: 'forty-quarters', test: (s) =>
      G_40.test(s) && (G_BAR.test(s) || MEDICAID.test(s)) && G_EXEMPT.test(s) && !G_NEG.test(s)
        ? '40 work quarters shown as a way around the Medicaid 5-year bar (not in 8 U.S.C. 1613(b))' : null },
  { id: 'H', name: 'vawa-sijs-exempt', test: (s) => {
      for (const m of s.matchAll(H_WHO)) {
        const before = s.slice(0, m.index);
        // local: from the last list/clause delimiter before the name to ~100 chars after it
        const cut = Math.max(before.lastIndexOf(','), before.lastIndexOf(';'), before.lastIndexOf(':'), before.lastIndexOf('('));
        const local = s.slice(cut + 1, m.index) + s.slice(m.index, m.index + m[0].length + 100).split(/[;.]/)[0];
        // header: what introduces the list the name sits in ("Exempt from the bar: ...", "an exemption (...")
        const hm = [...before.matchAll(/[:(]|\b(including|include|incluidos|incluyen)\b/gi)].pop();
        const header = hm ? before.slice(Math.max(0, hm.index - 100), hm.index) : '';
        if ((H_EXEMPT.test(local) || H_EXEMPT.test(header)) && !H_NEG.test(local)) {
          return 'VAWA / Special Immigrant Juveniles shown as exempt from the 5-year bar (8 U.S.C. 1613(b) lists neither)';
        }
      }
      return null; } },
  { id: 'I', name: 'daca-court-order', test: (s) =>
      I_WHO.test(s) && I_COURT.test(s) && /(Medicaid|CHIP)/i.test(s) && !/(Kansas|Marketplace|marketplace|2024 rule|regla de 2024)/.test(s)
        ? 'DACA Medicaid ineligibility blamed on a court order (DACA recipients were never qualified aliens)' : null },
];

// ---------------------------------------------------------------------------------------------
// Fixtures: every OLD claim must fire its rule; every NEW / historical sentence must pass.
// ---------------------------------------------------------------------------------------------
const MUST_FIRE = [
  ['A', 'Refugees and certain humanitarian parolees may qualify immediately for Ohio Medicaid.'],
  ['A', 'A refugee who arrived last month has immediate access to Medicaid in most states.'],
  ['A', 'Yes. Refugees and asylees qualify for full Medicaid from the day they are admitted.'],
  ['A', 'Los refugiados califican de inmediato para Medicaid.'],
  ['B', 'Ohio Medicaid does not have work requirements for the adult expansion group.'],
  ['B', 'Medicaid does not have a federal work requirement, and only Georgia enforces one.'],
  ['B', 'You qualify for free New Jersey Medicaid with no asset test and no work requirement.'],
  ['B', 'You qualify for free Delaware Medicaid, regardless of employment status.'],
  ['B', 'Arkansas Medicaid has no work requirement for expansion adults.'],
  ['C', 'The Part B premium ($185.00 per month in 2026) is paid by the state.'],
  ['C', '| Parte B | Visitas médicas | ~$185/mes de prima |'],
  ['C', 'SLMB pays your Part B premium, saving $2,220 per year.'],
  ['D', 'DACA recipients with incomes between 100% and 400% FPL may qualify for ACA marketplace plans with premium tax credits.'],
  ['D', 'DACA recipients may purchase marketplace plans at healthcare.gov but are not paid a subsidy.'],
  ['D', 'DACA recipients currently are eligible for marketplace enrollment and PTC under a 2025 federal rule.'],
  ['D', 'Los beneficiarios de DACA pueden comprar cobertura del mercado de la ACA a través de healthcare.gov.'],
  ['E', 'Refugees and asylees can enroll in Marketplace plans and receive Premium Tax Credits.'],
  ['E', 'H-1B visa holders qualify for a Premium Tax Credit if household income is at or above 100% FPL.'],
  ['E', 'Lawfully present immigrants are eligible for marketplace plans and subsidies on the same terms as citizens.'],
  ['E', 'Los refugiados pueden recibir créditos fiscales para primas.'],
  ['F', 'Lawfully present non-citizens who are ineligible for Medicaid due to immigration status can access ACA subsidies even below 100% FPL.'],
  ['F', 'There is no income floor for most PTC-eligible lawfully present immigrants.'],
  ['G', 'People with 40 quarters of U.S. work history qualify for Medicaid immediately without waiting.'],
  ['G', 'LPRs with 40 quarters of work credited under Social Security: exempt from the five-year bar.'],
  ['G', '5-year bar waived for those with 10+ years U.S. work history, military/veterans, and certain survivors'],
  ['H', 'VAWA survivors: exempt from 5-year bar for federally funded Medicaid.'],
  ['H', 'Exempt from the five-year bar in Georgia: refugees, asylees, Special Immigrant Juvenile Status holders, and lawfully residing children.'],
  ['H', 'Special immigrant juveniles (SIJ) with SIJ status granted by USCIS: exempt from the five-year bar.'],
  ['I', 'DACA recipients are blocked from federal Medicaid by a 2025 court order.'],
  ['I', 'DACA is not a qualifying immigration status for Kentucky Medicaid under current federal court rulings.'],
];
const MUST_PASS = [
  'Since October 1, 2026, full Medicaid and CHIP are limited to citizens, green card holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau.',
  'Most green card holders must have had their card for 5 years, unless they came as a refugee or asylee.',
  'Green card holders who came as refugees or asylees are exempt from the 5-year bar and can access Medicaid immediately.',
  'Before October 1, 2026, refugees could enroll in Medicaid immediately.',
  'A newly resettled refugee can enroll in a Marketplace plan immediately without waiting for Open Enrollment.',
  'Wyoming has not expanded Medicaid, so there is no work requirement for adults.',
  'Texas Medicaid has no work requirement.',
  'Pregnant women and people with a disability are exempt, so there is no work requirement for them.',
  'The Part B premium rose from $185.00 in 2025 to $202.90 in 2026.',
  'Medicare pays $185 for this visit under the Physician Fee Schedule.',
  'Since August 25, 2025, DACA recipients cannot buy a plan through the ACA marketplace (HealthCare.gov) or get premium tax credits, at any income; they can buy a plan directly from an insurance company at full price.',
  'DACA recipients held a brief window of ACA Marketplace access from November 1, 2024, through August 25, 2025.',
  'Starting with 2027 coverage, the premium tax credit is limited to citizens, green card holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau living here under the Compact of Free Association. Refugees, asylees, TPS holders and visa holders no longer qualify for it, though they can still buy a Marketplace plan at full price.',
  'For all of plan year 2026, refugees and asylees keep full PTC and cost-sharing reduction access.',
  'Undocumented immigrants are not eligible for PTC or most Medicaid coverage.',
  'Since 2026 there is no tax credit below 100% FPL for anyone; the old exception for lawfully present immigrants was repealed.',
  'LPRs with 40 quarters of work credited under Social Security: still subject to the five-year bar (forty quarters of work do not shorten the 5-year wait for Medicaid).',
  'VAWA survivors are not on this list: federal law does not exempt them from the 5-year bar.',
  'Special Immigrant Juvenile Status (SIJS) holders: not exempt from the five-year bar under federal law.',
  'DACA recipients are not eligible for full Kentucky Medicaid because DACA is not a qualified immigration status under federal law.',
];

function sentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z¿¡"(|])/).map((x) => x.trim()).filter(Boolean);
}

function judge(sentence, ctx) {
  const hits = [];
  if (/\?\s*$/.test(sentence)) return hits; // a question is not a claim; its answer is judged on its own
  for (const r of RULES) {
    const why = r.test(sentence, ctx);
    if (why) hits.push({ rule: r.id, name: r.name, why });
  }
  return hits;
}

function runFixtures() {
  const fails = [];
  for (const [rule, s] of MUST_FIRE) {
    const hits = judge(s, { unit: s, file: 'fixture' });
    if (!hits.some((h) => h.rule === rule)) fails.push(`fixture should fire ${rule}: ${s}`);
  }
  for (const s of MUST_PASS) {
    const hits = judge(s, { unit: s, file: 'fixture' });
    if (hits.length) fails.push(`fixture should pass but fired ${hits.map((h) => h.rule).join(',')}: ${s}`);
  }
  return fails;
}

function* leaves(o, path = '') {
  if (typeof o === 'string') { yield [path, o]; return; }
  if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) yield* leaves(o[i], `${path}[${i}]`); return; }
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      if (SKIP_KEY.test(k)) continue;
      yield* leaves(v, path ? `${path}.${k}` : k);
    }
  }
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(json|md|mdx)$/.test(name)) yield p;
  }
}

function* units(absPath) {
  const raw = readFileSync(absPath, 'utf8');
  if (absPath.endsWith('.json')) {
    yield* leaves(JSON.parse(raw));
  } else {
    const lines = raw.split('\n');
    for (let i = 0; i < lines.length; i++) yield [`L${i + 1}`, lines[i]];
  }
}

function loadAllow() {
  if (!existsSync(ALLOW_FILE)) return [];
  const list = JSON.parse(readFileSync(ALLOW_FILE, 'utf8'));
  for (const a of list) {
    if (!a.file || !a.rule || !a.contains || !a.why) throw new Error(`allowlist entry needs file, rule, contains, why: ${JSON.stringify(a)}`);
  }
  return list.map((a) => ({ ...a, used: 0 }));
}

function main() {
  const args = process.argv.slice(2);
  const fixtureFails = runFixtures();
  if (args.includes('--self-test')) {
    for (const f of fixtureFails) console.log(`❌ ${f}`);
    console.log(`check:content-claims self-test: ${MUST_FIRE.length + MUST_PASS.length} fixtures, ${fixtureFails.length} failed`);
    process.exit(fixtureFails.length ? 1 : 0);
  }
  const ti = args.indexOf('--text');
  if (ti >= 0) {
    const s = args[ti + 1] || '';
    const hits = sentences(s).flatMap((x) => judge(x, { unit: s, file: 'text' }));
    for (const h of hits) console.log(`❌ [${h.rule} ${h.name}] ${h.why}`);
    process.exit(hits.length ? 1 : 0);
  }

  let allow;
  try { allow = loadAllow(); } catch (e) { console.error(`check:content-claims: ${e.message}`); process.exit(2); }

  const byFile = new Map();
  let nFiles = 0, nUnits = 0;
  for (const d of WALK) {
    const abs = join(ROOT, d);
    if (!existsSync(abs)) { console.error(`check:content-claims: ${d} missing`); process.exit(2); }
    for (const p of files(abs)) {
      const rel = relative(ROOT, p);
      if (SKIP_FILE.test(rel)) continue;
      nFiles++;
      let us;
      try { us = [...units(p)]; } catch (e) { console.error(`check:content-claims: cannot parse ${rel}: ${e.message}`); process.exit(2); }
      for (const [path, text] of us) {
        nUnits++;
        for (const s of sentences(text)) {
          for (const h of judge(s, { unit: text, file: rel })) {
            const ok = allow.find((a) => a.file === rel && a.rule === h.rule && s.includes(a.contains));
            if (ok) { ok.used++; continue; }
            if (!byFile.has(rel)) byFile.set(rel, []);
            // one line per hit: coveredusa-drip-publish.js reads "  - ..." lines into the writer's held note
            byFile.get(rel).push(`[${h.rule} ${h.name}] ${path}: "${s.slice(0, 260)}${s.length > 260 ? '...' : ''}" => ${h.why}`);
          }
        }
      }
    }
  }

  const problems = [...fixtureFails.map((f) => `❌ ${f}`)];
  for (const a of allow) if (!a.used) problems.push(`❌ stale allowlist entry (matches nothing): ${a.file} [${a.rule}] "${a.contains}"`);
  // Positive control: a walk that saw almost nothing is an absent gate, not a clean one.
  if (nFiles < 1000 || nUnits < 50000) problems.push(`❌ walked only ${nFiles} files / ${nUnits} text units; expected the whole content/ tree`);

  for (const [rel, list] of byFile) {
    console.log(`❌ ${basename(rel)}  (${rel})`);
    for (const l of list) console.log(`  - ${l}`);
  }
  for (const p of problems) console.log(p);
  const n = [...byFile.values()].reduce((a, l) => a + l.length, 0);
  if (n || problems.length) {
    console.log(`check:content-claims: ${n} banned claim(s) in ${byFile.size} file(s), ${problems.length} other problem(s). Fix the sentence (date it, or say the current rule), or allowlist a true historical mention in scripts/content-claims-allow.json.`);
    process.exit(1);
  }
  console.log(`check:content-claims: ${nFiles} files, ${nUnits} text units clean (${RULES.length} rules, ${MUST_FIRE.length + MUST_PASS.length} fixtures, ${allow.length} allowlisted).`);
}

main();

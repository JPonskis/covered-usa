/**
 * Proof harness for the bill-analyzer accuracy fix.
 * Run: npm run test:bill-analyzer
 * No database, no network. Imports the real modules — not copies of them.
 */
import { buildAnalyzedItems, buildSummary, findRepeatGroups } from '../src/lib/bill-analyzer/summary'
import { classifyLine } from '../src/lib/bill-analyzer/code-router'
import { getBenchmark } from '../src/lib/bill-analyzer/benchmark'
import { buildCharityCareResult } from '../src/lib/bill-analyzer/charity'
import { buildDisputeLetter } from '../src/lib/bill-analyzer/letter'
import { buildAllowedFigures, scrubOutbound } from '../src/lib/bill-analyzer/outbound-guard'
import { headlineRange, coverageSentence } from '../src/lib/bill-analyzer/headline'
import { buildBillAnalysisHtml } from '../src/emails/BillAnalysisEmail'
import { isConfidentHospitalMatch, normalizeHospitalName } from '../src/lib/bill-analyzer/hospital-match'

let pass = 0
const failures: string[] = []

function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; return }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}
function eq(name: string, actual: unknown, expected: unknown) {
  check(name, actual === expected, `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
}

const rate = (code: string, facility: number, nonFacility = facility * 1.4) => [
  code,
  { hcpcsCode: code, modifier: '', facilityRate: facility, nonFacilityRate: nonFacility, description: code },
] as const

// ─────────────────────────────────────────────────────────────
// A1. The headline never counts a charge we could not price.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 100 },
    { description: 'Chemotherapy drug', code: 'J9035', codeSource: 'printed' as const, family: 'drug' as const, quantity: 1, totalCharge: 37000 },
  ]
  const rates = new Map([rate('99213', 40)])
  const items = buildAnalyzedItems(routed, rates)
  const s = buildSummary(items, { totalBilled: 37100 })

  eq('A1 overcharge is rated-lines only', s.totalOvercharge, 60)
  eq('A1 unbenchmarked bucket holds the drug line', s.totalUnbenchmarked, 37000)
  eq('A1 percent uses the rated-only denominator', s.overchargePercent, 150)
  eq('A1 coverage counts', `${s.lineItemsWithRates}/${s.lineItemsAnalyzed}`, '1/2')
  check('A1 headline is independent of the unpriced charge', (() => {
    const bigger = buildSummary(
      buildAnalyzedItems(
        [routed[0], { ...routed[1], totalCharge: 999999 }],
        rates
      ),
      { totalBilled: 1000099 }
    )
    return bigger.totalOvercharge === s.totalOvercharge
  })())
  // The old bug, stated as a test: the bad formula would have said 37,060.
  check('A1 does NOT reproduce the mixed-denominator value', s.totalOvercharge !== 37100 - 40)
}

// ─────────────────────────────────────────────────────────────
// A3. The bill reconciles on screen.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 420 },
    { description: 'CBC', code: '85025', codeSource: 'printed' as const, family: 'lab' as const, quantity: 1, totalCharge: 180 },
    { description: 'ER facility fee', code: undefined, codeSource: 'none' as const, family: 'opps_facility' as const, quantity: 1, totalCharge: 2400 },
    { description: 'Knee arthroscopy', code: '29881', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 6000 },
  ]
  const rates = new Map([rate('99213', 63.72), rate('29881', 600)])
  const items = buildAnalyzedItems(routed, rates)
  const s = buildSummary(items, { totalBilled: 9000 })

  eq('A3 reconciles', Math.round(s.totalBenchmarkedBilled + s.totalUnbenchmarked), 9000)
  eq('A3 unbenchmarked count', s.unbenchmarkedCount, 2)
  check('A3 every unpriced line explains itself',
    items.filter(i => i.medicareRate == null).every(i => !!i.unbenchmarkedReason && i.unbenchmarkedReason.length > 20))
  check('A3 every priced line names its benchmark',
    items.filter(i => i.medicareRate != null).every(i => i.benchmarkSource?.includes('facility')))
}

// ─────────────────────────────────────────────────────────────
// A4. You cannot save more than you owe.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'Surgery', code: '29881', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 10000 },
  ]
  const rates = new Map([rate('29881', 600)])
  const insured = buildSummary(buildAnalyzedItems(routed, rates), {
    totalBilled: 10000, insuranceAdjustment: 6000, patientResponsibility: 1200,
  })
  eq('A4 headline capped at what you owe', insured.totalOvercharge, 1200)
  eq('A4 low end also capped', insured.overchargeRangeLow, 1200)
  eq('A4 basis is patient responsibility', insured.analysisBasis, 'patient_responsibility')

  const adjOnly = buildSummary(buildAnalyzedItems(routed, rates), { totalBilled: 10000, insuranceAdjustment: 6000 })
  eq('A4 adjustment-only basis', adjOnly.analysisBasis, 'post_insurance_adjustment')
  const gross = buildSummary(buildAnalyzedItems(routed, rates), { totalBilled: 10000 })
  eq('A4 uninsured basis', gross.analysisBasis, 'gross')
  eq('A4 uninsured headline is uncapped', gross.totalOvercharge, 9400)
}

// ─────────────────────────────────────────────────────────────
// A5. No false duplicate accusations, no double counting.
// ─────────────────────────────────────────────────────────────
{
  const twoDrugDoses = [
    { description: 'Ondansetron 4mg', code: 'J2405', codeSource: 'printed' as const, family: 'drug' as const, quantity: 1, totalCharge: 90 },
    { description: 'Ondansetron 4mg', code: 'J2405', codeSource: 'printed' as const, family: 'drug' as const, quantity: 1, totalCharge: 90 },
  ]
  const drugItems = buildAnalyzedItems(twoDrugDoses, new Map())
  eq('A5 two doses of a drug raise no flag', drugItems.reduce((n, i) => n + i.flags.length, 0), 0)
  check('A5 the word "error" never appears on a repeat',
    !JSON.stringify(drugItems).toLowerCase().includes('error'))

  const twoVisits = [
    { description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 200 },
    { description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 200 },
  ]
  const visitItems = buildAnalyzedItems(twoVisits, new Map([rate('99213', 63.72)]))
  const visitSummary = buildSummary(visitItems, { totalBilled: 400 })
  eq('A5 a repeated pair counts once', visitSummary.errorsFound, 1)
  eq('A5 repeat severity is not high', visitItems.flatMap(i => i.flags).every(f => f.severity !== 'high'), true)

  const groups = findRepeatGroups([
    { code: 'A', description: 'x', family: 'pfs' },
    { code: 'A', description: 'x', family: 'pfs' },
    { code: 'A', description: 'x', family: 'pfs' },
    { code: 'B', description: 'y', family: 'pfs' },
  ])
  eq('A5 three of a kind is one group', groups.length, 1)
  eq('A5 group holds all three', groups[0].indices.length, 3)
}

// ─────────────────────────────────────────────────────────────
// A6. Range framing, and a quantity-aware comparison.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 1000 },
  ]
  const s = buildSummary(buildAnalyzedItems(routed, new Map([rate('99213', 100)])), { totalBilled: 1000 })
  eq('A6 high end is above raw Medicare', s.overchargeRangeHigh, 900)
  eq('A6 low end is above 2.5x Medicare', s.overchargeRangeLow, 750)
  check('A6 low <= high', s.overchargeRangeLow <= s.overchargeRangeHigh)
  check('A6 range renders as a range', headlineRange(s) === '$750 to $900', headlineRange(s) ?? 'null')

  // Quantity: three units billed must compare against three units of rate.
  const qty = buildAnalyzedItems(
    [{ description: 'X-ray', code: '71046', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 3, totalCharge: 300 }],
    new Map([rate('71046', 40)])
  )
  eq('A6 rate scales with quantity', qty[0].medicareRate, 120)
  eq('A6 overcharge uses the scaled rate', qty[0].overchargeAmount, 180)
}

// ─────────────────────────────────────────────────────────────
// A8. Zero coverage produces no dollar claim at all.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'ER facility fee', code: undefined, codeSource: 'none' as const, family: 'opps_facility' as const, quantity: 1, totalCharge: 4000 },
    { description: 'Anesthesia', code: '00790', codeSource: 'printed' as const, family: 'anesthesia' as const, quantity: 1, totalCharge: 2200 },
  ]
  const items = buildAnalyzedItems(routed, new Map())
  const s = buildSummary(items, { totalBilled: 6200 })
  eq('A8 coverage is none', s.coverageLevel, 'none')
  eq('A8 no headline figure', headlineRange(s), null)
  eq('A8 zero-coverage sentence is explicit',
    coverageSentence(s), 'We could not compare any of the 2 charges on this bill to a federal benchmark.')

  const letter = buildDisputeLetter({
    analysis: {
      provider: { name: 'Valley Medical Center', nonprofitStatus: 'unknown' },
      lineItems: items,
      summary: s,
      charityCare: buildCharityCareResult('unknown', null, undefined, undefined, 'Valley Medical Center'),
      disclaimer: 'x',
    },
    patientName: 'Jane Doe',
  })
  check('A8 zero-coverage letter claims no savings',
    !/overcharge of|in savings|potential savings|refund of/i.test(letter))
  check('A8 zero-coverage letter still asks for an itemized statement',
    /itemized statement/i.test(letter))
  const guard = scrubOutbound(letter, buildAllowedFigures({
    provider: { name: 'Valley Medical Center', nonprofitStatus: 'unknown' },
    lineItems: items, summary: s,
    charityCare: buildCharityCareResult('unknown', null, undefined, undefined, 'V'),
    disclaimer: 'x',
  }))
  check('A8 guard passes a clean letter', guard.ok, JSON.stringify(guard.violations))
}

// The guard must still CATCH a bad figure, or it proves nothing.
{
  const allowed = new Set([100, 200])
  eq('A8 guard catches an untraceable figure', scrubOutbound('We recovered $9,400 for you.', allowed).ok, false)
  eq('A8 guard tolerates rounding drift', scrubOutbound('$101 and $199', allowed).ok, true)
  eq('A8 guard accepts traceable figures', scrubOutbound('$100 plus $200', allowed).ok, true)
}

// ─────────────────────────────────────────────────────────────
// A9. A lookup miss is unknown, never for-profit.
// ─────────────────────────────────────────────────────────────
{
  const miss = buildCharityCareResult('unknown', null, 20000, 2, 'Mercy General')
  eq('A9 miss is eligibility unknown', miss.eligibility, 'unknown')
  eq('A9 miss is status unknown', miss.nonprofitStatus, 'unknown')
  check('A9 miss never says for-profit', !/for-profit/i.test(miss.explanation + miss.nextSteps.join(' ')))
  check('A9 miss never says you qualify', !/likely qualify/i.test(miss.explanation))
  check('A9 miss tells them how to check', /financial assistance policy/i.test(miss.nextSteps.join(' ')))

  const nonprofitNoLimit = buildCharityCareResult('nonprofit', { is_nonprofit: true }, 20000, 2, 'Mercy General')
  eq('A9 nonprofit with no published cutoff is unknown', nonprofitNoLimit.eligibility, 'unknown')
  check('A9 no cutoff never says you qualify', !/likely qualify/i.test(nonprofitNoLimit.explanation))
  check('A9 no cutoff never tells them to withhold payment',
    !/do not pay/i.test(nonprofitNoLimit.nextSteps.join(' ')))

  const nonprofitNoIncome = buildCharityCareResult('nonprofit', { is_nonprofit: true, income_limit_fpl_percent: 300 }, undefined, undefined, 'Mercy')
  eq('A9 nonprofit with no income is unknown', nonprofitNoIncome.eligibility, 'unknown')

  const qualifies = buildCharityCareResult('nonprofit', { is_nonprofit: true, income_limit_fpl_percent: 300 }, 20000, 2, 'Mercy')
  eq('A9 confirmed nonprofit + cutoff + low income is likely', qualifies.eligibility, 'likely')
  check('A9 the one confident case cites both numbers', /300%/.test(qualifies.explanation) && /95%/.test(qualifies.explanation), qualifies.explanation)

  const over = buildCharityCareResult('nonprofit', { is_nonprofit: true, income_limit_fpl_percent: 200 }, 90000, 2, 'Mercy')
  eq('A9 above the cutoff is unlikely', over.eligibility, 'unlikely')

  const forProfit = buildCharityCareResult('for_profit', { is_nonprofit: false }, 20000, 2, 'HCA Houston')
  eq('A9 a confirmed for-profit is still reported', forProfit.nonprofitStatus, 'for_profit')
}

// ─────────────────────────────────────────────────────────────
// A10. A guessed code never drives an accusation.
// ─────────────────────────────────────────────────────────────
{
  const inferred = buildAnalyzedItems(
    [{ description: 'Mystery service', code: '99213', codeSource: 'inferred' as const, family: 'pfs' as const, quantity: 1, totalCharge: 5000 }],
    new Map([rate('99213', 63.72)])
  )
  eq('A10 inferred line is labeled estimated', inferred[0].benchmarkConfidence, 'estimated')
  eq('A10 inferred line raises no overcoding flag', inferred[0].flags.length, 0)
  const s = buildSummary(inferred, { totalBilled: 5000 })
  eq('A10 inferred excluded from the conservative end', s.overchargeRangeLow, 0)
  check('A10 inferred still counts toward the generous end', s.overchargeRangeHigh > 0)

  const printed = buildAnalyzedItems(
    [{ description: 'Office visit', code: '99213', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 5000 }],
    new Map([rate('99213', 63.72)])
  )
  eq('A10 a printed code at 78x DOES flag', printed[0].flags.filter(f => f.type === 'overcoding').length, 1)
}

// ─────────────────────────────────────────────────────────────
// B1. Facility column, with the artifact guard.
// ─────────────────────────────────────────────────────────────
{
  const r = { hcpcsCode: '99213', modifier: '', facilityRate: 63.72, nonFacilityRate: 88.95, description: '' }
  const b = getBenchmark('pfs', r, 1)
  check('B1 benchmarks off the facility column', b.benchmarked && b.amount === 63.72, JSON.stringify(b))

  // 0446T: facility 54.67, non-facility 5846.63. Facility is the sane one.
  const artifact = { hcpcsCode: '0446T', modifier: '', facilityRate: 54.67, nonFacilityRate: 5846.63, description: '' }
  const ab = getBenchmark('pfs', artifact, 1)
  check('B1 the 107x artifact never becomes the benchmark', ab.benchmarked && ab.amount === 54.67, JSON.stringify(ab))

  const noFacility = { hcpcsCode: 'X', modifier: '', facilityRate: 0, nonFacilityRate: 120, description: '' }
  check('B1 no facility rate means unbenchmarked, not a fallback',
    !getBenchmark('pfs', noFacility, 1).benchmarked)

  const inverted = { hcpcsCode: 'Y', modifier: '', facilityRate: 5000, nonFacilityRate: 50, description: '' }
  check('B1 inverted artifact is refused', !getBenchmark('pfs', inverted, 1).benchmarked)

  for (const fam of ['drug', 'lab', 'anesthesia', 'dme', 'ambulance', 'opps_facility', 'inpatient_drg', 'unknown'] as const) {
    const res = getBenchmark(fam, r, 1)
    check(`B1 ${fam} is never priced off the physician schedule`, !res.benchmarked)
  }
}

// ─────────────────────────────────────────────────────────────
// B2. The router sends each line to the right payment system.
// ─────────────────────────────────────────────────────────────
{
  const cases: Array<[string | undefined, string, string]> = [
    ['99213', 'Office visit', 'pfs'],
    ['29881', 'Knee arthroscopy', 'pfs'],
    ['00790', 'Anesthesia for upper abdomen', 'anesthesia'],
    ['J9035', 'Bevacizumab injection', 'drug'],
    ['J1885', 'Ketorolac injection', 'drug'],
    ['85025', 'Complete blood count', 'lab'],
    ['80053', 'Comprehensive metabolic panel', 'lab'],
    ['36415', 'Venipuncture', 'pfs'],
    ['E0143', 'Walker, folding', 'dme'],
    ['L1832', 'Knee orthosis', 'dme'],
    ['A0428', 'Ambulance, BLS', 'ambulance'],
    ['P9612', 'Catheterization for specimen', 'lab'],
    [undefined, 'Emergency room facility fee', 'opps_facility'],
    [undefined, 'Semi-private room and board', 'inpatient_drg'],
    [undefined, 'Anesthesia services', 'anesthesia'],
    [undefined, 'Something unreadable', 'unknown'],
  ]
  for (const [code, desc, expected] of cases) {
    eq(`B2 ${code ?? desc} routes to ${expected}`, classifyLine(code, desc), expected)
  }
}

// ─────────────────────────────────────────────────────────────
// The letter: questions and rights, no asserted totals.
// ─────────────────────────────────────────────────────────────
{
  const routed = [
    { description: 'ER visit level 4', code: '99284', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 4200 },
    { description: 'CBC', code: '85025', codeSource: 'printed' as const, family: 'lab' as const, quantity: 1, totalCharge: 890 },
    { description: 'ER facility fee', code: undefined, codeSource: 'none' as const, family: 'opps_facility' as const, quantity: 1, totalCharge: 2400 },
    { description: 'ER visit level 4', code: '99284', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 4200 },
  ]
  const items = buildAnalyzedItems(routed, new Map([rate('99284', 180)]))
  const summary = buildSummary(items, { totalBilled: 11690 })
  const analysis = {
    provider: { name: 'Valley Medical Center', nonprofitStatus: 'nonprofit' as const, fapUrl: 'https://example.org/fap' },
    lineItems: items, summary,
    charityCare: buildCharityCareResult('nonprofit', { is_nonprofit: true, fap_url: 'https://example.org/fap', income_limit_fpl_percent: 300 }, 20000, 2, 'Valley Medical Center'),
    disclaimer: 'x',
  }
  const letter = buildDisputeLetter({ analysis, patientName: 'Jane Doe', accountNumber: 'VMC-1', dateOfService: 'April 28, 2026' })

  check('letter requests an itemized statement', /itemized statement/i.test(letter))
  check('letter asks rather than accuses', /please explain how this charge was set/i.test(letter))
  check('letter never claims a total overcharge',
    !/total overcharge|potential overcharge|you owe us|refund of \$/i.test(letter))
  check('letter never calls an unpriced charge an overcharge', (() => {
    const section = letter.split('Please itemize and justify these charges.')[1] ?? ''
    return !/overcharge/i.test(section)
  })())
  check('letter invokes 501(r) only on a confirmed nonprofit', /501\(r\)/.test(letter))
  check('letter cites price transparency as a request', /45 CFR Part 180/.test(letter))
  check('letter asks to confirm repeats, not to admit them',
    /confirm these repeated charges/i.test(letter) && !/duplicate billing error/i.test(letter))
  const g = scrubOutbound(letter, buildAllowedFigures(analysis))
  check('letter carries no untraceable dollar figure', g.ok, JSON.stringify(g.violations))

  // 501(r) must be ABSENT when we have not confirmed nonprofit status.
  const unknownLetter = buildDisputeLetter({
    analysis: { ...analysis,
      provider: { name: 'Valley Medical Center', nonprofitStatus: 'unknown' },
      charityCare: buildCharityCareResult('unknown', null, 20000, 2, 'Valley Medical Center') },
    patientName: 'Jane Doe',
  })
  check('letter does not assert 501(r) rights on an unconfirmed hospital',
    !/is a nonprofit hospital\. Under section 501\(r\)/.test(unknownLetter))
  check('letter still asks the nonprofit question',
    /whether you have a written financial assistance/i.test(unknownLetter))
}

// ─────────────────────────────────────────────────────────────
// The email: the surface that used to shout the whole bill as savings.
// ─────────────────────────────────────────────────────────────
{
  const r = (c: string, f: number) =>
    [c, { hcpcsCode: c, modifier: '', facilityRate: f, nonFacilityRate: f, description: '' }] as const

  function emailFor(routed: any[], rates: Map<string, any>, totalBilled: number, np: any, hosp: any) {
    const items = buildAnalyzedItems(routed, rates)
    const summary = buildSummary(items, { totalBilled })
    const analysis = {
      provider: { name: 'Valley Medical Center', nonprofitStatus: np },
      lineItems: items,
      summary,
      charityCare: buildCharityCareResult(np, hosp, 24000, 2, 'Valley Medical Center'),
      disclaimer: 'x',
    }
    const html = buildBillAnalysisHtml({ firstName: 'Jane', analysis: analysis as any, letterGenerated: true, resultId: 'abc' })
    return { html, analysis, guard: scrubOutbound(html, buildAllowedFigures(analysis as any)) }
  }

  const normal = emailFor(
    [
      { description: 'ER visit, Level 4', code: '99284', codeSource: 'printed', family: 'pfs', quantity: 1, totalCharge: 4200 },
      { description: 'ER facility fee', code: undefined, codeSource: 'none', family: 'opps_facility', quantity: 1, totalCharge: 2400 },
    ],
    new Map([r('99284', 116.45)]), 6600, 'nonprofit',
    { is_nonprofit: true, income_limit_fpl_percent: 300, hospital_name: 'Valley Medical Center' }
  )
  check('email carries no untraceable figure', normal.guard.ok, JSON.stringify(normal.guard.violations))
  check('email states the coverage ratio', /We compared 1 of 2 charges/.test(normal.html))
  check('email shows the unpriced bucket', /could not price 1 charge totaling \$2,400/.test(normal.html))
  check('email no longer says "potential savings"', !/potential savings/i.test(normal.html))
  check('email frames flags as questions, not findings',
    /Questions to raise, not findings of error/.test(normal.html))

  // The zero-coverage case: the old email claimed the WHOLE BILL as savings here.
  const zero = emailFor(
    [
      { description: 'ER facility fee', code: undefined, codeSource: 'none', family: 'opps_facility', quantity: 1, totalCharge: 4000 },
      { description: 'Anesthesia', code: '00790', codeSource: 'printed', family: 'anesthesia', quantity: 1, totalCharge: 2200 },
    ],
    new Map(), 6200, 'unknown', null
  )
  check('zero-coverage email carries no untraceable figure', zero.guard.ok, JSON.stringify(zero.guard.violations))
  check('zero-coverage email makes no savings claim',
    !/above the Medicare|potential savings|in savings/i.test(zero.html))
  check('zero-coverage email says plainly that it priced nothing',
    /could not compare any of the 2 charges/.test(zero.html))
  check('zero-coverage email never asserts for-profit', !/for-profit/i.test(zero.html))
  check('zero-coverage email still gives the 501\(r\) check',
    /financial assistance policy/i.test(zero.html))
}

// ─────────────────────────────────────────────────────────────
// The hospital match. A confident answer about the WRONG hospital is worse
// than no answer — this is the real bug a live run turned up.
// ─────────────────────────────────────────────────────────────
{
  eq('match normalizes punctuation', normalizeHospitalName("St. Luke's Hospital"), 'st lukes hospital')

  // The exact live failure: a bill saying "Valley Medical Center" matched
  // "Valley Medical Center Phoenix" and we quoted Phoenix's FAP and cutoff.
  eq('a superset name in another state is REJECTED',
    isConfidentHospitalMatch({ hospital_name: 'Valley Medical Center Phoenix', state: 'AZ' }, 'Valley Medical Center', undefined), false)
  eq('a superset name with no state on the bill is REJECTED',
    isConfidentHospitalMatch({ hospital_name: 'Valley Medical Center Phoenix', state: 'AZ' }, 'Valley Medical Center'), false)
  eq('a superset name in a DIFFERENT state is REJECTED',
    isConfidentHospitalMatch({ hospital_name: 'Valley Medical Center Phoenix', state: 'AZ' }, 'Valley Medical Center', 'WA'), false)

  eq('an exact name is accepted with no state',
    isConfidentHospitalMatch({ hospital_name: 'Valley Medical Center', state: 'WA' }, 'Valley Medical Center'), true)
  eq('punctuation differences still match',
    isConfidentHospitalMatch({ hospital_name: 'St Lukes Hospital', state: 'MO' }, "St. Luke's Hospital"), true)
  eq('a longer stored name IS accepted when the state agrees',
    isConfidentHospitalMatch({ hospital_name: 'Valley Medical Center Phoenix', state: 'AZ' }, 'Valley Medical Center', 'AZ'), true)
  eq('a different hospital in the same state is REJECTED',
    isConfidentHospitalMatch({ hospital_name: 'Mercy General Hospital', state: 'CA' }, 'Sutter Medical Center', 'CA'), false)
  eq('a null row is a miss', isConfidentHospitalMatch(null, 'Anything'), false)
  eq('an all-generic bill name cannot match across states',
    isConfidentHospitalMatch({ hospital_name: 'Community Regional Medical Center', state: 'CA' }, 'Medical Center', 'CA'), false)
}

// A patient responsibility equal to the whole bill is not "after insurance".
{
  const routed = [{ description: 'Surgery', code: '29881', codeSource: 'printed' as const, family: 'pfs' as const, quantity: 1, totalCharge: 20000 }]
  const rates = new Map([rate('29881', 538.25)])
  const uninsured = buildSummary(buildAnalyzedItems(routed, rates), { totalBilled: 20000, patientResponsibility: 20000 })
  eq('full-bill responsibility is reported as gross', uninsured.analysisBasis, 'gross')
  const insured = buildSummary(buildAnalyzedItems(routed, rates), { totalBilled: 20000, patientResponsibility: 1200 })
  eq('a reduced balance is reported as after-insurance', insured.analysisBasis, 'patient_responsibility')
  eq('and it still caps the headline', insured.totalOvercharge, 1200)
}

console.log(`\n${pass} checks passed, ${failures.length} failed`)
if (failures.length) {
  console.error('\nFAILURES:')
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log('All green.')

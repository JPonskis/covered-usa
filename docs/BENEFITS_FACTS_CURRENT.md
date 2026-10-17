# Benefits facts: current rules and dates (CoveredUSA)

**The engine (src/lib/eligibility) is the source of truth for numbers; import or quote it; this file states the
RULES and dates writers keep getting wrong.** CoveredUSA's engine holds health figures only (poverty guidelines,
Medicaid, CHIP, ACA, Medicare, SSI). For SNAP and tax-credit figures, which CoveredUSA has no engine for, use the
figures and sources printed here; they match BenefitsUSA's engine (`benefits-navigator`, `src/lib/eligibility/programs/`).

- **Last verified:** October 16, 2026, from the October 2026 eligibility audit (clawd workspace,
  `projects/benefits-usa/research/eligibility-audit-2026-10/`: REPORT.md, the W1 to W8 worker files, the W9 critic
  files and `engine-fixes/notes/`). Where a worker and a critic disagreed, this file follows the critic.
- **Re-check this file on:** November 1, 2026 (ACA 2027 coverage), the day CMS publishes 2027 Part A and B
  (usually mid-November), January 1, 2027 (SSA and Medicare 2027), the January 2027 poverty guidelines, and
  October 1, 2027 (SNAP FY2028). When the engine changes a figure or a rule below, change this file in the same commit.

## How to use this file

- **Writers:** read this whole file before you research. A claim that contradicts it is an error, even when a web
  page you found says otherwise. Many pages online, and many older pages on our own site, still print the pre-2025
  rules.
- **Verifiers:** flag any claim that contradicts this file, and any figure that does not match the engine for the
  period the reader is in.
- **Numbers:** take them from the engine file named in each section, never from memory. The few figures printed
  here are the ones writers keep getting wrong, each with its period and its primary source.
- **Dates:** every rule has a start date. If a date here has passed and the article calls something "coming", or a
  figure's period has ended, check the engine and the primary source before writing.
- **Citations:** an article cites the agency or the statute listed here, never this file.

## Where the numbers live (CoveredUSA engine)

| What | File |
|---|---|
| Poverty guidelines (2026 current, 2025 prior) | `src/lib/eligibility/fpl-guidelines.ts`, `fpl.ts` |
| ACA coverage year, percentages, 400% line | `src/lib/eligibility/programs/aca.ts` |
| Medicaid and CHIP rules and state limits | `src/lib/eligibility/programs/medicaid.ts`, `programs/chip.ts`, `src/lib/states/data/*.json` |
| Medicare and SSI figures, one dated row per year | `src/lib/eligibility/constants.ts` (`MEDICARE_BY_YEAR`, `SSA_BY_YEAR`) |
| Medicare Savings Programs | `src/lib/eligibility/programs/medicare-savings.ts` |
| 2025-law caveat wording, English and Spanish | `src/lib/eligibility/caveats.ts` |
| SNAP and tax credits | no CoveredUSA engine; sections 2 and 5 below (BenefitsUSA's `snap.ts`, `ctc.ts`, `eitc.ts`) |

---

## 1. Which period a figure belongs to

- **SNAP** runs on the federal fiscal year, October 1 to September 30. FY2027 took effect October 1, 2026.
  Source: USDA FY2027 cost-of-living page, fna.usda.gov/snap/allotment/cola.
- **SSI, Social Security and Medicare** figures run on the calendar year and change January 1. The 2027 SSA figures
  are announced but are not in effect until January 2027. Source: ssa.gov/cola; ssa.gov/oact/cola/SSIamts.html.
- **ACA Marketplace:** from November 1, 2026, people shopping are buying 2027 coverage, which uses the 2026 poverty
  guidelines and the 2027 percentages. Before November 1 the 2026-coverage rules apply. Source: HealthCare.gov
  dates page ("Starting November 1, you can apply for 2027 coverage"); 26 CFR 1.36B-1(h); Rev. Proc. 2026-26.
- **Tax credits:** a tax year is the year the income was earned, and the return is filed the next spring. From
  October 16, 2026 until the April 15, 2027 filing deadline, present **tax year 2026** figures (returns filed in
  2027) as current. Keep tax year 2025 figures only for people filing a 2025 return late, labeled that way. **Never
  present tax year 2027 figures as current before mid-April 2027**, even after the IRS publishes them (expected late
  October to November 2026), and then only labeled "tax year 2027, filed in 2028". Source: Rev. Proc. 2025-32
  sec. 4.05 and 4.06 ("For taxable years beginning in 2026"); audit critic W9_critic_W3 on W3-15.
- **Poverty guidelines:** HHS publishes new ones in January or February. Never project 2027 guidelines. School-meal
  income limits stay on the 2026 guidelines from July 1, 2026 to June 30, 2027, even after the 2027 guidelines come
  out. WIC's do too, unless a state chooses to switch earlier (no later than July 1, 2027). Source: aspe.hhs.gov poverty guidelines; WIC income eligibility guidelines, 91 FR 23050
  ("effective July 1, 2026"); child nutrition guidelines, 91 FR 17932.

## 2. SNAP

- **FY2027 maximum monthly benefit, 48 states and DC (October 1, 2026 to September 30, 2027):** 1 person $306,
  2 $562, 3 $808, 4 $1,023, 5 $1,217, 6 $1,463, 7 $1,616, 8 $1,841, each additional person $225. **Minimum benefit
  for 1 or 2 people: $25.** Excess shelter deduction cap $769. Asset limits $3,000, or $4,750 for a household with
  an elderly or disabled member (many states drop the asset test through broad-based categorical eligibility).
  Alaska, Hawaii, Guam and the US Virgin Islands have their own, higher tables. Source: USDA FY2027 COLA page
  (fna.usda.gov/snap/allotment/cola), Tables 1, 3 and 5, and the FY2027 minimum allotment table. BenefitsUSA engine: `programs/snap.ts`.
- **Income tests use the 2026 poverty guidelines:** net limit 100%, gross limit 130% (for example, net $1,330 a
  month for 1 person, gross $3,575 a month for 4). Source: USDA FY2027 income eligibility standards (same page).
- **Work rule (time limit), in effect since July 4, 2025:** adults **18 to 64** with **no child under 14** in the
  household can usually get SNAP for only 3 months in 3 years unless they work or train 20 hours a week, get
  unemployment benefits, or qualify for another exemption. Pregnant women stay exempt. Veterans, people experiencing
  homelessness and former foster youth are no longer exempt. As of October 1, 2026 there are no statewide waivers,
  and area waivers cover parts of 12 states (AK, AZ, CA, KY, MI, MN, NV, NJ, NM, NY, OR, WI); a waiver now needs
  local unemployment over 10%. Never cut an estimate because of this rule: say "usually" and name the exemptions.
  Source: P.L. 119-21 sec. 10102 (7 USC 2015(o)(3)); FNS memo, October 3, 2025 ("These changes were effective upon
  enactment, July 4, 2025"); FNS "Status of State ABAWD Time Limit Waivers, FY2027 Q1"; 7 CFR 273.7(b)(1)(v)
  (unemployment compensation). **Do not cite eCFR 7 CFR 273.24(c) or FNS's older work-requirements page: both
  still print the old ages.**
- **Immigrants, in effect since July 4, 2025** (new applicants at once, current households at recertification):
  SNAP is limited to citizens and nationals, green card holders, Cuban and Haitian entrants, and citizens of
  Micronesia, the Marshall Islands and Palau. **Refugees, asylees and parolees without a green card no longer
  qualify.** Many green card holders must wait 5 years first; exceptions include children under 18, 40 quarters of
  work, blindness or disability, and a military connection. In a mixed-status family the members who qualify can
  still get SNAP. Write "many must wait 5 years first", not "after 5 years in that status" (that point is in
  litigation; do not describe the litigation's outcome). Source: P.L. 119-21 sec. 10108 (7 USC 2015(f)); FNS memo,
  October 31, 2025, Attachment 1.
- **Internet costs no longer count** toward the shelter or utility deduction, since July 4, 2025. Source: P.L.
  119-21 sec. 10104; FNS information memo, September 2025 ("effective upon enactment").
- **SSI counts as SNAP income.** Veterans' educational benefits are excluded. Source: 7 CFR 273.9(b)(2)(i) and
  273.9(c)(3)(i).
- **Broad-based categorical eligibility (BBCE):** in a BBCE state, a household under the state's gross income limit
  does not have to meet the net income test, and a 1 or 2 person household then gets at least the $25 minimum.
  Georgia is stricter: a BBCE household of 3 or more above the net limit gets nothing. Each state's BBCE limit is on
  the USDA chart. Source: 7 CFR 273.9(a) and 273.10(e)(2)(ii)(C); USDA BBCE chart, fna.usda.gov/snap/broad-based-categorical-eligibility (updated June 29, 2026);
  Georgia SNAP Manual 3210.

## 3. Medicaid and CHIP

- **Immigrants, from October 1, 2026:** full Medicaid and CHIP are limited to citizens and nationals, green card
  holders, Cuban and Haitian entrants, and citizens of Micronesia, the Marshall Islands and Palau. **Refugees,
  asylees, parolees and other immigrants without a green card generally no longer qualify.** Keep these carve-outs
  in the copy: emergency Medicaid still pays for emergency care for people who would otherwise qualify; states may
  still cover lawfully residing children and pregnant women (the CHIPRA 214 option, which is federally matched);
  coverage a state keeps with only its own money is a "state-funded program", not Medicaid. Source: P.L. 119-21
  sec. 71109 (new SSA 1903(v)(5); CHIP through 2107(e)(1)(R)); CMS SHO #26-001 (April 8, 2026). Engine wording:
  `caveats.ts`.
- **The 5-year wait for green card holders:** most must wait 5 years from the date they got a qualifying status
  (not the date they arrived). **No wait** for people who came as refugees or asylees (or with withholding of
  removal, as Cuban and Haitian entrants, or as Amerasians), for veterans, active-duty service members and their
  families, or for citizens of Micronesia, the Marshall Islands and Palau. **VAWA self-petitioners, SIJS youth and
  40 quarters of work do not shorten the Medicaid wait** (40 quarters matters for SNAP, not Medicaid). Source: 8 USC
  1613(a) and (b); CMS SHO #26-001 ("states must continue to apply the five-year waiting period to LPRs");
  HealthCare.gov lawfully-present-immigrants page.
- **DACA recipients have never been eligible for full federal Medicaid or CHIP** (deferred action is not a
  qualifying status, and the CHIPRA 214 option excludes them). Do not attribute this to a lawsuit or a judge. Source: CMS SHO #26-001, Table 1 note 9; CMCS SHO #12-002.
- **California, since January 1, 2026:** new undocumented applicants 19 and older get restricted-scope Medi-Cal
  only. Children 18 and younger and pregnant people are not affected. Source: DHCS ACWDL 25-33 (December 30, 2025),
  AB 116 (Ch. 21, Stats. 2025).
- **Work requirement:** for adults 19 to 64 in the expansion group, and for adults covered through certain waivers
  (Georgia's and Wisconsin's), work is a **condition of eligibility**: 80 hours a month of work, school, job
  training or volunteering, or monthly income of at least 80 times the federal minimum wage ($580). A state can make
  applicants show 1 to 3 months before they apply, so the copy says **"get and keep"** coverage, never only "keep".
  Exempt groups include parents or caretakers of a child 13 or younger, pregnant women, and people who are medically
  frail. **Dates:** Nebraska since May 1, 2026; Montana live July 1, 2026, with denials and disenrollment from
  October 2026; Iowa for people who apply on or after December 1, 2026; every other expansion state no later than
  January 1, 2027, unless the state gets a good-faith exemption, which can run no later than December 31, 2028.
  Write "starting as early as January 2027, depending on your state". **For an expansion adult, never deny the
  rule or say that employment makes no difference.** Source: P.L. 119-21 sec. 71119 (SSA 1902(xx));
  interim final rule 91 FR 33348 (June 3, 2026; "States are required to implement the new requirement no later
  than January 1, 2027"); Nebraska DHHS release; Montana DPHHS FAQ; Iowa HHS IHAWP page.
- **6-month renewals:** expansion adults whose renewal is scheduled on or after January 1, 2027 must renew every 6
  months instead of once a year. American Indians and Alaska Natives are exempt. Whether Wisconsin's waiver adults
  are included is unresolved, so do not say either way. Source: P.L. 119-21 sec. 71107.
- **A pregnant woman's household size counts herself plus the number of babies she expects.** Source: 42 CFR
  435.603(b).
- **Wisconsin covers adults up to 100% FPL** under BadgerCare Plus ($1,330 a month for 1 person, February 1, 2026
  to January 31, 2027), so Wisconsin adults are not in the coverage gap. Source: Wisconsin DHS, BadgerCare Plus
  income limits page (revised July 10, 2026).
- **2026 poverty guidelines (Medicaid and CHIP use the current year):** $15,960 for 1 person plus $5,680 for each
  additional person in the 48 states and DC; Alaska $19,950 plus $7,100; Hawaii $18,360 plus $6,530. Source: ASPE
  2026 poverty guidelines. Engine: `fpl-guidelines.ts`.

## 4. ACA Marketplace and the premium tax credit

- **2026 coverage:** the enhanced premium tax credits ended December 31, 2025 and were not extended, so the 400% of
  poverty cap is back. 2026 coverage is measured against the **2025** guidelines: $15,650 to $62,600 for 1 person,
  $32,150 to $128,600 for 4. Expected contribution 2.10% to 9.96% of income; employer coverage is "affordable" at
  9.96%. Never promise American Rescue Plan help above 400%. Source: 26 USC 36B; H.R. 1834 (extension) not enacted,
  last action February 10, 2026; Rev. Proc. 2025-25 sec. 3.01 and 3.02; 26 CFR 1.36B-1(h).
- **2027 coverage, sold from November 1, 2026** (open enrollment November 1, 2026 to January 15, 2027; sign up by
  December 15 for coverage starting January 1): measured against the **2026** guidelines: $15,960 to $63,840 for 1,
  $33,000 to $132,000 for 4. Expected contribution 2.15% to 10.22%; affordability 10.22%. The 400% cap stays.
  The December 15 deadline is on appeal (4th Cir. No. 26-1938, tentatively set for argument October 27 to 30, 2026), so re-check
  HealthCare.gov's dates before printing them. Source: HealthCare.gov dates page; 26 CFR 1.36B-1(h); Rev. Proc.
  2026-26 sec. 3.01 and 3.02. Engine: `programs/aca.ts`.
- **The coverage gap:** an adult under 100% of poverty in a state that did not expand Medicaid gets no premium tax
  credit. Since 2026 there is no exception for lawfully present immigrants under 100%. Source: 26 USC 36B(c)(1)(A);
  P.L. 119-21 sec. 71302 (struck 36B(c)(1)(B) for taxable years after December 31, 2025).
- **Immigrants, 2027 coverage:** the premium tax credit is limited to citizens, green card holders (including those
  still in the 5-year wait and refugees who later got one), Cuban and Haitian entrants, and citizens of Micronesia,
  the Marshall Islands and Palau. Refugees, asylees, TPS holders, parolees and visa holders no longer get it, though
  they can still buy a Marketplace plan at full price. Any promise of the credit to a refugee, asylee, TPS holder, parolee
  or visa holder must be dated "2026 coverage". Source: P.L. 119-21 sec. 71301(b) (new 26 USC 36B(e)(2)(B)) and 71301(e) ("taxable years
  beginning after December 31, 2026"); HealthCare.gov immigration-status page.
- **DACA, since August 25, 2025:** DACA recipients cannot buy a plan through HealthCare.gov or a state Marketplace,
  or get the premium tax credit or cost-sharing reductions, in any state. They can buy a plan directly from an
  insurer at full price. Source: 90 FR 27074 (June 25, 2025; "These regulations are effective on August 25, 2025");
  HealthCare.gov ("DACA recipients aren't eligible for Marketplace coverage").
- **Income for the credit counts all Social Security benefits**, including the part that is not taxed. Source: 26
  USC 36B(d)(2)(B)(iii).

## 5. Tax credits

- **Child Tax Credit: $2,200 per child under 17**, from tax year 2025 (it was $2,000 through 2024). The enacted law
  is $2,200, not $2,500. Tax year 2026 is also $2,200. Source: P.L. 119-21 sec. 70104(a)(2) and (f); Rev. Proc.
  2025-32 sec. 4.05(1). BenefitsUSA engine: `programs/ctc.ts`.
- **The refundable part is up to $1,700 per child for tax year 2026, and only 15% of earned income above $2,500.**
  The rest of the credit only reduces tax owed. A family with little or no earnings and no tax owed gets little or
  no CTC; a grandparent living only on Social Security gets none. "No earned income means no CTC" is also wrong: a
  person who owes tax from a pension or IRA can use the nonrefundable part. Source: Rev. Proc. 2025-32 sec. 4.05(2);
  26 USC 24(d)(1)(B) and 24(h)(6).
- **Phase-out starts at $200,000** of income ($400,000 married filing jointly). Source: 26 USC 24(h)(3).
- **Social Security numbers, from tax year 2025:** the filer, or at least one spouse on a joint return, needs a
  Social Security number valid for work, and each child needs one too. An ITIN filer cannot claim the CTC or its
  refundable part, but may claim the $500 Credit for Other Dependents for each child, only up to the tax owed.
  Source: 26 USC 24(h)(7) and 24(h)(4)(C) (P.L. 119-21 sec. 70104(b), (f)); 2025 Schedule 8812 instructions;
  irs.gov Child Tax Credit page.
- **EITC, tax year 2026 (filed in 2027): maximum credit $664 with no qualifying child, $4,427 with 1, $7,316 with
  2, $8,231 with 3 or more.** Income must be under the completed phase-out: single or head of household $19,540 /
  $51,593 / $58,629 / $62,974; married filing jointly $26,820 / $58,863 / $65,899 / $70,244. Investment income limit
  $12,200. Source: Rev. Proc. 2025-32 sec. 4.06. BenefitsUSA engine: `programs/eitc.ts`.
- **EITC Social Security numbers:** the filer and, on a joint return, the spouse both need one valid for work, so a
  joint return with one ITIN spouse gets no EITC (stricter than the CTC). Each qualifying child needs one too; a
  child without one does not count, but the filer may still get the smaller credit for workers without a qualifying
  child. Source: 26 USC 32(c)(1)(E), 32(m) and 32(c)(3)(D); IRS Pub. 596 (2025), Rule 2; irs.gov "Who qualifies
  for the EITC".
- **No EITC without a qualifying child for anyone 65 or older** at the end of the tax year, so most retirees with no
  qualifying children get none. Source: 26 USC 32(c)(1)(A)(ii)(II).
- **IRS Free File:** $89,000 of income or less was the limit for 2025 returns (the 2026 filing season, open through
  October 15, 2026). The IRS sets the limit for 2026 returns in January; do not state one before then. Source:
  IR-2026-101 (August 26, 2026).
- **VITA free tax help:** no program-wide income limit; the IRS says it serves people who "generally make about
  $70,244 or less", and each site may set its own. Source: irs.gov VITA page (reviewed October 12, 2026).
- **Late returns and amendments:** generally 3 years after you filed. The 2022 window closed April 15, 2026 for
  nearly everyone; 2023 stays open until April 15, 2027. Source: Form 1040-X instructions (Rev. December 2025);
  IR-2026-37 (March 20, 2026).

## 6. Medicare

- **2026: Part B standard premium $202.90 a month, Part B deductible $283** (2025 was $185.00). Source: CMS fact
  sheet "2026 Medicare Parts A & B Premiums and Deductibles" (November 14, 2025): "will be $202.90 for 2026 ... will
  be $283 in 2026". Engine: `constants.ts` (`MEDICARE_BY_YEAR`).
- **2027 Part A and Part B premiums, deductibles and IRMAA brackets are NOT published** (checked October 16, 2026;
  CMS usually publishes them in mid-November). Do not estimate them. A Medicare Trustees Report projection is not
  the premium: if an article uses one, it says "projected" and names the report. $202.90 stays the current premium
  through December 31, 2026. Source: CMS newsroom (no 2027 fact sheet as of October 16, 2026).
- Other 2027 Medicare figures CMS has published (for example the 2027 Part D out-of-pocket cap of $2,400, up from
  $2,100 in 2026) take effect January 1, 2027. Label them "2027". Source: CMS CY2027 Rate Announcement, Table V-2.
  Engine: `constants.ts`.
- **General Enrollment Period (January 1 to March 31):** coverage starts the month after you sign up. That rule
  started January 1, 2023; "coverage starts July 1" is out of date. Source: medicare.gov, "When does Medicare
  coverage start?"

## 7. SSI and Social Security disability figures

- **2026, in effect now:** SSI $994 a month for an individual, $1,491 for a couple; substantial gainful activity
  (SGA) $1,690 a month, $2,830 if blind; trial work month $1,210. Source: 90 FR 49047 (SSI); SSA 2027 COLA fact
  sheet, 2026 column (ssa.gov/news/en/cola/factsheets/2027.html). Engine: `constants.ts` (`SSA_BY_YEAR`, SSI
  only; SGA and trial work are not in CoveredUSA's engine).
- **2027, announced October 14, 2026 (3.6% COLA), in effect January 2027:** SSI $1,029 / $1,544; SGA $1,770, $2,950
  if blind; trial work month $1,270. SSI's January 2027 payment arrives December 31, 2026. Until then, write the
  2026 figures as current and the 2027 figures as "announced for 2027". Source: SSA 2027 COLA fact sheet;
  ssa.gov/oact/cola/SSIamts.html ("2027 3.6% 1,029.00 1,544.00"); ssa.gov/cola ("Increased payments to about 7.3
  million SSI recipients will begin on December 31, 2026").
- **$967 / $1,450 are the 2025 SSI rates.** Never present them as 2026 or current. Source: 90 FR 49047 ("For 2025
  ... $967 ... $1,450").
- **Essential person:** $498 in 2026, $516 in 2027, and it exists only for someone who has lived with the recipient
  since 1973 under a state aid plan. It is not a caregiver payment. Source: 90 FR 49047; ssa.gov/oact/cola/SSI.html;
  20 CFR 416.220 and 416.222.

## 8. Stale claims to flag

Each of these was found in live or queued articles during the audit. A verifier treats any of them as an error.

| Claim still found | Why it is wrong | Write instead (source above) |
|---|---|---|
| SSI "$967" or "$1,450" as the 2026 or current rate | Those are 2025 rates (90 FR 49047) | $994 / $1,491 for 2026 (section 7) |
| A SNAP maximum other than the FY2027 table, such as $292 / $975 / $23 | Those are FY2025 (USDA FY2025 allotments PDF); FY2025 and FY2026 tables have expired | FY2027 table (section 2) |
| SNAP work rule for ages 18 to 49, 18 to 52 or 18 to 54, or "a child under 18" | Pre-2025 rule | 18 to 64, no child under 14 (section 2) |
| Refugees or asylees "qualify immediately" for SNAP or Medicaid | Ended July 4, 2025 (SNAP) and October 1, 2026 (Medicaid) | Sections 2 and 3 |
| Refugee green card holders "must wait 5 years" | 8 USC 1613(b) exempts them | Section 3 |
| 40 quarters, VAWA or SIJS "skip the 5-year Medicaid wait" | Not in 8 USC 1613(b) | Section 3 |
| "Medicaid has no work requirement" or "employment makes no difference" for an expansion adult | P.L. 119-21 sec. 71119 | Section 3 |
| "Lawfully present immigrants" get the premium tax credit, with no year | Ends with 2027 coverage | Date it "2026 coverage" and add the 2027 rule (section 4) |
| DACA recipients can use HealthCare.gov or get subsidies | Ended August 25, 2025 | Section 4 |
| Only taxable Social Security counts for ACA income | All of it counts | Section 4 |
| CTC "$2,000 per child" as current, or "$2,500 for 2026 to 2028" | $2,200 since tax year 2025 | Section 5 |
| ITIN filers "can claim the CTC" | 26 USC 24(h)(7) since tax year 2025 | $500 Credit for Other Dependents (section 5) |
| EITC "up to $7,830" or "$7,430" as current | Tax years 2024 and 2023 (irs.gov EITC tables page) | $8,231 for tax year 2026 (section 5) |
| The full CTC for a low-earning or non-working family | Refundable part is 15% of earnings above $2,500, capped at $1,700 | Section 5 |
| Retirees 65+ with no qualifying child can get the EITC | 26 USC 32(c)(1)(A)(ii)(II) | Section 5 |
| Free File "$84,000"; VITA "$67,000" | $84,000 was the 2025-season Free File limit (IR-2026-101 gives $89,000 for 2025 returns); $67,000 is an old VITA figure (irs.gov VITA page) | Section 5 |
| "You can still amend your 2022 return" | Window closed April 15, 2026 | Section 5 |
| Part B "$185" as the 2026 premium | That was 2025 (CMS 2026 fact sheet: "from $185.00 in 2025") | $202.90 (section 6) |
| A 2027 Part B premium stated as fact | CMS has not published it | Section 6 |
| GEP "coverage starts July 1" | Changed January 1, 2023 | Section 6 |
| Internet counts as a SNAP utility cost; SSI is not counted as SNAP income | P.L. 119-21 sec. 10104; 7 CFR 273.9(b)(2)(i) | Section 2 |
| A pregnant woman's household is only the people already living there | 42 CFR 435.603(b) | Section 3 |

## 9. Not published yet (never estimate these)

As of October 16, 2026: 2027 Medicare Part A and B premiums, deductibles and IRMAA (CMS, usually November); 2027
Medicare Savings Program and Extra Help resource limits (CMS); the 2027 poverty guidelines (HHS, January); tax year
2027 EITC and CTC figures (IRS, expected late October to November, and not for use as current until mid-April 2027);
the Free File limit for 2026 returns (IRS, January); VA pension rates from December 1, 2026 (VA); 2027 state SSI
supplements. Source: REPORT.md "Not published yet"; the engine's empty 2027 slots.

## 10. The gates are not the rules

`node scripts/check-content-claims.mjs` (refugees "immediately", "no work requirement", $185 Part B, DACA
Marketplace, the 2027 credit, the repealed under-100% exception, 40 quarters, VAWA and SIJS) and `npm run
check:constants` catch some known stale claims in `content/`, and the drip publisher runs the same content check
before a page ships. Passing them does not make a claim true: they match known patterns, not the rules above, and
they cannot see a claim split across table cells. Read this file.

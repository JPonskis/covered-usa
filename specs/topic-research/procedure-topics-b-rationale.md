# Procedure Topics — Agent B (Coverage + Intuition) Rationale

**Date:** 2026-05-15
**Template:** `/cost/[procedure]` (per FANOUT_FORMULA §4.1)
**Agent:** B (coverage breadth, competitor enumeration, intuition — paired with Agent A's Bing-API data work)
**Total topics proposed:** 116

---

## Methodology

Five inputs, in this order:

1. **Already-shipped + already-queued audit.** mri / ct-scan / colonoscopy live; 7 more in `_queue.json` (mammogram, x-ray, ultrasound, echocardiogram, ER visit, urgent care, PT, upper endoscopy). Those are flagged `already_queued=y` in the CSV `sources` column. They are NOT scored low — they remain priority-1 in the master roadmap — they're just attributed.
2. **Competitor sitemap enumeration.** GoodRx (`goodrx.com/health-topic/.../cost`, `goodrx.com/conditions/.../cost`), SingleCare, ColonoscopyAssist, RadiologyAssist, Healthcare Bluebook, FAIR Health, Sidecar Health, Healthline.
3. **Obvious-50 brainstorm.** What 50 procedures would any healthcare-cost SEO operator obviously include? Anchored by category (imaging / GI / surgery / ER / labs / screening / maternity / mental health / dental / vision / hearing / vaccines / specialty).
4. **WebSearch organic question patterns.** "X cost reddit", "how much does X cost without insurance", "[procedure] cost in 2026". Reddit + r/HealthInsurance + r/AskDocs are the patient-question reservoir.
5. **State-fork test.** For each procedure: does the page legitimately fork by state? Procedure cost in general doesn't — body-part/site-of-service do the forking. Two exceptions where state DOES drive a different page: abortion (legal status varies → different paragraph), and dental (state Medicaid dental coverage varies). Flagged `state_specific=y` selectively.

### Cross-reference rules applied
- Already-live (mri, ct-scan, colonoscopy): excluded from the new-topics list.
- Already-queued: included with `already_queued=y` marker so Phase 4 merge doesn't duplicate them.
- BUSA overlap: scanned `busa-inventory.csv` for procedure-cost terms. BUSA's Cost/Bills bucket = 8 articles, all about hospital-bill help / charity care / general medical-debt — NOT procedure-cost lookups. Overlap is essentially zero across the entire procedure surface. Flagged `none` on all 116. (Exception: `having-a-baby` is BUSA-overlap as a life-event page but the cost-of-vaginal-delivery / C-section pages are CoveredUSA territory.)

---

## Obvious-50 brainstorm (the starting frame)

Wrote down before consulting competitors. This is what ANY healthcare-cost operator would include.

### Imaging (15)
mri, ct-scan, x-ray, ultrasound, mammogram, echocardiogram, pet-scan, dexa-bone-density, dental-x-ray, mri-with-contrast, ct-with-contrast, ultrasound-pregnancy, ultrasound-abdominal, mri-knee, mri-brain

### GI procedures (7)
colonoscopy, upper-endoscopy, sigmoidoscopy, endoscopic-ultrasound, capsule-endoscopy, ercp, liver-biopsy

### Major surgery (16)
appendectomy, gallbladder-surgery, hernia-repair, hysterectomy, c-section, vaginal-delivery, tonsillectomy, knee-replacement, hip-replacement, spinal-fusion, cataract-surgery, lasik, vasectomy, wisdom-teeth-removal, bariatric-surgery, heart-bypass

### ER + urgent care (5)
emergency-room-visit, urgent-care-visit, ambulance-ride, stitches, sprain-treatment

### Labs + diagnostics (8)
blood-test, lipid-panel, a1c-test, cbc-test, thyroid-test, vitamin-d-test, std-test, pregnancy-test-lab

### Screening / preventive (6)
mammogram-screening, prostate-psa-test, pap-smear, well-woman-exam, annual-physical, skin-cancer-screening

### Maternity (4)
prenatal-care, labor-and-delivery, postpartum-care, ivf-cycle

### Mental health (5)
therapy-session, psychiatric-evaluation, medication-management, intensive-outpatient-program, inpatient-mental-health

### Dental (8)
dental-cleaning, dental-filling, root-canal, dental-crown, dental-extraction, dental-implant, dentures, braces-orthodontics

### Vision (4)
eye-exam, eyeglasses, contact-lenses, lasik

### Hearing (2)
hearing-test, hearing-aids

### Vaccines (5)
flu-shot, shingles-vaccine, tdap-vaccine, hpv-vaccine, covid-booster

### Specialty / high-cost (6)
dialysis-session, chemotherapy-session, radiation-oncology, organ-transplant, nicu-stay, hospital-day

### Women's health / reproductive (5)
abortion, iud-insertion, birth-control-implant, sterilization-tubal, d-and-c

---

## After consulting competitors — additions and confirmations

### GoodRx-confirmed shapes (high-confidence add)

- `hernia-repair-surgery` (GoodRx has it; $4k-$11k range)
- `gynecomastia-surgery` (men's-health niche; GoodRx covers it; $5k-$10k)
- `breast-augmentation` (GoodRx)
- `bariatric-surgery` (GoodRx)
- `sleep-apnea-surgery` (GoodRx)
- `prostate-psa-test` (GoodRx; surprisingly weak field around it)
- `dental-cleaning` (GoodRx + Guardian + Delta Dental; classic Bing-citable lookup)
- `ultrasound-cost-without-insurance` (GoodRx broad page → CoveredUSA can fork by type)
- `blood-work` (GoodRx broad; ~$29-$99 per panel)
- `vasectomy` (GoodRx; $750-$1,500)
- `root-canal` (GoodRx covers; saturated category but real demand)
- `nexplanon-implant` (GoodRx covers; $1,000+ per implant)
- `d-and-c-after-miscarriage` (GoodRx covers as Q&A; CoveredUSA can do as cost page)
- `cataract-surgery` (GoodRx; $6k without insurance)
- `hip-replacement` (GoodRx; $31k-$45k)
- `open-heart-surgery` (GoodRx; $100k+)
- `therapy-session-cost` (GoodRx; $100-$250 per session)

### SingleCare-confirmed (medium add)

- `primary-care-visit-cost` (SingleCare; $150-$400)
- `iud-mirena-insertion` (SingleCare; $1,303 device + procedure)
- `iud-skyla-insertion` (SingleCare; $1,283)
- `vaginal-ring-annovera` (SingleCare; $2,670 — too narrow for own page, fold into birth-control-cost lighthouse)

### ColonoscopyAssist-confirmed shapes (city-fork warning)

ColonoscopyAssist has city-level pages (NYC $1,275, Boston $1,350, Chicago $1,195). City-fork is dangerous for CoveredUSA because we'd be entering a state×procedure×city permutation grid. **Decision: skip city forks.** Stay at the procedure level. State-fork only where legally meaningful (abortion).

### Sidecar Health / Bluebook / FAIR Health-confirmed

These are tool-driven competitors (search UI, not editorial). Their lookup data confirms procedure-by-state demand exists but they don't rank well. CoveredUSA's editorial+schema approach should outperform them at the procedure level.

### Things competitors do NOT cover well (CoveredUSA's lane)

- Site-of-service spread on most procedures (hospital vs ASC vs imaging center vs physician office) — GoodRx does it on big ones (MRI, colonoscopy), almost no one else does it consistently.
- CMS Medicare PFS / OPPS reimbursement rate as anchor — almost no competitor cites the actual CMS rate. This is CoveredUSA's authority moat.
- Good Faith Estimate (No Surprises Act) request workflow — totally underdone across the field.
- Spanish twins — basically nobody.

### Surprises during research

1. **Dental procedures are wildly under-covered.** Carriers (Delta Dental, Humana, Guardian) own the glossary-style pages, but GoodRx has only a few dental pages and the long tail is wide open. Add dental procedures aggressively.
2. **Mental health procedures (therapy/psych eval/IOP) are dominated by therapy directories (SonderMind, Octave, Grow Therapy, TherapyDen), not health-cost sites.** GoodRx has one therapy-cost page. Big opening.
3. **Vaccine costs are mostly CDC/HHS .gov + GoodRx.** Long tail (Shingrix specifically, HPV specifically) is real demand with thin SEO.
4. **Reproductive procedures (abortion / IUD / sterilization)** — Planned Parenthood + KFF own the head terms. CoveredUSA shouldn't try to displace Planned Parenthood on abortion (policy + brand barrier). But the cost-detail layer (`d-and-c-cost`, `iud-cost-without-insurance`, `tubal-ligation-cost`) is open.
5. **Outpatient labs (lipid panel, A1C, CBC, thyroid, vitamin D, STD)** are a TIER of opportunity. GoodRx has the umbrella `blood-work` page but doesn't fork to individual panels well. Lab-cost transparency is a real need post-No Surprises Act.

---

## Topics with weak competition (CoveredUSA can win cleanly)

These are pages where the competitive field is thin and CoveredUSA's formula (state-context-everywhere, GFE process, Medicare-rate anchor, Spanish twin) will dominate citation:

1. **`therapy-session-cost`** — GoodRx has one page; the rest is therapy-finder UI sites. Bing-citable lookup gap.
2. **`psychiatric-evaluation-cost`** — Almost no editorial coverage anywhere.
3. **`std-test-cost`** — GoodRx has weak coverage; Planned Parenthood owns "free testing" angle but cost-detail is open.
4. **`dental-filling-cost`**, **`dental-extraction-cost`**, **`dental-crown-cost`** — Carrier glossaries dominate but they're shallow. Detailed cost pages with state-Medicaid-dental fork = winnable.
5. **`urgent-care-visit-cost`** vs `er-visit-cost` — high search intent, weak editorial (mostly urgent-care brand sites). Already queued in `_queue.json`.
6. **`lipid-panel-cost`** / **`a1c-test-cost`** / **`vitamin-d-test-cost`** — long-tail labs with real demand and thin SEO.
7. **`prostate-psa-test-cost`** — GoodRx has it; otherwise weak field.
8. **`bone-density-dexa-scan-cost`** — radiology niche; GoodRx + ColonoscopyAssist-class only.
9. **`tubal-ligation-cost`** / **`vasectomy-reversal-cost`** — reproductive niches with thin SEO.
10. **`hearing-test-cost`** / **`hearing-aid-cost`** — Costco Hearing + AARP own this; editorial cost pages are weak.
11. **`shingles-vaccine-shingrix-cost`** — SingleCare has it; otherwise weak.
12. **`stitches-cost-emergency-room`** — head-term `er-visit-cost` is queued; this is the long-tail variant nobody covers well.
13. **`sprain-treatment-cost`** — same shape as stitches; weak field.

---

## Topics where competition is brutal (skip-list candidates)

Don't waste cycles trying to displace these competitors on head terms. Include the topic if it's necessary for completeness but don't expect to rank #1.

1. **`heart-bypass-cost`** / **`heart-valve-replacement`** — CBSNews + CostHelper + KFF + AHA editorial dense. Include as reference but priority-3.
2. **`organ-transplant-cost`** — Medicare.gov + UNOS + hospital-specific. We can't out-authority.
3. **`lasik-cost`** — LASIK Vision Institute + LasikPlus + GoodRx + countless surgery brand sites. Brutal AdWords market; SEO equally saturated. Include as priority-3.
4. **`abortion-cost`** — Planned Parenthood owns it (brand + .org authority + policy + advocacy). KFF for stats. We should NOT try to displace. Cover it factually for completeness with state-by-state legal status, but priority-2 max.
5. **`braces-orthodontics-cost`** — Smile Direct Club + Invisalign + countless orthodontist sites + GoodRx. Priority-3.
6. **`fertility-ivf-cost`** — RESOLVE + FertilityIQ + Shady Grove + countless fertility-clinic sites. Brutal. Priority-3.
7. **`bariatric-surgery-cost`** — GoodRx + obesity coverage advocacy + many bariatric-clinic SEO sites. Priority-2 because demand is real.

---

## Top-10 highest-confidence recommendations (CoveredUSA-wins-cleanly + real demand)

Ranked by combined competitor-weakness + Bing-citation-likelihood + funnel fit (analyzer):

1. **`therapy-session-cost`** — Massive demand, GoodRx is the only real competitor, mental-health-parity is the editorial angle. Analyzer fit excellent (cost question).
2. **`dental-cleaning-cost`** — Classic Bing-citable lookup. Carriers are shallow. State-Medicaid-dental fork sits next to it. Could spawn a dental-cost mini-cluster.
3. **`dental-filling-cost`** — Same logic as cleaning. Bing wants the dollar number.
4. **`er-visit-cost-by-level`** (CPT 99281-99285) — Already queued; the level-specific fork is rare and matches the CONTENT_INVENTORY CU-302/CU-306/CU-307/CU-310 angle. Strong analyzer fit (this is what bill analyzer surfaces).
5. **`urgent-care-visit-cost`** — Already queued; near-zero editorial competition; clean win.
6. **`mammogram-screening-vs-diagnostic-cost`** — Already queued (mammogram); the screening-vs-diagnostic fork is the audit-flagged "GFE/NSA" win shape.
7. **`std-test-cost-without-insurance`** — High intent, weak field, Bing-citable lookup.
8. **`vasectomy-cost`** — GoodRx has it but the long-tail (hospital vs ASC vs clinic) is open.
9. **`hearing-test-cost`** — Costco owns one angle; cost-transparency angle is open.
10. **`a1c-test-cost`** / **`lipid-panel-cost`** — Single-test lab forks under the blood-work umbrella. Bing-citable.

---

## Competitor density breakdown (final 116 topics)

- **low:** 47 topics (the long-tail labs, niche reproductive, specialty mental-health, hearing, smaller vaccines)
- **medium:** 51 topics (most surgeries, screenings, dental, vision, well-trafficked but with multiple competitors)
- **high:** 18 topics (the GoodRx + KFF + Planned Parenthood + Medicare.gov-dominated head terms — abortion, LASIK, IVF, bariatric, organ transplant, heart bypass, braces, hip replacement, knee replacement, MRI proper, colonoscopy proper, etc.)

---

## State-fork analysis

Procedure cost is generally state-uniform at the editorial level (regional variance exists but doesn't justify 50 unique pages per procedure). Exceptions:

- **`abortion`** — legal status forks by state (banned / restricted / protected). Real 50-state fork.
- **`dental` procedures** — state Medicaid dental coverage varies (some states cover adults, most don't). Medium fork potential (probably state Medicaid dental mini-pages, not 50 per procedure).
- **`emergency-room-visit`** — state surprise-billing laws fork (CA, NY, IL, MA, WA strong; TX/FL weak). Already covered in `state-surprise-medical-bill-protections` blog (live).

**Decision:** Only flag `state_specific=y` for abortion in this round. Defer dental state-fork to a Track D-style mini-factory decision.

---

## Validation sources keyed in CSV `sources` column

- `goodrx` = page found on goodrx.com
- `singlecare` = singlecare.com
- `colonoscopyassist` = colonoscopyassist.com
- `radiologyassist` = (implied; GoodRx + ColonoscopyAssist sibling)
- `kff` = kff.org coverage
- `cms` = procedure has CMS PFS/OPPS rate (every billable CPT)
- `healthline` = healthline.com cost page
- `nerdwallet` = nerdwallet.com cost page
- `webmd` = webmd.com cost / what-to-expect page
- `sidecar` = sidecarhealth.com cost-lookup tool
- `bluebook` = healthcarebluebook.com
- `fairhealth` = fairhealthconsumer.org
- `cdc` = cdc.gov vaccine price list
- `plannedparenthood` = plannedparenthood.org (reproductive procedures)
- `obvious-50` = my brainstorm; no competitor URL needed
- `already_queued=y` = procedure is in `content/data/procedures/_queue.json`
- `csv-overlap=y` = procedure title-matches a row in CONTENT_INVENTORY.md SEO Ideas sheet queue

---

*End of rationale.*

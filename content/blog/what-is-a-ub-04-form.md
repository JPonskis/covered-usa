---
title: "What Is a UB-04 Form? Decoding Your Hospital's Master Bill"
description: "The UB-04 is your hospital's master billing document. Learn what every field means, how to get yours, and how to spot overcharges before you pay."
date: "2026-05-27"
slug: "what-is-a-ub-04-form"
keywords: ["UB-04 form", "hospital bill explained", "CMS-1450", "medical billing codes", "how to read hospital bill"]
target: "analyzer"
---

Every time a hospital bills your insurance company, it sends a single document that summarizes your entire stay or visit in one dense grid of codes and numbers. That document is the UB-04 form, also called the CMS-1450. Most patients never see it. That is a problem, because it is the most complete record of what you were charged and why, and roughly 30 to 40 percent of hospital bills contain at least one error.

> **Quick Answer:** A UB-04 is the standardized claim form hospitals use to bill Medicare, Medicaid, and private insurers for facility services. It contains 81 data fields covering every charge from room and board to lab tests. As a patient, you have a [legal right under HIPAA](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access/index.html) to request your own UB-04, and doing so is the fastest way to find billing errors, duplicate charges, or services you never received.

This guide translates the form from billing department jargon into plain language so you can actually use it.

## What the UB-04 Is (and Is Not)

The UB-04 is not the same as the summary bill your hospital mails to you. That summary is a simplified statement showing totals owed. The UB-04 is the machine-readable claim your hospital transmitted to your insurer, and it contains the raw data behind every single charge.

A few things to know up front:

- **UB-04 = CMS-1450.** Both names refer to the same form. "UB" stands for Uniform Bill. The "04" refers to the 2004 revision that replaced the older UB-92.
- **It covers facility charges only.** Doctors who treated you during a hospital stay bill separately on a different form (the CMS-1500). If a surgeon operated on you, their fee appears on a separate claim, not on the UB-04.
- **Who fills it out.** The hospital's billing department completes it using your medical record, the hospital's charge master, and your insurance information. You never sign it. You just pay the resulting bill.

The UB-04 is used by hospitals, skilled nursing facilities, home health agencies, hospices, inpatient rehabilitation centers, and outpatient clinics. Any time a facility rather than an individual provider bills your insurer, the UB-04 is the form involved.

## The 81 Form Locators: A Patient-Friendly Map

The form is organized into numbered boxes called "form locators" (abbreviated FL). You do not need to memorize all 81. Here are the ones that matter most when you are reviewing a bill for errors.

### FL 1 to 3: Provider Information
These boxes identify the hospital: name, address, and National Provider Identifier (NPI). Verify this matches the actual facility where you were treated. Mismatched provider information can signal a billing mix-up.

### FL 4: Type of Bill (TOB)
A three-digit code that tells the insurer what kind of facility submitted the claim and what phase of care this claim covers. For example, 111 means an inpatient hospital claim for admit through discharge. If the TOB is wrong, your claim can be routed to the wrong benefit category and denied.

### FL 6: Statement Covers Period
The start and end dates of the services on this bill. Check these carefully. If the dates extend beyond when you were actually admitted or discharged, you may be billed for days you were not there.

### FL 12 and 13: Admission Date and Hour
When you were admitted, and at what hour. Hospitals sometimes bill a full room-and-board day for an admission that happened late in the evening, even though you only used a few hours of that day's services. This is a known source of overcharges.

### FL 17: Patient Discharge Status
A two-digit code describing where you went when you left. Code 01 means discharged to home. Code 20 means expired. Code 30 means still a patient (used for interim bills). If your discharge status code is wrong, it can trigger billing errors for post-discharge services you did not receive.

### FL 31 to 34: Occurrence Codes and Dates
These codes document specific events during your care, such as the date an accident occurred or when a Medicare eligibility determination was made. Errors here can affect how your coverage is applied.

### FL 42 to 49: Revenue Codes and Charges (The Most Important Section)
This is the line-item breakdown of your bill. Each row contains:

- **FL 42: Revenue Code** - A four-digit number identifying which hospital department provided the service. For example, 0120 is a general medical/surgical room, 0301 is laboratory, 0370 is anesthesia, 0450 is emergency room.
- **FL 43: Description** - A short text label for the service.
- **FL 44: HCPCS/CPT Code** - The procedure or supply code. These codes are standardized nationally, so you can look them up.
- **FL 46: Units** - How many times the service was provided. One of the most common errors is duplicate unit counts (being billed twice for the same service).
- **FL 47: Total Charges** - The dollar amount for that line.

This section is where patients find the most actionable errors: charges for services not received, duplicate line items, upcoded procedures (billing a more complex version of a service than was actually performed), and incorrect unit counts.

### FL 66 to 75: Diagnosis and Procedure Codes
These are ICD-10 codes describing your diagnoses and the procedures performed. The principal diagnosis (FL 66) drives most of what Medicare and Medicaid pay under the Diagnosis-Related Group (DRG) system. An incorrect principal diagnosis code can change your entire billing category and what you owe.

### FL 76 to 79: Attending and Operating Physicians
The names and NPIs of the physicians involved in your care. Verify that only physicians who actually treated you appear here.

### FL 80: Remarks
A free-text field where the hospital can add notes relevant to the claim. Occasionally contains information about prior authorization, medical necessity justifications, or coordination of benefits notes worth reviewing.

## Common Revenue Codes and What They Mean

When you review the FL 42 to 49 section, you will see a lot of four-digit revenue codes. Here is a quick reference for the most common ones patients encounter.

| Revenue Code | What It Means |
|---|---|
| 0100 to 0119 | Room and board, general |
| 0120 to 0129 | Room and board, medical/surgical |
| 0200 to 0219 | Intensive care unit |
| 0250 to 0259 | Pharmacy |
| 0270 to 0279 | Medical/surgical supplies |
| 0300 to 0319 | Laboratory |
| 0320 to 0329 | Radiology/X-ray |
| 0360 to 0369 | Operating room services |
| 0370 to 0379 | Anesthesia |
| 0450 to 0459 | Emergency room |
| 0481 | Cardiology (cardiac catheterization) |
| 0730 to 0739 | EKG/ECG |
| 0820 to 0829 | Hemodialysis |

If you see a revenue code for a department you do not remember visiting, that is a flag worth investigating. For instance, a code 0200 (ICU) on your bill when you stayed in a regular medical/surgical room is a clear error.

## UB-04 vs. Itemized Bill: Which One Do You Need?

These are two different documents, and ideally you want both.

| Document | What It Shows | Best Use |
|---|---|---|
| UB-04 (CMS-1450) | Coded summary with all 81 fields, sent to insurer | Comparing what was billed vs. what insurer paid; finding code errors |
| Itemized Bill | Plain-language line-by-line list of every charge | Understanding what you are being asked to pay; spotting duplicate services |
| Explanation of Benefits (EOB) | Insurer's breakdown of what they paid and denied | Comparing against UB-04 to find discrepancies |

Read all three together. The UB-04 tells you what the hospital told your insurer. The EOB tells you how the insurer responded. The itemized bill tells you what the hospital is asking you to pay directly. Discrepancies between these three documents are where billing errors hide.

## How to Request Your UB-04 in 2026

Under HIPAA, you have a legal right to access your billing records, including the UB-04. Hospitals must respond to written requests within 30 days, though many will provide documents faster if you call.

**Step 1: Call the hospital's billing department.**
Ask specifically for "a copy of my UB-04 claim form and itemized bill for my date of service." Have your account number, date of service, and date of birth ready.

**Step 2: Submit a written request if needed.**
If the billing department says they cannot provide it over the phone, follow up with a written HIPAA records request. Most hospitals have a form on their website, or you can send a letter to the Medical Records or Health Information Management department.

**Step 3: Give it 30 days.**
HIPAA requires a response within 30 days of a written request. If you do not hear back, call and reference your original request date.

**Step 4: Request your insurer's version.**
Call your insurance company and ask for the corresponding claim file and Explanation of Benefits. Your insurer received the same UB-04 the hospital submitted, so you can verify the hospital sent accurate information.

**Step 5: Compare the three documents.**
Line up the UB-04, itemized bill, and EOB side by side. Flag anything that appears on one document but not the others, any service you do not recognize, and any unit count that seems high.

## What to Do When You Find an Error

Errors on a UB-04 are more common than most people assume. A 2024 study in JAMA Health Forum found that 25 percent of patients who contacted billing offices about errors achieved corrections. Here is how to make that happen.

**Document everything.** Write down the specific line item, the revenue code, the charge amount, and why you believe it is wrong. The more specific you are, the harder it is for the billing department to brush you off.

**Call the billing department first.** Explain the specific discrepancy. Reference the revenue code and date of service. Ask them to review it and provide a corrected bill in writing.

**Escalate if needed.** If the billing department does not resolve it, ask to speak with a patient financial advocate or the hospital's patient services department. Most large hospitals have staff specifically for billing disputes.

**File an insurance appeal.** If the error affected what your insurer paid (for example, a wrong diagnosis code that caused a denial), file a formal appeal with your insurer citing the billing discrepancy.

**Contact your state insurance department.** Every state has a department that handles complaints against insurers and, in many cases, hospitals. Filing a formal complaint often accelerates resolution.

**Use the CFPB.** If the billing error has been sent to collections or affected your credit, file a complaint with the Consumer Financial Protection Bureau at consumerfinance.gov or by calling 855-411-2372.

## Charity Care and the UB-04 Connection

If you cannot afford to pay your hospital bill, your UB-04 is also relevant to charity care applications. Under [IRS Section 501(r)](https://www.irs.gov/charities-non-profits/financial-assistance-policy-and-emergency-medical-care-policy-section-501r4), every nonprofit hospital (which is most hospitals in the United States) must maintain a Financial Assistance Policy. Many programs cover patients earning up to 300 to 400 percent of the federal poverty level. For a family of four in 2026, that can mean income up to roughly $125,000.

When you apply for charity care, the hospital's billing department uses your UB-04 data to determine which charges the program will reduce or eliminate. Errors on the UB-04, such as an inflated total or a wrong diagnosis, can affect the charity care calculation. Getting the UB-04 corrected first is worth doing before submitting a financial assistance application.

To apply for charity care, call the hospital billing department and ask specifically: "Can I get a copy of your Financial Assistance Policy and an application?" They are legally required to provide it.

## How the CoveredUSA Bill Analyzer Can Help

Reading a UB-04 yourself is possible, but it takes time and familiarity with billing codes that most people do not have. The [CoveredUSA Bill Analyzer](/medical-bill-analyzer) was built to close that gap. Upload your hospital bill or UB-04, and the CoveredUSA Bill Analyzer compares each line item against Medicare reference rates and flags charges that exceed standard pricing, duplicate entries, and services that commonly trigger charity care eligibility.

You do not need to know what revenue code 0370 means. The tool does that translation for you.

Upload your hospital bill to the free CoveredUSA Bill Analyzer to find errors, overcharges, and charity care options in 30 seconds.

## Frequently Asked Questions

### What is a UB-04 form in simple terms?

A UB-04 is the official billing document a hospital sends to your insurance company after you receive care. It contains 81 fields covering every charge, diagnosis, and service during your visit. Think of it as the hospital's complete invoice to your insurer, coded in a standardized format that every payer in the country uses.

### Is a UB-04 the same as a CMS-1450?

Yes. UB-04 and CMS-1450 are two names for the same form. "UB-04" is the industry nickname (Uniform Bill, 2004 version). "CMS-1450" is the [official government designation](https://www.cms.gov/medicare/coding-billing/electronic-billing/institutional-paper-claim-form) from the Centers for Medicare and Medicaid Services.

### How do I get my UB-04 from a hospital?

Call the hospital billing department and request a copy of your UB-04 and itemized bill for your specific date of service. Have your account number and date of birth ready. Under HIPAA, the hospital must respond to a written request within 30 days, but many handle phone requests faster.

### Can I get a UB-04 for outpatient care, not just inpatient stays?

Yes. The UB-04 is used for any facility-based care, including outpatient visits, emergency room visits, same-day surgery, home health services, skilled nursing stays, and outpatient lab or imaging services billed by the facility.

### What is the difference between a UB-04 and a CMS-1500?

The UB-04 is used by facilities (hospitals, clinics, nursing homes). The CMS-1500 is used by individual providers (physicians, therapists, independent practitioners). If you had surgery, the hospital's facility charges are on a UB-04 while your surgeon's professional fee is billed separately on a CMS-1500.

### What are the most common errors on a UB-04?

The most common errors patients find are: duplicate service lines (same charge billed twice), incorrect unit counts (billed for more units than were provided), wrong revenue codes (billed for a higher-cost department than where service actually occurred), incorrect admission or discharge dates, and diagnosis codes that do not match the actual care provided.

### What should I do if I find an error on my UB-04?

Contact the hospital billing department with the specific line item, revenue code, and your reason for disputing it. Get their response in writing. If unresolved, escalate to the hospital's patient financial advocate, file an appeal with your insurer, or contact your state insurance department.

### Does every hospital use the UB-04?

In the United States, yes. The UB-04 is the standardized form required for institutional billing to Medicare, Medicaid, and virtually all private insurers. It is maintained by the National Uniform Billing Committee (NUBC) and has been the standard since 2007, replacing the older UB-92.

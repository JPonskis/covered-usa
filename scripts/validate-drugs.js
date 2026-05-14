#!/usr/bin/env node
/**
 * validate-drugs.js
 *
 * Build-time schema validator for drug JSON files at content/data/drugs/.
 * Same pattern as validate-procedures.js. Wired in as prebuild hook in
 * package.json. One bad JSON file fails Vercel build fast.
 */

const fs = require('fs');
const path = require('path');
const { validateContentQuality } = require('./lib/content-quality');

const DRUGS_DIR = path.join(__dirname, '..', 'content', 'data', 'drugs');

function isLocalizedString(v) {
  return v && typeof v === 'object' && typeof v.en === 'string' && typeof v.es === 'string';
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validateDrug(slug, data) {
  const errors = [];
  const warn = (msg) => errors.push(msg);

  // Top-level required fields
  if (data.slug !== slug) warn(`slug field "${data.slug}" doesn't match filename "${slug}"`);
  if (!isLocalizedString(data.drugName)) warn('drugName must be {en, es}');
  if (!isLocalizedString(data.shortName)) warn('shortName must be {en, es}');
  if (typeof data.nonProprietaryName !== 'string') warn('nonProprietaryName must be a string');
  if (!Array.isArray(data.brandNames)) warn('brandNames must be an array');
  if (!isLocalizedString(data.drugClass)) warn('drugClass must be {en, es}');
  if (typeof data.routeOfAdministration !== 'string') warn('routeOfAdministration must be a string');
  if (typeof data.medicalSpecialty !== 'string') warn('medicalSpecialty must be a string');
  if (!isISODate(data.lastUpdated)) warn(`lastUpdated "${data.lastUpdated}" not ISO YYYY-MM-DD`);
  if (typeof data.readingTime !== 'string') warn('readingTime must be a string');
  if (!Array.isArray(data.hcpcsJCodes)) warn('hcpcsJCodes must be an array');

  // meta
  if (!data.meta || !isLocalizedString(data.meta.title) || !isLocalizedString(data.meta.description))
    warn('meta.title and meta.description must be {en, es}');

  // hero
  if (!data.hero || !isLocalizedString(data.hero.h1) || !isLocalizedString(data.hero.subhero))
    warn('hero.h1 and hero.subhero must be {en, es}');

  // quickAnswer
  if (!isLocalizedString(data.quickAnswer)) warn('quickAnswer must be {en, es}');

  // pricing
  if (!data.pricing) {
    warn('pricing object missing');
  } else {
    const p = data.pricing;
    // medicareAspPerUnit + medicareAspUnit are nullable (null for oral Part D drugs)
    if (p.medicareAspPerUnit !== null && typeof p.medicareAspPerUnit !== 'number')
      warn('pricing.medicareAspPerUnit must be a number or null (null for oral Part D drugs)');
    if (p.medicareAspUnit !== null && !isLocalizedString(p.medicareAspUnit))
      warn('pricing.medicareAspUnit must be {en, es} or null');
    // cross-field: ASP and ASP unit must be both null or both non-null
    if ((p.medicareAspPerUnit === null) !== (p.medicareAspUnit === null))
      warn('pricing.medicareAspPerUnit and medicareAspUnit must both be null or both non-null');
    if (typeof p.retailLow !== 'number') warn('pricing.retailLow must be a number');
    if (typeof p.retailHigh !== 'number') warn('pricing.retailHigh must be a number');
    if (!isLocalizedString(p.retailUnit)) warn('pricing.retailUnit must be {en, es}');
    if (typeof p.inpatientLow !== 'number') warn('pricing.inpatientLow must be a number');
    if (typeof p.inpatientHigh !== 'number') warn('pricing.inpatientHigh must be a number');
    if (!isLocalizedString(p.inpatientUnit)) warn('pricing.inpatientUnit must be {en, es}');
    if (p.medicarePartDMonthlyCap !== null && typeof p.medicarePartDMonthlyCap !== 'number')
      warn('pricing.medicarePartDMonthlyCap must be a number or null');
    if (p.medicaidCopayLow !== null && typeof p.medicaidCopayLow !== 'number')
      warn('pricing.medicaidCopayLow must be a number or null');
    if (p.medicaidCopayHigh !== null && typeof p.medicaidCopayHigh !== 'number')
      warn('pricing.medicaidCopayHigh must be a number or null');
    if (typeof p.partBDeductibleYear !== 'number') warn('pricing.partBDeductibleYear must be a number');
    if (typeof p.partBDeductibleAmount !== 'number')
      warn('pricing.partBDeductibleAmount must be a number');
    if (typeof p.partDAnnualOopCap !== 'number') warn('pricing.partDAnnualOopCap must be a number');
    if (p.retailLow > p.retailHigh)
      warn(`pricing: retailLow (${p.retailLow}) > retailHigh (${p.retailHigh})`);
    if (p.inpatientLow > p.inpatientHigh)
      warn(`pricing: inpatientLow (${p.inpatientLow}) > inpatientHigh (${p.inpatientHigh})`);
    if (p.partBDeductibleYear === 2026 && p.partBDeductibleAmount !== 283)
      warn(`pricing: 2026 Part B deductible should be 283, got ${p.partBDeductibleAmount}`);
    if (p.partBDeductibleYear === 2026 && p.partDAnnualOopCap !== 2100)
      warn(`pricing: 2026 Part D OOP cap should be 2100, got ${p.partDAnnualOopCap}`);
  }

  // iraNegotiation (optional, but if present must be complete)
  if (data.iraNegotiation !== undefined) {
    const ira = data.iraNegotiation;
    if (typeof ira.maxFairPrice !== 'number') warn('iraNegotiation.maxFairPrice must be a number');
    if (typeof ira.listPriceBefore !== 'number') warn('iraNegotiation.listPriceBefore must be a number');
    if (typeof ira.effectiveDate !== 'string') warn('iraNegotiation.effectiveDate must be a string');
    if (typeof ira.source !== 'string') warn('iraNegotiation.source must be a string');
    if (!isLocalizedString(ira.callout)) warn('iraNegotiation.callout must be {en,es}');
  }

  // cross-field: hasSpecificCap requires monthlyCap to be non-null
  if (data.medicarePartD && data.medicarePartD.hasSpecificCap === true &&
      data.pricing && data.pricing.medicarePartDMonthlyCap === null) {
    warn('medicarePartD.hasSpecificCap is true but pricing.medicarePartDMonthlyCap is null');
  }

  // introParagraphs
  if (!Array.isArray(data.introParagraphs) || data.introParagraphs.length < 1)
    warn('introParagraphs must be a non-empty array of {en,es}');
  else data.introParagraphs.forEach((p, i) => {
    if (!isLocalizedString(p)) warn(`introParagraphs[${i}] must be {en, es}`);
  });

  // pointOfPay
  if (!data.pointOfPay) {
    warn('pointOfPay object missing');
  } else {
    if (!Array.isArray(data.pointOfPay.rows) || data.pointOfPay.rows.length < 1)
      warn('pointOfPay.rows must be a non-empty array');
    else data.pointOfPay.rows.forEach((r, i) => {
      if (!isLocalizedString(r.pointOfPay)) warn(`pointOfPay.rows[${i}].pointOfPay must be {en,es}`);
      if (!isLocalizedString(r.cost)) warn(`pointOfPay.rows[${i}].cost must be {en,es}`);
      if (!isLocalizedString(r.notes)) warn(`pointOfPay.rows[${i}].notes must be {en,es}`);
    });
    if (!isLocalizedString(data.pointOfPay.tableFootnote))
      warn('pointOfPay.tableFootnote must be {en,es}');
    if (typeof data.pointOfPay.tableSource !== 'string')
      warn('pointOfPay.tableSource must be a string');
  }

  // whyHospitalsCharge
  if (!data.whyHospitalsCharge || !Array.isArray(data.whyHospitalsCharge.paragraphs))
    warn('whyHospitalsCharge.paragraphs must be an array');

  // hcpcsSection (optional)
  if (data.hcpcsSection !== undefined) {
    if (!isLocalizedString(data.hcpcsSection.intro)) warn('hcpcsSection.intro must be {en,es}');
    if (!Array.isArray(data.hcpcsSection.rows)) warn('hcpcsSection.rows must be an array');
    else data.hcpcsSection.rows.forEach((r, i) => {
      if (typeof r.code !== 'string') warn(`hcpcsSection.rows[${i}].code must be a string`);
      if (!isLocalizedString(r.description))
        warn(`hcpcsSection.rows[${i}].description must be {en,es}`);
      if (!isLocalizedString(r.whatToLookFor))
        warn(`hcpcsSection.rows[${i}].whatToLookFor must be {en,es}`);
    });
  }

  // patientAssistancePrograms (optional)
  if (data.patientAssistancePrograms !== undefined) {
    if (!isLocalizedString(data.patientAssistancePrograms.intro))
      warn('patientAssistancePrograms.intro must be {en,es}');
    if (!Array.isArray(data.patientAssistancePrograms.rows))
      warn('patientAssistancePrograms.rows must be an array');
    else data.patientAssistancePrograms.rows.forEach((r, i) => {
      if (typeof r.program !== 'string')
        warn(`patientAssistancePrograms.rows[${i}].program must be a string`);
      if (!isLocalizedString(r.costBenefit))
        warn(`patientAssistancePrograms.rows[${i}].costBenefit must be {en,es}`);
      if (typeof r.howToApply !== 'string')
        warn(`patientAssistancePrograms.rows[${i}].howToApply must be a string`);
    });
  }

  // medicarePartD (optional)
  if (data.medicarePartD !== undefined) {
    if (typeof data.medicarePartD.hasSpecificCap !== 'boolean')
      warn('medicarePartD.hasSpecificCap must be a boolean');
    if (!Array.isArray(data.medicarePartD.paragraphs))
      warn('medicarePartD.paragraphs must be an array');
  }

  // commonBillingErrors (optional)
  if (data.commonBillingErrors !== undefined) {
    if (!isLocalizedString(data.commonBillingErrors.intro))
      warn('commonBillingErrors.intro must be {en,es}');
    if (!Array.isArray(data.commonBillingErrors.items))
      warn('commonBillingErrors.items must be an array');
  }

  // faqs — CRITICAL: en/es arrays of FLAT {question,answer} strings, NOT LocalizedString
  if (!data.faqs || !Array.isArray(data.faqs.en) || !Array.isArray(data.faqs.es)) {
    warn('faqs.en and faqs.es must each be arrays');
  } else {
    data.faqs.en.forEach((f, i) => {
      if (typeof f.question !== 'string')
        warn(`faqs.en[${i}].question must be a flat string (not LocalizedString)`);
      if (typeof f.answer !== 'string')
        warn(`faqs.en[${i}].answer must be a flat string (not LocalizedString)`);
    });
    data.faqs.es.forEach((f, i) => {
      if (typeof f.question !== 'string')
        warn(`faqs.es[${i}].question must be a flat string (not LocalizedString)`);
      if (typeof f.answer !== 'string')
        warn(`faqs.es[${i}].answer must be a flat string (not LocalizedString)`);
    });
    if (data.faqs.en.length !== data.faqs.es.length)
      warn(`faqs.en (${data.faqs.en.length}) and faqs.es (${data.faqs.es.length}) length mismatch`);
  }

  // relatedLinks
  if (!Array.isArray(data.relatedLinks)) warn('relatedLinks must be an array');
  else data.relatedLinks.forEach((l, i) => {
    if (!isLocalizedString(l.label)) warn(`relatedLinks[${i}].label must be {en,es}`);
    if (typeof l.href !== 'string') warn(`relatedLinks[${i}].href must be a string`);
  });

  // sources
  if (!Array.isArray(data.sources) || data.sources.length < 1) {
    warn('sources must be a non-empty array');
  } else {
    data.sources.forEach((s, i) => {
      if (typeof s.name !== 'string') warn(`sources[${i}].name must be a string`);
      if (typeof s.url !== 'string') warn(`sources[${i}].url must be a string`);
      if (!isLocalizedString(s.note)) warn(`sources[${i}].note must be {en,es}`);
    });
  }

  return errors;
}

function main() {
  if (!fs.existsSync(DRUGS_DIR)) {
    // Acceptable: drugs dir might not exist yet on first deploy
    console.log('No drugs dir found (skipping).');
    return;
  }
  const files = fs
    .readdirSync(DRUGS_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_') && !f.endsWith('.tmp.json'));

  let totalErrors = 0;
  let badFiles = 0;

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const filePath = path.join(DRUGS_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`❌ ${file}: failed to parse JSON — ${err.message}`);
      totalErrors++;
      badFiles++;
      continue;
    }
    const errors = validateDrug(slug, data);
    const cq = validateContentQuality(slug, data);
    cq.warnings.forEach((w) => console.warn(`  ⚠️  ${file}: ${w}`));
    const allErrors = [...errors, ...cq.errors];
    if (allErrors.length > 0) {
      console.error(`❌ ${file} (${allErrors.length} issues):`);
      allErrors.forEach((e) => console.error(`    - ${e}`));
      totalErrors += allErrors.length;
      badFiles++;
    } else if (cq.warnings.length > 0) {
      console.log(`✅ ${file} (${cq.warnings.length} content-quality warnings)`);
    } else {
      console.log(`✅ ${file}`);
    }
  }

  console.log('---');
  console.log(`Validated ${files.length} drug files. ${badFiles} bad. ${totalErrors} total issues.`);
  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();

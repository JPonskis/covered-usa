const BASE_URL = 'https://coveredusa.org';

export function getSpeakableSchema(url: string, cssSelectors: string[] = ['h1', '[data-speakable]', '.prose-custom p:first-of-type']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${BASE_URL}${url}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getWebApplicationSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CoveredUSA Health Insurance Eligibility Screener',
      url: `${BASE_URL}/en/screener`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Free 2-minute screener to check eligibility for Medicaid, Medicare, ACA marketplace plans, and CHIP. Works for all 50 US states. Available in Spanish.',
      featureList: [
        'Medicaid eligibility check',
        'ACA marketplace eligibility',
        'Medicare eligibility check',
        'CHIP eligibility for children',
        'All 50 states supported',
        'English and Spanish',
        'Anonymous and free',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CoveredUSA Medical Bill Analyzer',
      url: `${BASE_URL}/en/medical-bill-analyzer`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Free tool that analyzes hospital bills for overcharges, billing errors, and charity care eligibility. Uploads a bill, compares each line to Medicare rates, and generates a dispute letter.',
      featureList: [
        'Line-by-line Medicare fair-price comparison',
        'Billing error detection (duplicates, unbundling, upcoding)',
        '501(r) charity care eligibility check',
        'Auto-generated dispute letter',
        'No signup required',
        'Zero data retention',
        'PDF and image upload',
      ],
    },
  ];
}

export function getHowToSchema(locale: string) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isEs
      ? 'Cómo verificar su elegibilidad para seguro de salud'
      : 'How to Check Your Health Insurance Eligibility',
    description: isEs
      ? 'Use CoveredUSA para saber si califica para Medicaid, Medicare, ACA o CHIP en menos de 2 minutos.'
      : 'Use CoveredUSA to find out if you qualify for Medicaid, Medicare, ACA, or CHIP in under 2 minutes.',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: isEs ? 'Iniciar el evaluador' : 'Start the screener',
        text: isEs
          ? 'Visite coveredusa.org y haga clic en "Verificar Elegibilidad" para comenzar la evaluación gratuita.'
          : 'Visit coveredusa.org and click "Check Eligibility" to begin the free screening.',
        url: `${BASE_URL}/${locale}/screener`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: isEs ? 'Responder algunas preguntas' : 'Answer a few questions',
        text: isEs
          ? 'Proporcione información básica como estado, ingresos y tamaño del hogar. No se requiere identificación personal.'
          : 'Provide basic information like your state, income, and household size. No personal ID required.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: isEs ? 'Ver sus resultados' : 'Get your results',
        text: isEs
          ? 'Vea qué programas de seguro de salud puede calificar y cómo inscribirse con ayuda de un agente licenciado gratuito.'
          : 'See which health insurance programs you may qualify for and how to enroll with a free licensed agent.',
      },
    ],
  };
}

export function getMedicalOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CoveredUSA',
    url: BASE_URL,
    description: 'Free health insurance eligibility screening tool. Helps Americans find Medicaid, Medicare, ACA, and CHIP coverage.',
    areaServed: 'US',
    serviceType: 'Health Insurance Eligibility Screening',
    knowsAbout: ['Medicaid', 'Medicare', 'ACA Marketplace', 'CHIP', 'Health Insurance'],
  };
}

/**
 * MedicalWebPage — the page-level schema for programmatic data hubs and
 * reference pages. Signals to AI search engines that the page is a
 * curated, reviewed medical-information page (stronger trust signal than
 * generic Article schema).
 *
 * For Bing/Copilot YMYL citation, the high-leverage fields are:
 *   - lastReviewed (ISO date) — when content was last fact-checked
 *   - dateModified (ISO date) — most recent meaningful content change
 *   - datePublished (ISO date) — first publish date (defaults to lastReviewed)
 *   - author (Person with name + jobTitle + optional credential)
 *   - reviewedBy (Person with credential — when missing, falls back to Organization)
 *
 * Microsoft Copilot Health gives extra trust weight to YMYL pages that
 * include named clinician credentials in reviewedBy. We use Person where
 * possible and Organization as the fallback.
 */
export interface MedicalAuthor {
  name: string;
  jobTitle: string;
  url?: string;
  /** Optional credential (e.g., "Licensed Health Insurance Producer", "RN", "MD") */
  hasCredential?: string;
}

export function getMedicalWebPageSchema(props: {
  url: string;
  name: string;
  description: string;
  lastReviewed: string;
  /** Defaults to lastReviewed if not provided. */
  datePublished?: string;
  /** Defaults to lastReviewed if not provided. */
  dateModified?: string;
  about?: string;
  audience?: 'Patient' | 'PublicHealth' | 'Consumer';
  medicalSpecialty?: string;
  /** Person who wrote the page. Required for AI citation YMYL trust. */
  author?: MedicalAuthor;
  /** Person who reviewed the page. Optional; falls back to CoveredUSA Organization. */
  reviewedBy?: MedicalAuthor;
}) {
  const dateModified = props.dateModified ?? props.lastReviewed;
  const datePublished = props.datePublished ?? props.lastReviewed;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: `${BASE_URL}${props.url}`,
    name: props.name,
    description: props.description,
    datePublished,
    dateModified,
    lastReviewed: props.lastReviewed,
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: 'CoveredUSA',
      url: BASE_URL,
    },
  };

  if (props.author) {
    schema.author = personOrOrg(props.author);
  }

  // reviewedBy: prefer named Person (with credential) over Organization fallback.
  schema.reviewedBy = props.reviewedBy
    ? personOrOrg(props.reviewedBy)
    : { '@type': 'Organization', name: 'CoveredUSA', url: BASE_URL };

  if (props.about) {
    schema.about = { '@type': 'MedicalEntity', name: props.about };
  }
  if (props.audience) {
    schema.audience = { '@type': 'MedicalAudience', audienceType: props.audience };
  }
  if (props.medicalSpecialty) {
    schema.medicalSpecialty = props.medicalSpecialty;
  }
  return schema;
}

function personOrOrg(person: MedicalAuthor): Record<string, unknown> {
  const out: Record<string, unknown> = {
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
  };
  if (person.url) out.url = person.url.startsWith('http') ? person.url : `${BASE_URL}${person.url}`;
  if (person.hasCredential) {
    out.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      name: person.hasCredential,
    };
  }
  return out;
}

/**
 * The canonical CoveredUSA author entity. Use as the `author` arg for every
 * template page's `getMedicalWebPageSchema` call so the byline + JSON-LD stay
 * in sync across the whole site. When we add a credentialed reviewer later,
 * pass it via the `reviewedBy` arg.
 */
export const COVEREDUSA_AUTHOR: MedicalAuthor = {
  name: 'Jacob Posner',
  jobTitle: 'Founder & Editor',
  url: '/en/about',
};

/**
 * Drug — the core entity for drug-cost pages.
 *
 * Targets the "inpatient hospital drug markup" angle, not retail
 * pharmacy pricing (GoodRx territory). Uses HCPCS J-codes (public
 * domain), never CPT.
 *
 * Schema.org/Drug requires `name` as the proprietary or established
 * name. `nonProprietaryName` is the generic. Brand names go in
 * `proprietaryName` (which we use as alternateName since proprietaryName
 * is itself a Drug subentity).
 */
export function getDrugSchema(props: {
  name: string;
  nonProprietaryName?: string;
  brandNames?: string[];
  drugClass?: string;
  hcpcsJCodes?: string[];
  description: string;
  url: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: props.name,
    description: props.description,
    url: `${BASE_URL}${props.url}`,
  };
  if (props.nonProprietaryName) {
    schema.nonProprietaryName = props.nonProprietaryName;
  }
  if (props.brandNames && props.brandNames.length > 0) {
    schema.alternateName = props.brandNames;
  }
  if (props.drugClass) {
    schema.drugClass = {
      '@type': 'DrugClass',
      name: props.drugClass,
    };
  }
  if (props.hcpcsJCodes && props.hcpcsJCodes.length > 0) {
    schema.code = props.hcpcsJCodes.map((code) => ({
      '@type': 'MedicalCode',
      codeValue: code,
      codingSystem: 'HCPCS',
    }));
  }
  return schema;
}

/**
 * QAPage — single-question page schema for "Does X cover Y" style pages.
 *
 * Different from FAQPage:
 *   - FAQPage = multiple related questions on a page
 *   - QAPage = one MAIN question is the entire reason the page exists
 *
 * Use both schemas together on Q&A template pages: QAPage marks the
 * page's primary question (the H1 question and its canonical short
 * answer), FAQPage handles the secondary "related questions" section.
 */
export function getQAPageSchema(props: {
  question: string;
  answer: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: props.question,
      text: props.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: props.answer,
        url: `${BASE_URL}${props.url}`,
      },
    },
  };
}

/**
 * DefinedTerm — the core entity for glossary / definitional pages.
 *
 * Use on /out-of-pocket-maximum, /deductible-explained, etc. Signals to
 * AI engines that the page is the canonical definition of a term —
 * which is exactly what those engines want to cite when answering
 * "what is X?" queries.
 *
 * `inDefinedTermSet` links the term to the CoveredUSA glossary as a
 * whole, useful for AI engines mapping topic relationships.
 */
export function getDefinedTermSchema(props: {
  name: string;
  description: string;
  url: string;
  alternateNames?: string[];
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: props.name,
    description: props.description,
    url: `${BASE_URL}${props.url}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'CoveredUSA Health Insurance Glossary',
      url: `${BASE_URL}/en/glossary`,
    },
  };
  if (props.alternateNames && props.alternateNames.length > 0) {
    schema.alternateName = props.alternateNames;
  }
  return schema;
}

/**
 * MedicalProcedure — the core entity for procedure cost pages.
 *
 * Use `hcpcsCodes` only (HCPCS Level II is public domain). NEVER include
 * full CPT code descriptors — those are AMA-copyrighted and require a
 * commercial license. Reference procedures in plain language ("MRI of
 * the knee"), not CPT code descriptions.
 *
 * estimatedCost nests a PriceSpecification so AI engines can quote the
 * range directly.
 */
export function getMedicalProcedureSchema(props: {
  name: string;
  description: string;
  url: string;
  hcpcsCodes?: string[];
  procedureType?: string;
  estimatedCostLow?: number;
  estimatedCostHigh?: number;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: props.name,
    description: props.description,
    url: `${BASE_URL}${props.url}`,
  };
  if (props.procedureType) {
    schema.procedureType = props.procedureType;
  }
  if (props.hcpcsCodes && props.hcpcsCodes.length > 0) {
    schema.code = props.hcpcsCodes.map((code) => ({
      '@type': 'MedicalCode',
      codeValue: code,
      codingSystem: 'HCPCS',
    }));
  }
  if (props.estimatedCostLow !== undefined && props.estimatedCostHigh !== undefined) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      minValue: props.estimatedCostLow,
      maxValue: props.estimatedCostHigh,
      currency: 'USD',
    };
  }
  return schema;
}

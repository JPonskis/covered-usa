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
 * Always include lastReviewed (date) so AI engines can confirm freshness.
 */
export function getMedicalWebPageSchema(props: {
  url: string;
  name: string;
  description: string;
  lastReviewed: string;
  about?: string;
  audience?: 'Patient' | 'PublicHealth' | 'Consumer';
  medicalSpecialty?: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    url: `${BASE_URL}${props.url}`,
    name: props.name,
    description: props.description,
    lastReviewed: props.lastReviewed,
    reviewedBy: {
      '@type': 'Organization',
      name: 'CoveredUSA',
      url: BASE_URL,
    },
    isAccessibleForFree: true,
  };
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

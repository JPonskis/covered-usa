import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getFAQSchema, getBreadcrumbSchema, buildSchemaGraph } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const ENROLLMENT_PERIODS = [
  {
    name: 'Initial Enrollment Period (IEP)',
    nameEs: 'Período de Inscripción Inicial (IEP)',
    window: '7 months (3 before + birthday month + 3 after turning 65)',
    windowEs: '7 meses (3 antes + mes de cumpleaños + 3 después de cumplir 65)',
    notes: 'Best time to enroll — no penalty',
    notesEs: 'Mejor momento para inscribirse — sin penalidad',
  },
  {
    name: 'General Enrollment Period (GEP)',
    nameEs: 'Período de Inscripción General (GEP)',
    window: 'January 1 – March 31 each year',
    windowEs: '1 de enero – 31 de marzo cada año',
    notes: 'Late penalty applies; coverage starts July 1',
    notesEs: 'Se aplica penalidad por retraso; la cobertura comienza el 1 de julio',
  },
  {
    name: 'Special Enrollment Period (SEP)',
    nameEs: 'Período de Inscripción Especial (SEP)',
    window: '8 months after losing employer coverage',
    windowEs: '8 meses después de perder la cobertura del empleador',
    notes: 'No penalty if enrolled within window',
    notesEs: 'Sin penalidad si se inscribe dentro del período',
  },
  {
    name: 'Medicare Advantage Open Enrollment',
    nameEs: 'Inscripción Abierta de Medicare Advantage',
    window: 'January 1 – March 31 each year',
    windowEs: '1 de enero – 31 de marzo cada año',
    notes: 'Switch plans or return to Original Medicare',
    notesEs: 'Cambie de plan o regrese a Medicare Original',
  },
  {
    name: 'Annual Open Enrollment',
    nameEs: 'Inscripción Abierta Anual',
    window: 'October 15 – December 7 each year',
    windowEs: '15 de octubre – 7 de diciembre cada año',
    notes: 'Change Part D or Medicare Advantage plan',
    notesEs: 'Cambie el plan de la Parte D o de Medicare Advantage',
  },
];

const FAQS = [
  {
    question: 'What is the Medicare eligibility age?',
    answer: 'The standard Medicare eligibility age is 65. You become eligible for Medicare Part A and Part B when you turn 65, as long as you or your spouse worked and paid Medicare taxes for at least 10 years (40 quarters).',
  },
  {
    question: 'Can I get Medicare before 65?',
    answer: 'Yes, in three situations: (1) You have received Social Security Disability Insurance (SSDI) for 24 months. (2) You have ALS (Lou Gehrig\'s disease) — Medicare coverage begins immediately upon SSDI approval. (3) You have End-Stage Renal Disease (ESRD) requiring dialysis or a kidney transplant.',
  },
  {
    question: 'Is Medicare free?',
    answer: 'Medicare Part A (hospital coverage) is free for most people who paid Medicare taxes for 10+ years. Part B (medical coverage) has a standard premium of approximately $185/month in 2026. Part D (drugs) and Medicare Advantage plans have varying costs.',
  },
  {
    question: 'What is the difference between Medicare and Medicaid?',
    answer: 'Medicare is based on age (65+) or disability, not income. Medicaid is based on income and is free or very low cost. Some people qualify for both — called "dual eligibles" — and get extra benefits and savings.',
  },
  {
    question: 'What is Medicare Savings Programs?',
    answer: 'Medicare Savings Programs (MSPs) are state Medicaid programs that help people with limited income pay Medicare premiums, deductibles, and copays. They are available for people who have Medicare but need financial help covering the costs.',
  },
  {
    question: 'When should I sign up for Medicare?',
    answer: 'Sign up during your Initial Enrollment Period: starting 3 months before your 65th birthday month and ending 3 months after. If you miss this window without creditable coverage from an employer, you may face a permanent late enrollment penalty.',
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  return {
    title: isEs
      ? 'Elegibilidad para Medicare 2026: Requisitos de Edad y Discapacidad | CoveredUSA'
      : 'Medicare Eligibility 2026: Age Requirements, Disability & Enrollment | CoveredUSA',
    description: isEs
      ? 'Guía completa de elegibilidad para Medicare en 2026. Edad 65+, vías de discapacidad, ESRD, períodos de inscripción y programas de ahorro.'
      : 'Complete guide to Medicare eligibility in 2026. Age 65+, disability pathways, ESRD, enrollment periods, and Medicare Savings Programs explained.',
    alternates: { canonical: `/${locale}/medicare-eligibility` },
  };
}

export default async function MedicareEligibilityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === 'es';

  const faqSchema = getFAQSchema(FAQS);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: isEs ? 'Inicio' : 'Home', url: `/${locale}` },
    { name: isEs ? 'Elegibilidad Medicare' : 'Medicare Eligibility', url: `/${locale}/medicare-eligibility` },
  ]);

  const pageGraph = buildSchemaGraph(
    [breadcrumbSchema, faqSchema],
    `/${locale}/medicare-eligibility`,
  );

  return (
    <main className="min-h-screen" style={{ background: '#f8fafc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraph) }} />

      {/* Hero */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="mb-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}
            >
              {isEs ? 'Referencia 2026' : '2026 Reference'}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
            data-speakable
          >
            {isEs ? 'Elegibilidad para Medicare 2026' : 'Medicare Eligibility 2026'}
          </h1>
          <p className="text-lg max-w-3xl" style={{ color: '#475569' }}>
            {isEs
              ? 'Quién califica para Medicare, requisitos de edad y discapacidad, partes de Medicare y períodos de inscripción — todo actualizado para 2026.'
              : 'Who qualifies for Medicare, age and disability requirements, Medicare parts, and enrollment periods — all updated for 2026.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Eligibility Pathways */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f172a' }}>
            {isEs ? 'Vías de Elegibilidad para Medicare' : 'Medicare Eligibility Pathways'}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '🎂',
                title: isEs ? 'Por Edad: 65+' : 'By Age: 65+',
                desc: isEs
                  ? 'Califica automáticamente a los 65 años si usted o su cónyuge pagaron impuestos de Medicare por 10+ años (40 trimestres).'
                  : 'Automatically qualify at age 65 if you or your spouse paid Medicare taxes for 10+ years (40 quarters).',
              },
              {
                icon: '♿',
                title: isEs ? 'Por Discapacidad (SSDI)' : 'By Disability (SSDI)',
                desc: isEs
                  ? 'Califica después de recibir SSDI por 24 meses, o de inmediato con ELA (enfermedad de Lou Gehrig).'
                  : 'Qualify after receiving SSDI for 24 months, or immediately with ALS (Lou Gehrig\'s disease).',
              },
              {
                icon: '🫀',
                title: isEs ? 'Por Enfermedad Renal Terminal' : 'By End-Stage Renal Disease',
                desc: isEs
                  ? 'Califica a cualquier edad si necesita diálisis permanente o un trasplante de riñón.'
                  : 'Qualify at any age if you require permanent dialysis or a kidney transplant.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#0f172a' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Medicare Parts */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f172a' }}>
            {isEs ? 'Las Partes de Medicare (2026)' : 'Medicare Parts (2026)'}
          </h2>
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                  <th className="text-left px-4 py-3 font-semibold">{isEs ? 'Parte' : 'Part'}</th>
                  <th className="text-left px-4 py-3 font-semibold">{isEs ? 'Cobertura' : 'Coverage'}</th>
                  <th className="text-left px-4 py-3 font-semibold">{isEs ? 'Costo 2026' : '2026 Cost'}</th>
                  <th className="text-left px-4 py-3 font-semibold">{isEs ? 'Notas' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    part: 'Part A',
                    coverage: isEs ? 'Hospitalización, cuidado de hábil enfermería' : 'Hospital stays, skilled nursing facility',
                    cost: isEs ? 'Gratis para la mayoría' : 'Free for most people',
                    notes: isEs ? 'Gratis si pagó 40 trimestres de impuestos Medicare' : 'Free if you paid 40 quarters of Medicare taxes',
                  },
                  {
                    part: 'Part B',
                    coverage: isEs ? 'Visitas médicas, ambulatorio, equipo médico' : 'Doctor visits, outpatient care, medical equipment',
                    cost: '~$185/month',
                    notes: isEs ? 'Prima puede ser mayor con ingresos altos (IRMAA)' : 'Premium may be higher with high income (IRMAA)',
                  },
                  {
                    part: 'Part C',
                    coverage: isEs ? 'Medicare Advantage: A + B + extras' : 'Medicare Advantage: A + B + extras',
                    cost: isEs ? 'Varía por plan' : 'Varies by plan',
                    notes: isEs ? 'A menudo incluye visión, dental, audición' : 'Often includes vision, dental, hearing',
                  },
                  {
                    part: 'Part D',
                    coverage: isEs ? 'Medicamentos recetados' : 'Prescription drugs',
                    cost: isEs ? 'Varía por plan' : 'Varies by plan',
                    notes: isEs ? 'Inscríbase cuando sea elegible o pague penalidad' : 'Enroll when eligible or pay late penalty',
                  },
                ].map((row, i) => (
                  <tr
                    key={row.part}
                    style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td className="px-4 py-3 font-bold" style={{ color: '#1d4ed8' }}>{row.part}</td>
                    <td className="px-4 py-3" style={{ color: '#374151' }}>{row.coverage}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{row.cost}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Enrollment Periods */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#0f172a' }}>
            {isEs ? 'Períodos de Inscripción de Medicare' : 'Medicare Enrollment Periods'}
          </h2>
          <div className="space-y-4">
            {ENROLLMENT_PERIODS.map((period, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col sm:flex-row gap-4"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: '#0f172a' }}>
                    {isEs ? period.nameEs : period.name}
                  </h3>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1d4ed8' }}>
                    {isEs ? period.windowEs : period.window}
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    {isEs ? period.notesEs : period.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: '#1e3a5f', color: 'white' }}
        >
          <h2 className="text-2xl font-bold mb-3">
            {isEs ? '¿Califica para Medicare o Medicaid?' : 'Do You Qualify for Medicare or Medicaid?'}
          </h2>
          <p className="mb-6 max-w-lg mx-auto" style={{ color: '#93c5fd' }}>
            {isEs
              ? 'Nuestro evaluador gratuito verifica Medicare, Medicaid y otros seguros de salud en 2 minutos.'
              : 'Our free screener checks Medicare, Medicaid, and other health coverage options in 2 minutes.'}
          </p>
          <Link
            href={`/${locale}/screener?utm_source=medicare-eligibility&utm_medium=reference`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: '#3b82f6', color: 'white' }}
          >
            {isEs ? 'Verificar Elegibilidad Gratis' : 'Check My Eligibility — Free'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#0f172a' }}>
            {isEs ? 'Preguntas Frecuentes sobre Medicare' : 'Frequently Asked Questions About Medicare'}
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: 'white', border: '1px solid #e2e8f0' }}
              >
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0f172a' }}>
                  {faq.question}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#374151' }}>
            {isEs ? 'Recursos Relacionados' : 'Related Resources'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/blog/medicare-eligibility-age-requirements-2026`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Elegibilidad para Medicare en 2026' : 'Medicare Eligibility in 2026 (Guide)'}
            </Link>
            <Link
              href={`/${locale}/medicaid-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Límites de Ingresos Medicaid' : 'Medicaid Income Limits'}
            </Link>
            <Link
              href={`/${locale}/aca-income-limits`}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-blue-50"
              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1d4ed8' }}
            >
              {isEs ? 'Límites de Ingresos ACA' : 'ACA Income Limits'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

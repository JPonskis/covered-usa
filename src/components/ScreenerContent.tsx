'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  state: string;
  householdSize: number;
  annualIncome: number;
  employmentStatus: string;
  age: number;
  numChildren: number;
  isPregnant: boolean;
  hasDisability: boolean;
  isVeteran: boolean;
  currentlyInsured: boolean;
  insuranceSource: string;
  citizenshipStatus: 'all' | 'mixed' | 'none';
};

const initialFormData: FormData = {
  state: '',
  householdSize: 1,
  annualIncome: 0,
  employmentStatus: '',
  age: 0,
  numChildren: 0,
  isPregnant: false,
  hasDisability: false,
  isVeteran: false,
  currentlyInsured: false,
  insuranceSource: '',
  citizenshipStatus: 'all',
};

const STATES: [string, string][] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
  ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
  ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
  ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

const TOTAL_STEPS = 4;

const stepInfo = (locale: string) => [
  {
    num: 1,
    title: locale === 'es' ? 'Ubicacion y Hogar' : 'Location & Household',
    desc: locale === 'es' ? 'Informacion basica sobre tu hogar' : 'Basic information about your household',
  },
  {
    num: 2,
    title: locale === 'es' ? 'Ingresos y Empleo' : 'Income & Employment',
    desc: locale === 'es' ? 'Tus ingresos y situacion laboral' : 'Your earnings and employment situation',
  },
  {
    num: 3,
    title: locale === 'es' ? 'Tu Informacion' : 'Your Information',
    desc: locale === 'es' ? 'Datos personales para tu elegibilidad' : 'Personal details for your eligibility',
  },
  {
    num: 4,
    title: locale === 'es' ? 'Cobertura Actual' : 'Current Coverage',
    desc: locale === 'es' ? 'Tu seguro de salud actual' : 'Your existing health insurance',
  },
];

export default function ScreenerContent({ locale }: { locale: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const steps = stepInfo(locale);
  const currentStep = steps[step - 1];

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const brandPrimary = '#0d9488'; // teal for toggle buttons

  const inputStyles = "w-full px-4 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#1a202c] placeholder-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent transition-shadow";
  const selectStyles = "w-full px-4 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent transition-shadow";
  const labelStyles = "block text-sm font-medium text-[#1a202c] mb-2";

  const toggleStyle = (isSelected: boolean) => {
    if (isSelected) {
      return {
        className: 'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
        style: { borderColor: brandPrimary, backgroundColor: brandPrimary, color: 'white' },
      };
    }
    return {
      className: 'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all border-[#e2e8f0] hover:border-[#cbd5e0] text-[#1a202c]',
      style: {} as React.CSSProperties,
    };
  };

  const toggleStyleLg = (isSelected: boolean) => {
    if (isSelected) {
      return {
        className: 'py-3 px-4 rounded-lg border-2 font-medium transition-all',
        style: { borderColor: brandPrimary, backgroundColor: brandPrimary, color: 'white' },
      };
    }
    return {
      className: 'py-3 px-4 rounded-lg border-2 font-medium transition-all border-[#e2e8f0] hover:border-[#cbd5e0] text-[#1a202c]',
      style: {} as React.CSSProperties,
    };
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.state) {
        return locale === 'es' ? 'Por favor selecciona tu estado.' : 'Please select your state.';
      }
    }
    if (step === 2) {
      if (!formData.age || formData.age < 1) {
        return locale === 'es' ? 'Por favor ingresa tu edad.' : 'Please enter your age.';
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        state: formData.state,
        age: formData.age,
        householdSize: formData.householdSize,
        annualIncome: formData.annualIncome,
        employmentStatus: formData.employmentStatus || 'unemployed',
        isPregnant: formData.isPregnant,
        hasDisability: formData.hasDisability,
        currentlyInsured: formData.currentlyInsured,
        insuranceSource: formData.insuranceSource || 'none',
        isVeteran: formData.isVeteran,
        numChildren: formData.numChildren,
        citizenshipStatus: formData.citizenshipStatus,
        language: locale,
      };

      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const id = data.submissionId || 'demo';
      router.push(`/${locale}/results/${id}`);
    } catch (e) {
      console.error(e);
      setError(locale === 'es' ? 'Algo salio mal. Por favor intenta de nuevo.' : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isLast = step === TOTAL_STEPS;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header style={{ backgroundColor: '#0369a1', color: 'white' }}>
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href={`/${locale}`} className="header-link text-sm flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'es' ? 'Volver al sitio' : 'Back to site'}
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={`/${otherLocale}/screener`}
              className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
              style={{ borderColor: '#0d9488', color: '#0d9488' }}
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </a>
            <span className="font-semibold">CoveredUSA</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a202c]">
            {locale === 'es' ? 'Verificador de Elegibilidad' : 'Health Coverage Screener'}
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-[#718096]">
                {locale === 'es' ? `Paso ${step} de ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}
              </p>
              <p className="font-semibold text-[#1a202c]">{currentStep.title}</p>
            </div>
            <p className="text-sm font-medium" style={{ color: brandPrimary }}>
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: brandPrimary, width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 md:p-8 shadow-sm">

          {/* Step 1: Location & Household */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1a202c] mb-1">
                  {locale === 'es' ? 'Ubicacion y Hogar' : 'Location & Household'}
                </h2>
                <p className="text-sm text-[#718096]">
                  {locale === 'es' ? 'Los programas de cobertura varian por estado.' : 'Coverage programs vary by state.'}
                </p>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Estado de residencia' : 'What state do you live in?'}
                </label>
                <select
                  value={formData.state}
                  onChange={e => updateField('state', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">{locale === 'es' ? '-- Selecciona tu estado --' : '-- Select your state --'}</option>
                  {STATES.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Tamano del hogar' : 'Household size'}
                </label>
                <p className="text-sm text-[#718096] mb-2">
                  {locale === 'es' ? 'Incluye a ti mismo, tu conyuge y dependientes.' : 'Include yourself, your spouse/partner, and any dependents.'}
                </p>
                <select
                  value={formData.householdSize}
                  onChange={e => updateField('householdSize', parseInt(e.target.value))}
                  className={selectStyles}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? (locale === 'es' ? 'persona' : 'person') : (locale === 'es' ? 'personas' : 'people')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Estado de ciudadania del hogar' : 'Household citizenship status'}
                </label>
                <p className="text-sm text-[#718096] mb-2">
                  {locale === 'es'
                    ? 'Esto ayuda a calcular los beneficios correctamente.'
                    : 'This helps calculate benefits accurately for mixed-status households.'}
                </p>
                <select
                  value={formData.citizenshipStatus}
                  onChange={e => updateField('citizenshipStatus', e.target.value as FormData['citizenshipStatus'])}
                  className={selectStyles}
                >
                  <option value="all">
                    {locale === 'es' ? 'Todos son ciudadanos o residentes permanentes (green card)' : 'Everyone is a US citizen or green card holder'}
                  </option>
                  <option value="mixed">
                    {locale === 'es' ? 'Algunos miembros son ciudadanos o residentes permanentes' : 'Some members are citizens or green card holders'}
                  </option>
                  <option value="none">
                    {locale === 'es' ? 'Nadie en mi hogar es ciudadano o residente permanente' : 'No one in my household is a citizen or green card holder'}
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Income & Employment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1a202c] mb-1">
                  {locale === 'es' ? 'Ingresos y Empleo' : 'Income & Employment'}
                </h2>
                <p className="text-sm text-[#718096]">
                  {locale === 'es' ? 'Tus ingresos y situacion laboral.' : 'Your earnings and employment situation.'}
                </p>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Ingresos anuales del hogar' : 'Annual household income'}
                </label>
                <p className="text-sm text-[#718096] mb-2">
                  {locale === 'es' ? 'Incluye todos los ingresos: salarios, Seguro Social, etc. Las estimaciones son validas.' : 'Include all sources: wages, Social Security, disability payments, etc. Estimates are fine.'}
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-[#718096]">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.annualIncome ? formData.annualIncome.toLocaleString('en-US') : ''}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      updateField('annualIncome', parseInt(raw) || 0);
                    }}
                    className={`${inputStyles} pl-8`}
                    placeholder={locale === 'es' ? 'ej. 35,000' : 'e.g. 35,000'}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Situacion laboral' : 'Employment status'}
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={e => updateField('employmentStatus', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">{locale === 'es' ? '-- Selecciona --' : '-- Select --'}</option>
                  <option value="employed">{locale === 'es' ? 'Empleado' : 'Employed'}</option>
                  <option value="self-employed">{locale === 'es' ? 'Trabajador independiente' : 'Self-employed'}</option>
                  <option value="unemployed">{locale === 'es' ? 'Desempleado' : 'Unemployed'}</option>
                  <option value="retired">{locale === 'es' ? 'Jubilado' : 'Retired'}</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Your Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1a202c] mb-1">
                  {locale === 'es' ? 'Tu Informacion' : 'Your Information'}
                </h2>
                <p className="text-sm text-[#718096]">
                  {locale === 'es' ? 'Datos personales para determinar tu elegibilidad.' : 'Personal details to refine your results.'}
                </p>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Tu edad' : 'Your age'}
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={e => updateField('age', parseInt(e.target.value) || 0)}
                  className={inputStyles}
                  min={0}
                  max={120}
                  placeholder={locale === 'es' ? 'Ingresa tu edad' : 'Enter your age'}
                  style={{ maxWidth: '160px' }}
                />
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Ninos menores de 19 en tu hogar' : 'Children under 19 in your household'}
                </label>
                <select
                  value={formData.numChildren}
                  onChange={e => updateField('numChildren', parseInt(e.target.value))}
                  className={selectStyles}
                >
                  {[0,1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="bg-[#f8fafc] rounded-lg p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPregnant}
                    onChange={e => updateField('isPregnant', e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[#1a202c] text-sm">
                    {locale === 'es' ? 'Estoy embarazada actualmente' : 'I am currently pregnant'}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDisability}
                    onChange={e => updateField('hasDisability', e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[#1a202c] text-sm">
                    {locale === 'es' ? 'Tengo una discapacidad que afecta mi capacidad de trabajar' : 'I have a disability that affects my ability to work'}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeteran}
                    onChange={e => updateField('isVeteran', e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[#1a202c] text-sm">
                    {locale === 'es' ? 'Soy veterano de las fuerzas armadas de EE.UU.' : 'I am a U.S. military veteran'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Current Coverage */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1a202c] mb-1">
                  {locale === 'es' ? 'Cobertura Actual' : 'Current Coverage'}
                </h2>
                <p className="text-sm text-[#718096]">
                  {locale === 'es' ? 'Tu seguro de salud actual.' : 'Your existing health insurance.'}
                </p>
              </div>

              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Tienes seguro de salud actualmente?' : 'Do you currently have health insurance?'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('currentlyInsured', true)}
                    {...toggleStyleLg(formData.currentlyInsured)}
                  >
                    {locale === 'es' ? 'Si' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('currentlyInsured', false);
                      updateField('insuranceSource', '');
                    }}
                    {...toggleStyleLg(!formData.currentlyInsured)}
                  >
                    {locale === 'es' ? 'No' : 'No'}
                  </button>
                </div>
              </div>

              {formData.currentlyInsured && (
                <div>
                  <label className={labelStyles}>
                    {locale === 'es' ? 'Fuente de tu seguro' : 'Source of your insurance'}
                  </label>
                  <select
                    value={formData.insuranceSource}
                    onChange={e => updateField('insuranceSource', e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">{locale === 'es' ? '-- Selecciona --' : '-- Select --'}</option>
                    <option value="employer">{locale === 'es' ? 'Empleador o plan laboral' : 'Employer or job-based plan'}</option>
                    <option value="aca">{locale === 'es' ? 'Mercado de ACA (Healthcare.gov)' : 'ACA Marketplace (Healthcare.gov)'}</option>
                    <option value="medicaid">{locale === 'es' ? 'Medicaid / Programa estatal' : 'Medicaid / State health program'}</option>
                    <option value="medicare">{locale === 'es' ? 'Medicare' : 'Medicare'}</option>
                    <option value="other">{locale === 'es' ? 'Otro' : 'Other'}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}

          {/* Submit Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 border-2 border-[#e2e8f0] rounded-lg font-medium text-[#1a202c] hover:bg-[#f8fafc] transition-colors"
              >
                {locale === 'es' ? 'Atras' : 'Back'}
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#0369a1', color: 'white' }}
              >
                {locale === 'es' ? 'Continuar' : 'Continue'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#0369a1', color: 'white' }}
              >
                {isSubmitting
                  ? (locale === 'es' ? 'Verificando...' : 'Checking eligibility...')
                  : (locale === 'es' ? 'Ver mis resultados' : 'See my results')}
              </button>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-sm text-[#718096] mt-6">
          {locale === 'es'
            ? 'Tu informacion es confidencial y nunca se vende. Sin registro requerido.'
            : 'Your information is confidential and never sold. No sign-up required.'}
        </p>
      </div>
    </main>
  );
}

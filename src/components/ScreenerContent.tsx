'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getStateFromZip } from '@/lib/states/zipToState';

interface FormData {
  zipCode: string;
  age: string;
  householdSize: string;
  numChildren: string;
  annualIncome: string;
  isPregnant: boolean;
  hasDisability: boolean;
  isVeteran: boolean;
  currentlyInsured: boolean;
  insuranceSource: string;
  firstName: string;
  email: string;
}

const initialFormData: FormData = {
  zipCode: '',
  age: '',
  householdSize: '1',
  numChildren: '0',
  annualIncome: '',
  isPregnant: false,
  hasDisability: false,
  isVeteran: false,
  currentlyInsured: false,
  insuranceSource: '',
  firstName: '',
  email: '',
};

const TOTAL_STEPS = 3;

export default function ScreenerContent({ locale }: { locale: string }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');

  const otherLocale = locale === 'es' ? 'en' : 'es';

  const brandPrimary = 'var(--primary)';
  const brandPrimaryHex = '#0d9488';
  const brandPrimaryDark = '#0f766e';

  const inputStyles =
    'w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow';
  const selectStyles =
    'w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow';
  const labelStyles = 'block text-sm font-medium text-[var(--text-primary)] mb-2';

  const toggleStyleLg = (isSelected: boolean) => {
    if (isSelected) {
      return {
        className: 'py-3 px-4 rounded-lg border-2 font-medium transition-all',
        style: {
          borderColor: brandPrimaryHex,
          backgroundColor: brandPrimaryHex,
          color: 'white',
        },
      };
    }
    return {
      className:
        'py-3 px-4 rounded-lg border-2 font-medium transition-all border-[var(--border)] hover:border-[var(--border-light)] text-[var(--text-primary)]',
      style: {} as React.CSSProperties,
    };
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const detectedState =
    formData.zipCode.length === 5 ? getStateFromZip(formData.zipCode) : null;

  const validateZip = (zip: string) => /^\d{5}$/.test(zip) && getStateFromZip(zip) !== null;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.zipCode || formData.zipCode.length !== 5) {
        return locale === 'es'
          ? 'Por favor ingresa tu código postal de 5 dígitos.'
          : 'Please enter a valid 5-digit ZIP code.';
      }
      if (!validateZip(formData.zipCode)) {
        return locale === 'es'
          ? 'Código postal no reconocido. Por favor verifica.'
          : 'ZIP code not recognized. Please double-check.';
      }
      if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 100) {
        return locale === 'es'
          ? 'Por favor ingresa una edad válida (18–100).'
          : 'Please enter a valid age (18–100).';
      }
    }
    if (step === 2) {
      if (!formData.annualIncome || isNaN(Number(formData.annualIncome.replace(/,/g, ''))) || Number(formData.annualIncome.replace(/,/g, '')) <= 0) {
        return locale === 'es'
          ? 'Por favor ingresa el ingreso anual de tu hogar.'
          : 'Please enter your annual household income.';
      }
    }
    if (step === 3) {
      if (!formData.firstName.trim()) {
        return locale === 'es'
          ? 'Por favor ingresa tu nombre.'
          : 'Please enter your first name.';
      }
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        return locale === 'es'
          ? 'Por favor ingresa un correo electrónico válido.'
          : 'Please enter a valid email address.';
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
    setValidationError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) {
      setValidationError(err);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const state = getStateFromZip(formData.zipCode) || '';
      const incomeRaw = Number(formData.annualIncome.replace(/,/g, '')) || 0;

      const payload = {
        zipCode: formData.zipCode,
        state,
        age: Number(formData.age),
        householdSize: Number(formData.householdSize),
        numChildren: Number(formData.numChildren),
        annualIncome: incomeRaw,
        isPregnant: formData.isPregnant,
        hasDisability: formData.hasDisability,
        isVeteran: formData.isVeteran,
        currentlyInsured: formData.currentlyInsured,
        insuranceSource: formData.insuranceSource || 'none',
        firstName: formData.firstName,
        email: formData.email,
        language: locale,
      };

      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const submissionId = data.submissionId || 'demo';
      window.location.href = `/${locale}/results/${submissionId}`;
    } catch (e) {
      console.error(e);
      setSubmitError(
        locale === 'es'
          ? 'Algo salió mal. Por favor intenta de nuevo.'
          : 'Something went wrong. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    locale === 'es' ? 'Sobre Ti' : 'About You',
    locale === 'es' ? 'Tu Situación' : 'Your Situation',
    locale === 'es' ? 'Obtén Tus Resultados' : 'Get Your Results',
  ];

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header style={{ backgroundColor: 'var(--primary-deeper)', color: 'white' }}>
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="header-link text-sm flex items-center gap-2"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {locale === 'es' ? 'Volver' : 'Back'}
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={`/${otherLocale}/screener`}
              className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
              style={{ borderColor: brandPrimaryHex, color: brandPrimaryHex, background: 'white' }}
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </a>
            <span className="font-semibold">CoveredUSA</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {locale === 'es' ? 'Verificador de Cobertura de Salud' : 'Health Coverage Screener'}
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-[var(--text-muted)]">
                {locale === 'es'
                  ? `Paso ${step} de ${TOTAL_STEPS}`
                  : `Step ${step} of ${TOTAL_STEPS}`}
              </p>
              <p className="font-semibold text-[var(--text-primary)]">{stepTitles[step - 1]}</p>
            </div>
            <p className="text-sm font-medium" style={{ color: brandPrimaryHex }}>
              {progressPct}%
            </p>
          </div>
          <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: brandPrimaryHex, width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">

          {/* ---- Step 1: About You ---- */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {locale === 'es' ? 'Sobre Ti' : 'About You'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === 'es'
                    ? 'Información básica para calcular tu elegibilidad.'
                    : 'Basic information to calculate your eligibility.'}
                </p>
              </div>

              {/* ZIP Code */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Código Postal' : 'ZIP Code'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={formData.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value.replace(/\D/g, ''))}
                  className={inputStyles}
                  placeholder={locale === 'es' ? 'ej. 90210' : 'e.g. 90210'}
                />
                {formData.zipCode.length === 5 && detectedState && (
                  <p className="text-sm mt-1.5" style={{ color: brandPrimaryHex }}>
                    {detectedState}
                  </p>
                )}
                {formData.zipCode.length === 5 && !detectedState && (
                  <p className="text-sm text-red-500 mt-1.5">
                    {locale === 'es'
                      ? 'Código postal no reconocido.'
                      : 'ZIP code not recognized.'}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Edad' : 'Age'}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={18}
                  max={100}
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className={inputStyles}
                  placeholder={locale === 'es' ? 'Tu edad' : 'Your age'}
                  style={{ maxWidth: '160px' }}
                />
              </div>

              {/* Household size */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Tamaño del Hogar' : 'Household Size'}
                </label>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  {locale === 'es'
                    ? 'Incluye a ti mismo, pareja e hijos dependientes.'
                    : 'Include yourself, your partner, and any dependents.'}
                </p>
                <select
                  value={formData.householdSize}
                  onChange={(e) => updateField('householdSize', e.target.value)}
                  className={selectStyles}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}{' '}
                      {n === 1
                        ? locale === 'es'
                          ? 'persona'
                          : 'person'
                        : locale === 'es'
                        ? 'personas'
                        : 'people'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Children under 19 */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Hijos Menores de 19' : 'Children Under 19'}
                </label>
                <select
                  value={formData.numChildren}
                  onChange={(e) => updateField('numChildren', e.target.value)}
                  className={selectStyles}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ---- Step 2: Your Situation ---- */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {locale === 'es' ? 'Tu Situación' : 'Your Situation'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === 'es'
                    ? 'Tu situación financiera y de salud actual.'
                    : 'Your current financial and health situation.'}
                </p>
              </div>

              {/* Annual income */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Ingreso Familiar Anual' : 'Annual Household Income'}
                </label>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  {locale === 'es'
                    ? 'Incluye salarios, Seguro Social, etc. Las estimaciones son válidas.'
                    : 'Include wages, Social Security, etc. Estimates are fine.'}
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-[var(--text-muted)]">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.annualIncome}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      const formatted = raw
                        ? parseInt(raw, 10).toLocaleString('en-US')
                        : '';
                      updateField('annualIncome', formatted);
                    }}
                    className={`${inputStyles} pl-8`}
                    placeholder={locale === 'es' ? 'ej. 35,000' : 'e.g. 35,000'}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  {locale === 'es'
                    ? '¿Alguna de las siguientes situaciones te aplica?'
                    : 'Do any of the following apply to you?'}
                </p>
                <div className="bg-[var(--cream)] rounded-lg p-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPregnant}
                      onChange={(e) => updateField('isPregnant', e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-[var(--text-primary)] text-sm">
                      {locale === 'es' ? 'Embarazada' : 'Pregnant'}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasDisability}
                      onChange={(e) => updateField('hasDisability', e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-[var(--text-primary)] text-sm">
                      {locale === 'es' ? 'Tengo una discapacidad' : 'Have a disability'}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVeteran}
                      onChange={(e) => updateField('isVeteran', e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-[var(--text-primary)] text-sm">
                      {locale === 'es'
                        ? 'Veterano o militar activo'
                        : 'Veteran or active military'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Currently insured toggle */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es'
                    ? '¿Tiene seguro médico actualmente?'
                    : 'Do you currently have health insurance?'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('currentlyInsured', true)}
                    {...toggleStyleLg(formData.currentlyInsured === true)}
                  >
                    {locale === 'es' ? 'Sí' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('currentlyInsured', false);
                      updateField('insuranceSource', '');
                    }}
                    {...toggleStyleLg(!formData.currentlyInsured)}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Insurance source — shown only if insured */}
              {formData.currentlyInsured && (
                <div>
                  <label className={labelStyles}>
                    {locale === 'es' ? 'Fuente de tu seguro' : 'Insurance source'}
                  </label>
                  <select
                    value={formData.insuranceSource}
                    onChange={(e) => updateField('insuranceSource', e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">
                      {locale === 'es' ? '-- Selecciona --' : '-- Select --'}
                    </option>
                    <option value="employer">
                      {locale === 'es' ? 'Empleador' : 'Employer'}
                    </option>
                    <option value="aca">
                      {locale === 'es' ? 'Mercado de ACA' : 'ACA Marketplace'}
                    </option>
                    <option value="medicaid">Medicaid</option>
                    <option value="medicare">Medicare</option>
                    <option value="other">{locale === 'es' ? 'Otro' : 'Other'}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ---- Step 3: Get Your Results ---- */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {locale === 'es'
                    ? '¿A dónde enviamos tus resultados?'
                    : 'Where should we send your results?'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === 'es'
                    ? 'Te enviaremos un resumen personalizado de lo que calificas.'
                    : "We'll email you a personalized summary of what you qualify for."}
                </p>
              </div>

              {/* First name */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Nombre' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={inputStyles}
                  placeholder={locale === 'es' ? 'Tu nombre' : 'Your first name'}
                  autoComplete="given-name"
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelStyles}>
                  {locale === 'es' ? 'Correo Electrónico' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputStyles}
                  placeholder={locale === 'es' ? 'tu@correo.com' : 'you@example.com'}
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 border-2 border-[var(--border)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors"
              >
                {locale === 'es' ? 'Atrás' : 'Back'}
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-white"
                style={{ backgroundColor: brandPrimaryHex }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brandPrimaryDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brandPrimaryHex)
                }
              >
                {locale === 'es' ? 'Continuar' : 'Continue'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                style={{ backgroundColor: brandPrimaryHex }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    e.currentTarget.style.backgroundColor = brandPrimaryDark;
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    e.currentTarget.style.backgroundColor = brandPrimaryHex;
                }}
              >
                {isSubmitting
                  ? locale === 'es'
                    ? 'Calculando tu elegibilidad...'
                    : 'Calculating your eligibility...'
                  : locale === 'es'
                  ? 'Ver Mis Resultados'
                  : 'See My Results'}
              </button>
            )}
          </div>

          {/* No spam note — Step 3 only */}
          {step === 3 && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              {locale === 'es'
                ? 'Sin spam. Solo usamos tu correo para enviarte tus resultados.'
                : 'No spam. We only use your email to send your results.'}
            </p>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          {locale === 'es'
            ? 'Tu información es confidencial y nunca se vende.'
            : 'Your information is confidential and never sold.'}
        </p>
      </div>
    </main>
  );
}

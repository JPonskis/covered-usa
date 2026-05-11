'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormState {
  state: string;
  age: string;
  householdSize: string;
  annualIncome: string;
  incomeUnknown: boolean;
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired' | '';
  currentlyInsured: boolean | null;
  insuranceSource: 'employer' | 'aca' | 'medicaid' | 'medicare' | 'none' | '';
  hasChildren: boolean | null;
  numChildren: string;
  isPregnant: boolean | null;
  hasDisability: boolean | null;
  isVeteran: boolean | null;
}

const STATES = [
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

const TOTAL_STEPS = 10;

interface StepProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

function StepState({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        What state do you live in?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Coverage programs vary by state.
      </p>
      <select
        value={form.state}
        onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
        style={{
          width: '100%',
          padding: '0.875rem 2.5rem 0.875rem 1rem',
          fontSize: '1rem',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          background: 'white',
          color: form.state ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <option value="">Select your state...</option>
        {STATES.map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </div>
  );
}

function StepAge({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        How old are you?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Age determines which programs you can access.
      </p>
      <input
        type="number"
        min={0}
        max={110}
        value={form.age}
        onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
        placeholder="Enter your age"
        style={{
          width: '100%',
          padding: '0.875rem 1rem',
          fontSize: '1.125rem',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          background: 'white',
        }}
      />
    </div>
  );
}

function StepHouseholdSize({ form, setForm }: StepProps) {
  const sizes = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        How many people are in your household?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Include yourself, your spouse/partner, and any dependents you support.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {sizes.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setForm(f => ({ ...f, householdSize: String(n) }))}
            style={{
              padding: '1rem',
              border: '2px solid',
              borderColor: form.householdSize === String(n) ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.householdSize === String(n) ? 'var(--primary)' : 'white',
              color: form.householdSize === String(n) ? 'white' : 'var(--text-primary)',
              fontSize: '1.125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {n === 8 ? '8+' : n}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatIncome(value: string): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return parseInt(num, 10).toLocaleString();
}

function StepIncome({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        What is your household&apos;s annual income?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Include all sources: wages, Social Security, disability payments, etc. Estimates are fine.
      </p>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <span style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600,
          pointerEvents: 'none',
        }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={form.incomeUnknown ? '' : (form.annualIncome ? formatIncome(form.annualIncome) : '')}
          onChange={e => {
            const raw = e.target.value.replace(/\D/g, '');
            setForm(f => ({ ...f, annualIncome: raw, incomeUnknown: false }));
          }}
          disabled={form.incomeUnknown}
          placeholder="e.g. 35,000"
          style={{
            width: '100%',
            padding: '0.875rem 1rem 0.875rem 2rem',
            fontSize: '1.125rem',
            border: '2px solid var(--border)',
            borderRadius: '12px',
            background: form.incomeUnknown ? 'var(--sand)' : 'white',
            opacity: form.incomeUnknown ? 0.5 : 1,
          }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={form.incomeUnknown}
          onChange={e => setForm(f => ({ ...f, incomeUnknown: e.target.checked, annualIncome: e.target.checked ? '0' : '' }))}
          style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--primary)' }}
        />
        I&apos;m not sure / prefer not to say
      </label>
    </div>
  );
}

function StepEmployment({ form, setForm }: StepProps) {
  const options: { value: FormState['employmentStatus']; label: string; sub: string }[] = [
    { value: 'employed', label: 'Employed', sub: 'Working for an employer' },
    { value: 'self-employed', label: 'Self-Employed', sub: 'Freelance, contractor, own business' },
    { value: 'unemployed', label: 'Unemployed', sub: 'Not currently working' },
    { value: 'retired', label: 'Retired', sub: 'No longer in the workforce' },
  ];
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        What is your employment status?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        This affects which health insurance options are available.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setForm(f => ({ ...f, employmentStatus: opt.value }))}
            style={{
              padding: '1rem 1.25rem',
              border: '2px solid',
              borderColor: form.employmentStatus === opt.value ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.employmentStatus === opt.value ? 'var(--cream)' : 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontWeight: 600, color: form.employmentStatus === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInsurance({ form, setForm }: StepProps) {
  const sources: { value: FormState['insuranceSource']; label: string }[] = [
    { value: 'employer', label: 'Employer or job-based plan' },
    { value: 'aca', label: 'ACA Marketplace (Healthcare.gov)' },
    { value: 'medicaid', label: 'Medicaid / State health program' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'none', label: 'No insurance' },
  ];
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Do you currently have health insurance?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Select what best describes your current coverage.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sources.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setForm(f => ({
              ...f,
              currentlyInsured: opt.value !== 'none',
              insuranceSource: opt.value,
            }))}
            style={{
              padding: '1rem 1.25rem',
              border: '2px solid',
              borderColor: form.insuranceSource === opt.value ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.insuranceSource === opt.value ? 'var(--cream)' : 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: form.insuranceSource === opt.value ? 600 : 400,
              color: form.insuranceSource === opt.value ? 'var(--primary)' : 'var(--text-primary)',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepChildren({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Any children under 19 in your household?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Children may qualify for CHIP or Medicaid even if adults don&apos;t.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[true, false].map(val => (
          <button
            key={String(val)}
            type="button"
            onClick={() => setForm(f => ({ ...f, hasChildren: val, numChildren: val ? (f.numChildren || '1') : '0' }))}
            style={{
              padding: '1rem',
              border: '2px solid',
              borderColor: form.hasChildren === val ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.hasChildren === val ? 'var(--primary)' : 'white',
              color: form.hasChildren === val ? 'white' : 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {val ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      {form.hasChildren && (
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            How many children under 19?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(f => ({ ...f, numChildren: String(n) }))}
                style={{
                  padding: '0.75rem',
                  border: '2px solid',
                  borderColor: form.numChildren === String(n) ? 'var(--primary)' : 'var(--border)',
                  borderRadius: '10px',
                  background: form.numChildren === String(n) ? 'var(--primary)' : 'white',
                  color: form.numChildren === String(n) ? 'white' : 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {n === 6 ? '6+' : n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepPregnant({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Are you currently pregnant?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Pregnancy often unlocks expanded Medicaid coverage.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { val: true, label: 'Yes' },
          { val: false, label: 'No' },
          { val: null, label: 'Skip' },
        ].map(opt => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => setForm(f => ({ ...f, isPregnant: opt.val }))}
            style={{
              padding: '1rem',
              border: '2px solid',
              borderColor: form.isPregnant === opt.val ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.isPregnant === opt.val ? 'var(--primary)' : 'white',
              color: form.isPregnant === opt.val ? 'white' : 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDisability({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Do you have a disability?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        A disability that affects your ability to work may qualify you for Medicare or other programs.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => setForm(f => ({ ...f, hasDisability: opt.val }))}
            style={{
              padding: '1rem',
              border: '2px solid',
              borderColor: form.hasDisability === opt.val ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.hasDisability === opt.val ? 'var(--primary)' : 'white',
              color: form.hasDisability === opt.val ? 'white' : 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepVeteran({ form, setForm }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Are you a U.S. veteran?
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Veterans may qualify for VA healthcare regardless of income.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => setForm(f => ({ ...f, isVeteran: opt.val }))}
            style={{
              padding: '1rem',
              border: '2px solid',
              borderColor: form.isVeteran === opt.val ? 'var(--primary)' : 'var(--border)',
              borderRadius: '12px',
              background: form.isVeteran === opt.val ? 'var(--primary)' : 'white',
              color: form.isVeteran === opt.val ? 'white' : 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function canAdvance(step: number, form: FormState): boolean {
  switch (step) {
    case 1: return !!form.state;
    case 2: return !!form.age && parseInt(form.age) > 0;
    case 3: return !!form.householdSize;
    case 4: return form.incomeUnknown || (!!form.annualIncome && form.annualIncome !== '');
    case 5: return !!form.employmentStatus;
    case 6: return form.insuranceSource !== '';
    case 7: return form.hasChildren !== null;
    case 8: return form.isPregnant !== undefined;
    case 9: return form.hasDisability !== null;
    case 10: return form.isVeteran !== null;
    default: return true;
  }
}

export default function ScreenerContent({ locale }: { locale: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    state: '',
    age: '',
    householdSize: '',
    annualIncome: '',
    incomeUnknown: false,
    employmentStatus: '',
    currentlyInsured: null,
    insuranceSource: '',
    hasChildren: null,
    numChildren: '0',
    isPregnant: null,
    hasDisability: null,
    isVeteran: null,
  });

  const progress = (step / TOTAL_STEPS) * 100;

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        state: form.state,
        age: parseInt(form.age) || 30,
        householdSize: parseInt(form.householdSize) || 1,
        annualIncome: form.incomeUnknown ? 0 : (parseInt(form.annualIncome) || 0),
        employmentStatus: form.employmentStatus || 'unemployed',
        isPregnant: form.isPregnant ?? false,
        hasDisability: form.hasDisability ?? false,
        currentlyInsured: form.currentlyInsured ?? false,
        insuranceSource: form.insuranceSource || 'none',
        isVeteran: form.isVeteran ?? false,
        numChildren: parseInt(form.numChildren) || 0,
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
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 1: return <StepState form={form} setForm={setForm} />;
      case 2: return <StepAge form={form} setForm={setForm} />;
      case 3: return <StepHouseholdSize form={form} setForm={setForm} />;
      case 4: return <StepIncome form={form} setForm={setForm} />;
      case 5: return <StepEmployment form={form} setForm={setForm} />;
      case 6: return <StepInsurance form={form} setForm={setForm} />;
      case 7: return <StepChildren form={form} setForm={setForm} />;
      case 8: return <StepPregnant form={form} setForm={setForm} />;
      case 9: return <StepDisability form={form} setForm={setForm} />;
      case 10: return <StepVeteran form={form} setForm={setForm} />;
      default: return null;
    }
  }

  const isLast = step === TOTAL_STEPS;
  const canGoNext = canAdvance(step, form);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '540px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>CoveredUSA</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '6px',
          background: 'var(--sand)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--teal))',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(3, 105, 161, 0.08)',
        border: '1px solid var(--border-light)',
        flex: 1,
      }}>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        marginTop: '1.5rem',
        display: 'flex',
        gap: '0.75rem',
      }}>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            style={{
              flex: 1,
              padding: '0.875rem',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              background: 'white',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canGoNext}
            style={{
              flex: step > 1 ? 2 : 1,
              padding: '0.875rem',
              border: 'none',
              borderRadius: '12px',
              background: canGoNext ? 'var(--primary)' : 'var(--sand)',
              color: canGoNext ? 'white' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canGoNext || submitting}
            style={{
              flex: 2,
              padding: '0.875rem',
              border: 'none',
              borderRadius: '12px',
              background: (canGoNext && !submitting) ? 'linear-gradient(135deg, var(--primary), var(--teal))' : 'var(--sand)',
              color: (canGoNext && !submitting) ? 'white' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: (canGoNext && !submitting) ? 'pointer' : 'not-allowed',
              boxShadow: (canGoNext && !submitting) ? '0 4px 16px rgba(3, 105, 161, 0.3)' : 'none',
            }}
          >
            {submitting ? 'Checking eligibility...' : 'See my results'}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>
      )}

      {/* Trust signals */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {['Free & confidential', 'No sign-up required', 'Takes 2 minutes'].map(t => (
          <span key={t} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

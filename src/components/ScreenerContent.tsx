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

const TOTAL_STEPS = 4;

const STEP_META = [
  { title: 'About You', subtitle: 'Basic information about your household', icon: '👤' },
  { title: 'Income & Work', subtitle: 'Your earnings and employment situation', icon: '💼' },
  { title: 'Current Coverage', subtitle: 'Your existing health insurance', icon: '🏥' },
  { title: 'Additional Info', subtitle: 'A few more details to refine your results', icon: '📋' },
];

interface StepProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

/* ---- Shared UI Components ---- */

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
      }}
    >
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  compact,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: compact ? '0.625rem 0.75rem' : '0.75rem 1rem',
        border: '2px solid',
        borderColor: selected ? 'var(--primary)' : 'var(--border)',
        borderRadius: '10px',
        background: selected ? 'var(--primary)' : 'white',
        color: selected ? 'white' : 'var(--text-primary)',
        fontSize: compact ? '0.9rem' : '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}

function SelectionCard({
  selected,
  onClick,
  label,
  sublabel,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.875rem 1rem',
        border: '2px solid',
        borderColor: selected ? 'var(--primary)' : 'var(--border)',
        borderRadius: '12px',
        background: selected ? 'var(--cream)' : 'white',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: selected ? 'var(--primary)' : 'var(--border)',
          background: selected ? 'var(--primary)' : 'white',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: selected ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sublabel}</div>
        )}
      </div>
    </button>
  );
}

function SectionDivider() {
  return <div style={{ height: '1px', background: 'var(--border-light)', margin: '1.5rem 0' }} />;
}

/* ---- Step 1: About You ---- */
function StepAboutYou({ form, setForm }: StepProps) {
  const sizes = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* State */}
      <div>
        <FieldLabel htmlFor="state-select">What state do you live in?</FieldLabel>
        <FieldHint>Health coverage programs vary by state.</FieldHint>
        <select
          id="state-select"
          value={form.state}
          onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid var(--border)',
            borderRadius: '10px',
            background: 'white',
            color: form.state ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          <option value="">Select your state...</option>
          {STATES.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      <SectionDivider />

      {/* Age */}
      <div>
        <FieldLabel htmlFor="age-input">How old are you?</FieldLabel>
        <FieldHint>Age determines which programs you can access.</FieldHint>
        <input
          id="age-input"
          type="number"
          min={0}
          max={110}
          value={form.age}
          onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
          placeholder="Enter your age"
          style={{
            width: '100%',
            maxWidth: '200px',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid var(--border)',
            borderRadius: '10px',
            background: 'white',
            transition: 'border-color 0.15s',
          }}
        />
      </div>

      <SectionDivider />

      {/* Household size */}
      <div>
        <FieldLabel>How many people are in your household?</FieldLabel>
        <FieldHint>Include yourself, your spouse/partner, and any dependents.</FieldHint>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxWidth: '320px' }}>
          {sizes.map(n => (
            <OptionButton
              key={n}
              selected={form.householdSize === String(n)}
              onClick={() => setForm(f => ({ ...f, householdSize: String(n) }))}
              compact
            >
              {n === 8 ? '8+' : n}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Step 2: Income & Work ---- */
function formatIncome(value: string): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return parseInt(num, 10).toLocaleString();
}

function StepIncomeWork({ form, setForm }: StepProps) {
  const employmentOptions: { value: FormState['employmentStatus']; label: string; sub: string }[] = [
    { value: 'employed', label: 'Employed', sub: 'Working for an employer' },
    { value: 'self-employed', label: 'Self-Employed', sub: 'Freelance, contractor, own business' },
    { value: 'unemployed', label: 'Unemployed', sub: 'Not currently working' },
    { value: 'retired', label: 'Retired', sub: 'No longer in the workforce' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Annual income */}
      <div>
        <FieldLabel htmlFor="income-input">What is your household&apos;s annual income?</FieldLabel>
        <FieldHint>Include all sources: wages, Social Security, disability payments, etc. Estimates are fine.</FieldHint>
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600,
            pointerEvents: 'none',
          }}>$</span>
          <input
            id="income-input"
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
              maxWidth: '280px',
              padding: '0.75rem 1rem 0.75rem 2rem',
              fontSize: '1rem',
              border: '2px solid var(--border)',
              borderRadius: '10px',
              background: form.incomeUnknown ? 'var(--sand)' : 'white',
              opacity: form.incomeUnknown ? 0.5 : 1,
              transition: 'border-color 0.15s',
            }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={form.incomeUnknown}
            onChange={e => setForm(f => ({ ...f, incomeUnknown: e.target.checked, annualIncome: e.target.checked ? '0' : '' }))}
            style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)' }}
          />
          I&apos;m not sure / prefer not to say
        </label>
      </div>

      <SectionDivider />

      {/* Employment */}
      <div>
        <FieldLabel>What is your employment status?</FieldLabel>
        <FieldHint>This affects which health insurance options are available.</FieldHint>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {employmentOptions.map(opt => (
            <SelectionCard
              key={opt.value}
              selected={form.employmentStatus === opt.value}
              onClick={() => setForm(f => ({ ...f, employmentStatus: opt.value }))}
              label={opt.label}
              sublabel={opt.sub}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Step 3: Current Coverage ---- */
function StepCoverage({ form, setForm }: StepProps) {
  const sources: { value: FormState['insuranceSource']; label: string; sub?: string }[] = [
    { value: 'employer', label: 'Employer or job-based plan' },
    { value: 'aca', label: 'ACA Marketplace (Healthcare.gov)' },
    { value: 'medicaid', label: 'Medicaid / State health program' },
    { value: 'medicare', label: 'Medicare' },
    { value: 'none', label: 'No insurance', sub: 'Currently uninsured' },
  ];

  return (
    <div>
      <FieldLabel>What best describes your current health coverage?</FieldLabel>
      <FieldHint>Select your current insurance source, or &quot;No insurance&quot; if you&apos;re uninsured.</FieldHint>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sources.map(opt => (
          <SelectionCard
            key={opt.value}
            selected={form.insuranceSource === opt.value}
            onClick={() => setForm(f => ({
              ...f,
              currentlyInsured: opt.value !== 'none',
              insuranceSource: opt.value,
            }))}
            label={opt.label}
            sublabel={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Step 4: Additional Info ---- */
function StepAdditional({ form, setForm }: StepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Children */}
      <div>
        <FieldLabel>Any children under 19 in your household?</FieldLabel>
        <FieldHint>Children may qualify for CHIP or Medicaid even if adults don&apos;t.</FieldHint>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxWidth: '240px' }}>
          {[true, false].map(val => (
            <OptionButton
              key={String(val)}
              selected={form.hasChildren === val}
              onClick={() => setForm(f => ({ ...f, hasChildren: val, numChildren: val ? (f.numChildren || '1') : '0' }))}
            >
              {val ? 'Yes' : 'No'}
            </OptionButton>
          ))}
        </div>
        {form.hasChildren && (
          <div style={{ marginTop: '1rem' }}>
            <FieldLabel>How many children under 19?</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', maxWidth: '320px' }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <OptionButton
                  key={n}
                  selected={form.numChildren === String(n)}
                  onClick={() => setForm(f => ({ ...f, numChildren: String(n) }))}
                  compact
                >
                  {n === 6 ? '6+' : n}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* Pregnant */}
      <div>
        <FieldLabel>Are you currently pregnant?</FieldLabel>
        <FieldHint>Pregnancy often unlocks expanded Medicaid coverage.</FieldHint>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', maxWidth: '300px' }}>
          {[
            { val: true as const, label: 'Yes' },
            { val: false as const, label: 'No' },
            { val: null, label: 'Skip' },
          ].map(opt => (
            <OptionButton
              key={String(opt.val)}
              selected={form.isPregnant === opt.val}
              onClick={() => setForm(f => ({ ...f, isPregnant: opt.val }))}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Disability */}
      <div>
        <FieldLabel>Do you have a disability?</FieldLabel>
        <FieldHint>A disability that affects your ability to work may qualify you for additional programs.</FieldHint>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxWidth: '240px' }}>
          {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
            <OptionButton
              key={String(opt.val)}
              selected={form.hasDisability === opt.val}
              onClick={() => setForm(f => ({ ...f, hasDisability: opt.val }))}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Veteran */}
      <div>
        <FieldLabel>Are you a U.S. veteran?</FieldLabel>
        <FieldHint>Veterans may qualify for VA healthcare regardless of income.</FieldHint>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxWidth: '240px' }}>
          {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
            <OptionButton
              key={String(opt.val)}
              selected={form.isVeteran === opt.val}
              onClick={() => setForm(f => ({ ...f, isVeteran: opt.val }))}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Validation ---- */
function canAdvance(step: number, form: FormState): boolean {
  switch (step) {
    case 1: return !!form.state && !!form.age && parseInt(form.age) > 0 && !!form.householdSize;
    case 2: return (form.incomeUnknown || (!!form.annualIncome && form.annualIncome !== '')) && !!form.employmentStatus;
    case 3: return form.insuranceSource !== '';
    case 4: return form.hasChildren !== null && form.hasDisability !== null && form.isVeteran !== null;
    default: return true;
  }
}

/* ---- Main Component ---- */
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
      case 1: return <StepAboutYou form={form} setForm={setForm} />;
      case 2: return <StepIncomeWork form={form} setForm={setForm} />;
      case 3: return <StepCoverage form={form} setForm={setForm} />;
      case 4: return <StepAdditional form={form} setForm={setForm} />;
      default: return null;
    }
  }

  const isLast = step === TOTAL_STEPS;
  const canGoNext = canAdvance(step, form);
  const meta = STEP_META[step - 1];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--cream) 0%, var(--warm-white) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem 3rem',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>CoveredUSA</span>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
          {STEP_META.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '8px',
                background: step === i + 1 ? 'var(--cream-dark)' : 'transparent',
                cursor: i + 1 < step ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onClick={() => { if (i + 1 < step) setStep(i + 1); }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                background: i + 1 <= step ? 'var(--primary)' : 'var(--sand)',
                color: i + 1 <= step ? 'white' : 'var(--text-muted)',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}>
                {i + 1 < step ? '✓' : i + 1}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: step === i + 1 ? 600 : 400,
                color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'none',
              }}
              className="sm:!inline"
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}>
        {/* Step header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              fontFamily: 'var(--font-display)',
            }}>
              {meta.title}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {meta.subtitle}
          </p>
        </div>

        {renderStep()}
      </div>

      {/* Navigation */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginTop: '1.25rem',
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
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
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
              fontSize: '0.95rem',
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: canGoNext ? 'var(--shadow-primary)' : 'none',
            }}
          >
            Continue
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
              fontSize: '0.95rem',
              cursor: (canGoNext && !submitting) ? 'pointer' : 'not-allowed',
              boxShadow: (canGoNext && !submitting) ? 'var(--shadow-primary)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Checking eligibility...' : 'See my results'}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</p>
      )}

      {/* Trust signals */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {['Free & confidential', 'No sign-up required', 'Takes 2 minutes'].map(t => (
          <span key={t} style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="var(--success)" strokeWidth="1.5" />
              <path d="M4.5 7L6 8.5L9.5 5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

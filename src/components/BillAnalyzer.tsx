'use client'

import { useState, useRef } from 'react'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import { getFPLPercent } from '@/lib/bill-analyzer/types'

type Step = 'upload' | 'about-you' | 'analyzing' | 'results' | 'letter'
type InsuranceStatus = 'yes' | 'no' | 'not_sure' | ''

const TOTAL_FORM_STEPS = 2
const ANALYZING_STEPS = [
  'Reading your bill',
  'Extracting line items',
  'Comparing to federal rates',
  'Checking for billing errors',
  'Checking charity care eligibility',
  'Preparing your results',
]

const inputStyles =
  'w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow'
const labelStyles = 'block text-sm font-medium text-[var(--text-primary)] mb-2'

export default function BillAnalyzer() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)

  // About You
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [emailConsent, setEmailConsent] = useState(true)
  const [hospitalName, setHospitalName] = useState('')
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>('')
  const [income, setIncome] = useState('')
  const [householdSize, setHouseholdSize] = useState('')

  // Analysis
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [extractedPatient, setExtractedPatient] = useState<{
    name?: string; address?: string; accountNumber?: string
  } | null>(null)

  // Letter form (shown inline before generating)
  const [letterFormOpen, setLetterFormOpen] = useState(false)
  const [letterFormName, setLetterFormName] = useState('')
  const [letterFormAddress, setLetterFormAddress] = useState('')
  const [letterFormAccountNumber, setLetterFormAccountNumber] = useState('')

  // Letter result
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterText, setLetterText] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // UI state
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [analyzingStep, setAnalyzingStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formStep = step === 'upload' ? 1 : step === 'about-you' ? 2 : 0
  const progressPct = formStep > 0 ? Math.round((formStep / TOTAL_FORM_STEPS) * 100) : 0

  const incomeNum = income ? parseInt(income.replace(/[^0-9]/g, ''), 10) : 0
  const householdSizeNum = householdSize ? parseInt(householdSize, 10) : 0
  const fplPct = incomeNum && householdSizeNum ? getFPLPercent(incomeNum, householdSizeNum) : null

  function handleFileSelect(f: File) {
    setFile(f)
    setError('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  function goToAboutYou() {
    if (!file) {
      setValidationError('Please upload a bill to continue.')
      return
    }
    setValidationError('')
    setStep('about-you')
  }

  function validateEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }

  async function handleAnalyze() {
    if (!firstName.trim()) {
      setValidationError('Please enter your first name.')
      return
    }
    if (!email.trim() || !validateEmail(email)) {
      setValidationError('Please enter a valid email address.')
      return
    }
    if (!hospitalName.trim()) {
      setValidationError('Please enter the hospital name from your bill.')
      return
    }
    setValidationError('')

    if (!file) return
    setStep('analyzing')
    setError('')

    let stepIdx = 0
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, ANALYZING_STEPS.length - 1)
      setAnalyzingStep(stepIdx)
    }, 3500)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (income) {
        const raw = income.replace(/[^0-9]/g, '')
        formData.append('income', raw)
      }
      if (householdSize) formData.append('householdSize', householdSize)

      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        body: formData,
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStep('about-you')
        return
      }

      const data = await res.json() as AnalysisResult & {
        resultId?: string
        extractedPatient?: { name?: string; address?: string; accountNumber?: string }
      }
      const { resultId: rid, extractedPatient: ep, ...analysisData } = data
      setResult(analysisData)
      setResultId(rid ?? null)

      if (ep) {
        setExtractedPatient(ep)
        // Pre-fill letter form fields with OCR data
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        setLetterFormName(ep.name ?? fullName)
        setLetterFormAddress(ep.address ?? '')
        setLetterFormAccountNumber(ep.accountNumber ?? '')
      } else {
        setLetterFormName([firstName, lastName].filter(Boolean).join(' '))
      }

      setStep('results')
    } catch {
      clearInterval(interval)
      setError('Network error. Please check your connection and try again.')
      setStep('about-you')
    }
  }

  async function sendAnalysisEmail(letterContent: string) {
    try {
      await fetch('/api/send-analysis-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          resultId,
          emailConsent,
          analysis: result ? {
            ...result,
            provider: { ...result.provider, name: hospitalName || result.provider.name },
          } : result,
          letterText: letterContent,
        }),
      })
      setEmailSent(true)
    } catch {
      // Email is best-effort; don't block the user flow
    }
  }

  async function handleGetLetter() {
    if (!result) return
    setLetterLoading(true)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: {
            ...result,
            provider: { ...result.provider, name: hospitalName || result.provider.name },
          },
          patientName: letterFormName || [firstName, lastName].filter(Boolean).join(' '),
          patientAddress: letterFormAddress || undefined,
          accountNumber: letterFormAccountNumber || undefined,
        }),
      })
      const data = await res.json()
      const text = data.text ?? ''
      setLetterText(text)
      setLetterFormOpen(false)
      setStep('letter')

      if (email && text) {
        sendAnalysisEmail(text)
      }
    } catch {
      setError('Failed to generate letter. Please try again.')
    } finally {
      setLetterLoading(false)
    }
  }

  function copyLetter() {
    navigator.clipboard.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setStep('upload')
    setFile(null)
    setResult(null)
    setError('')
    setValidationError('')
    setLetterText('')
    setLetterFormOpen(false)
    setLetterFormName('')
    setLetterFormAddress('')
    setLetterFormAccountNumber('')
    setAnalyzingStep(0)
    setEmailSent(false)
    setHospitalName('')
    setResultId(null)
    setExtractedPatient(null)
  }

  function getHealthCTA() {
    if (insuranceStatus === 'no') {
      if (fplPct && fplPct <= 138) {
        return {
          headline: 'You likely qualify for free Medicaid coverage',
          body: `At ${fplPct}% of the federal poverty level, you're likely eligible for Medicaid — which would cover future medical bills at little to no cost.`,
          cta: 'Check Medicaid Eligibility',
          badge: 'Likely eligible',
          badgeColor: 'var(--success)',
        }
      }
      if (fplPct && fplPct <= 400) {
        return {
          headline: 'You likely qualify for subsidized health insurance',
          body: `At ${fplPct}% of the federal poverty level, you're likely eligible for ACA marketplace plans with subsidies that significantly reduce your monthly premium.`,
          cta: 'See Your Plan Options',
          badge: 'Likely eligible',
          badgeColor: 'var(--success)',
        }
      }
      return {
        headline: "You don't have insurance — let's change that",
        body: "Without coverage, bills like this are the norm. Check what free or subsidized plans you qualify for. Takes 3 minutes.",
        cta: 'Check What You Qualify For',
        badge: null,
        badgeColor: null,
      }
    }
    if (insuranceStatus === 'yes') {
      return {
        headline: 'Even with insurance, you may qualify for better coverage',
        body: 'If you have a high deductible or pay high premiums, you might qualify for a lower-cost plan through the ACA marketplace.',
        cta: 'See If You Can Do Better',
        badge: null,
        badgeColor: null,
      }
    }
    return {
      headline: 'Check what health coverage you qualify for',
      body: "Many people dealing with unexpected medical bills qualify for free or low-cost health insurance they don't know about.",
      cta: 'Check Your Eligibility',
      badge: null,
      badgeColor: null,
    }
  }

  // ── STEP 1: UPLOAD ──────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Step 1 of 2</p>
              <p className="font-semibold text-[var(--text-primary)]">Upload Your Bill</p>
            </div>
            <p className="text-sm font-medium" style={{ color: '#0d9488' }}>{progressPct}%</p>
          </div>
          <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ backgroundColor: '#0d9488', width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
              Upload Your Bill
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Take a photo or upload a PDF of your hospital bill.
            </p>
          </div>

          {/* Upload zone */}
          <div
            className="rounded-xl p-8 border-2 border-dashed transition-all cursor-pointer hover:border-[var(--primary)]"
            style={{
              borderColor: file ? 'var(--primary)' : 'var(--border)',
              background: file ? 'var(--primary-lightest)' : 'var(--cream)',
            }}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              capture="environment"
            />

            <div className="text-center">
              {file ? (
                <div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--primary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-sm mt-1 text-[var(--text-muted)]">
                    {(file.size / 1024 / 1024).toFixed(1)} MB. Tap to change.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cream-dark)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[var(--text-primary)]">Upload your medical bill</p>
                  <p className="text-sm mt-1 text-[var(--text-muted)]">Drag and drop, tap to browse, or take a photo</p>
                  <p className="text-xs mt-2 text-[var(--text-muted)]">PDF, JPEG, PNG, or WebP. Up to 10MB.</p>
                </div>
              )}
            </div>
          </div>

          {validationError && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={goToAboutYou}
              className="w-full py-3.5 px-4 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: '#0d9488' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f766e'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d9488'}
            >
              Continue
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            Your bill is never stored. Analyzed securely and deleted immediately.
          </p>
        </div>
      </div>
    )
  }

  // ── STEP 2: ABOUT YOU ───────────────────────────────────────
  if (step === 'about-you') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Step 2 of 2</p>
              <p className="font-semibold text-[var(--text-primary)]">About You</p>
            </div>
            <p className="text-sm font-medium" style={{ color: '#0d9488' }}>{progressPct}%</p>
          </div>
          <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ backgroundColor: '#0d9488', width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-[var(--border-light)] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
              About You
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              We'll email you a copy of your analysis and dispute letter.
            </p>
          </div>

          <div className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setValidationError('') }}
                  className={inputStyles}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className={labelStyles}>Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className={inputStyles}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Hospital */}
            <div>
              <label className={labelStyles}>Hospital name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={e => { setHospitalName(e.target.value); setValidationError('') }}
                className={inputStyles}
                placeholder="e.g. Valley Medical Center"
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelStyles}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setValidationError('') }}
                className={inputStyles}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailConsent}
                  onChange={e => setEmailConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#0d9488] shrink-0"
                />
                <span className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Email me my results and tips for saving on medical bills and health coverage.
                </span>
              </label>
            </div>

            {/* Insurance status */}
            <div>
              <label className={labelStyles}>Do you currently have health insurance?</label>
              <div className="grid grid-cols-3 gap-2">
                {(['yes', 'no', 'not_sure'] as InsuranceStatus[]).map((opt) => {
                  const labels = { yes: 'Yes', no: 'No', not_sure: "Not sure" }
                  const selected = insuranceStatus === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setInsuranceStatus(opt)}
                      className="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: selected ? '#0d9488' : 'var(--border)',
                        background: selected ? '#f0fdfa' : 'white',
                        color: selected ? '#0d9488' : 'var(--text-primary)',
                      }}
                    >
                      {labels[opt as keyof typeof labels]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Income (optional) */}
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                Check charity care eligibility (optional)
              </p>
              <div className="bg-[var(--cream)] rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyles}>Annual household income</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[var(--text-muted)]">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="35,000"
                        value={income}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, '')
                          const formatted = raw ? parseInt(raw, 10).toLocaleString('en-US') : ''
                          setIncome(formatted)
                        }}
                        className={`${inputStyles} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Household size</label>
                    <select
                      value={householdSize}
                      onChange={e => setHouseholdSize(e.target.value)}
                      className={inputStyles}
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  About 60% of hospitals are nonprofits and must offer financial assistance by law. Add your income to check if you qualify.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {validationError && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => { setStep('upload'); setValidationError('') }}
              className="flex-1 py-3.5 px-4 border-2 border-[var(--border)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--cream)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAnalyze}
              className="flex-1 py-3.5 px-4 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: '#0d9488' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f766e'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d9488'}
            >
              Analyze My Bill
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            No spam. We only use your email to send your results.
          </p>
        </div>
      </div>
    )
  }

  // ── ANALYZING ───────────────────────────────────────────────
  if (step === 'analyzing') {
    const analyzeProgress = Math.round(((analyzingStep + 1) / ANALYZING_STEPS.length) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="var(--border-light)" strokeWidth="4" />
                <path d="M32 4a28 28 0 0 1 28 28" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">Analyzing your bill</p>
            <p className="text-sm text-[var(--text-muted)] mb-6">This usually takes 15 to 30 seconds.</p>

            <div className="max-w-sm mx-auto mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-muted)]">Step {analyzingStep + 1} of {ANALYZING_STEPS.length}</p>
                <p className="text-sm font-medium" style={{ color: '#0d9488' }}>{analyzeProgress}%</p>
              </div>
              <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: '#0d9488', width: `${analyzeProgress}%` }} />
              </div>
            </div>

            <p className="text-sm font-medium" style={{ color: '#0d9488' }}>{ANALYZING_STEPS[analyzingStep]}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── RESULTS ─────────────────────────────────────────────────
  if (step === 'results' && result) {
    const savings = result.summary.totalOvercharge
    const hasRates = result.summary.lineItemsWithRates > 0

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary card */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
          <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, var(--primary-deeper), var(--primary-dark))' }}>
            <p className="text-sm text-white/70 mb-1">Analysis Complete</p>
            <p className="text-lg font-semibold text-white">{result.provider.name}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <div className={`grid ${hasRates ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Total billed</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">${result.summary.totalBilled.toLocaleString()}</p>
              </div>
              {hasRates && (
                <>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Federal rate</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">${result.summary.totalMedicareRate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Potential savings</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>${savings.toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
            {result.summary.errorsFound > 0 && (
              <div className="mt-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                {result.summary.errorsFound} billing error{result.summary.errorsFound > 1 ? 's' : ''} detected
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Line-by-line breakdown</h3>
            <p className="text-sm text-[var(--text-muted)]">Each charge compared to the federal payment rate</p>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {result.lineItems.map((item, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.description}</p>
                    {item.flags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.flags.map((flag, fi) => (
                          <span key={fi} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{
                            background: flag.severity === 'high' ? 'var(--error-light)' : 'var(--warning-light)',
                            color: flag.severity === 'high' ? 'var(--error)' : 'var(--warning)',
                          }}>
                            {flag.explanation}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">${item.billedAmount.toLocaleString()}</p>
                    {item.medicareRate != null && (
                      <p className="text-xs mt-1 text-[var(--text-muted)]">Federal: ${item.medicareRate.toLocaleString()}</p>
                    )}
                    {item.overchargeAmount != null && item.overchargeAmount > 0 && (
                      <p className="text-xs font-medium mt-1" style={{ color: 'var(--error)' }}>
                        +${item.overchargeAmount.toLocaleString()} ({item.overchargePercent}% over)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charity care */}
        {result.charityCare.hospitalIsNonprofit && (
          <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
            <div className="border-l-4 p-5" style={{ borderLeftColor: 'var(--success)' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--success)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                    {result.charityCare.eligible ? 'You may qualify for free or reduced care' : 'This hospital has a charity care program'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{result.charityCare.explanation}</p>
                  <div className="bg-[var(--cream)] rounded-lg p-4">
                    <p className="text-xs font-medium text-[var(--text-primary)] mb-2 uppercase tracking-wide">Next steps</p>
                    <ul className="space-y-1.5">
                      {result.charityCare.nextSteps.map((s, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                          <span className="text-[var(--success)] font-bold shrink-0">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate letter */}
        <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Dispute this bill</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Generate a formal dispute letter citing every overcharge and billing error found on your bill.
          </p>

          {!letterFormOpen ? (
            <button
              onClick={() => setLetterFormOpen(true)}
              className="w-full py-3.5 px-4 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: '#0d9488' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f766e'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d9488'}
            >
              Generate My Dispute Letter
            </button>
          ) : (
            <div className="space-y-4">
              {/* OCR disclaimer */}
              <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ background: '#fefce8', border: '1px solid #fde68a', color: '#92400e' }}>
                The fields below were pre-filled from your bill using OCR. Please verify they are correct before generating your letter.
              </div>

              {/* Letter form fields */}
              <div>
                <label className={labelStyles}>Your full name</label>
                <input
                  type="text"
                  value={letterFormName}
                  onChange={e => setLetterFormName(e.target.value)}
                  className={inputStyles}
                  placeholder="First Last"
                />
              </div>
              <div>
                <label className={labelStyles}>Your mailing address</label>
                <input
                  type="text"
                  value={letterFormAddress}
                  onChange={e => setLetterFormAddress(e.target.value)}
                  className={inputStyles}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div>
                <label className={labelStyles}>Account number <span className="font-normal text-[var(--text-muted)]">(optional)</span></label>
                <input
                  type="text"
                  value={letterFormAccountNumber}
                  onChange={e => setLetterFormAccountNumber(e.target.value)}
                  className={inputStyles}
                  placeholder="From your bill"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setLetterFormOpen(false)}
                  className="py-3 px-4 rounded-lg font-medium text-sm border-2 border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--cream)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGetLetter}
                  disabled={letterLoading}
                  className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0d9488' }}
                  onMouseEnter={e => { if (!letterLoading) e.currentTarget.style.backgroundColor = '#0f766e' }}
                  onMouseLeave={e => { if (!letterLoading) e.currentTarget.style.backgroundColor = '#0d9488' }}
                >
                  {letterLoading ? 'Generating...' : 'Generate & Send Letter'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-[var(--text-muted)]">{result.disclaimer}</p>

        <button onClick={reset} className="text-sm w-full text-center font-medium transition-colors" style={{ color: 'var(--primary)' }}>
          Analyze another bill
        </button>
      </div>
    )
  }

  // ── LETTER ──────────────────────────────────────────────────
  if (step === 'letter') {
    const cta = getHealthCTA()
    const screenerUrl = `/en/screener?utm_source=bill_analyzer&utm_medium=letter${incomeNum ? `&income=${incomeNum}` : ''}${householdSize ? `&household=${householdSize}` : ''}`

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Letter preview */}
        <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Your dispute letter</h3>
            {emailSent ? (
              <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--success)' }}>
                Sent to {email} — check your inbox for the PDF and Word doc.
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Read the letter below. A PDF copy has been sent to your email.</p>
            )}
          </div>
          <div className="relative">
            <div
              className="p-6 sm:p-8 text-sm leading-relaxed whitespace-pre-wrap overflow-auto"
              style={{
                maxHeight: '420px',
                background: 'white',
                color: 'var(--text-secondary)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: '13px',
                lineHeight: '1.75',
              }}
            >
              {letterText}
            </div>
            {/* Scroll fade */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0"
              style={{
                height: '48px',
                background: 'linear-gradient(transparent, rgba(255,255,255,0.95))',
              }}
            />
          </div>
          <div className="px-6 py-4 border-t border-[var(--border-light)]">
            <button
              onClick={copyLetter}
              className="text-sm font-medium transition-colors"
              style={{ color: copied ? 'var(--success)' : 'var(--primary)' }}
            >
              {copied ? 'Copied to clipboard' : 'Copy letter to clipboard'}
            </button>
          </div>
        </div>

        {/* Personalized health coverage CTA */}
        <div
          className="rounded-xl p-6 border"
          style={{ background: '#f0fdfa', borderColor: '#99f6e4' }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-[var(--text-primary)]">{cta.headline}</h3>
            {cta.badge && (
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: cta.badgeColor ?? 'var(--success)' }}>
                {cta.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{cta.body}</p>
          <a
            href={screenerUrl}
            className="inline-block w-full text-center py-3.5 px-4 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: '#0d9488' }}
          >
            {cta.cta}
          </a>
        </div>

        <button
          onClick={() => setStep('results')}
          className="text-sm w-full text-center font-medium flex items-center justify-center gap-1"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to results
        </button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          This letter is for informational purposes only and does not constitute legal advice. Review carefully before sending.
        </p>
      </div>
    )
  }

  return null
}

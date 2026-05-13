'use client'

import { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import { getFPLPercent } from '@/lib/bill-analyzer/types'
import { checkEligibility } from '@/lib/eligibility'
import type { ProgramResult } from '@/lib/eligibility'

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

function scrollToAnalyzer() {
  const el = document.getElementById('analyzer')
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24 })
}

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
  const [userState, setUserState] = useState('')
  const [income, setIncome] = useState('')
  const [householdSize, setHouseholdSize] = useState('')

  // Analysis
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [extractedPatient, setExtractedPatient] = useState<{
    name?: string; address?: string; accountNumber?: string; providerState?: string
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

  // Bill lead capture (post-letter CTA)
  const [billLeadPhone, setBillLeadPhone] = useState('')
  const [billLeadTcpa, setBillLeadTcpa] = useState(true)
  const [billLeadSubmitting, setBillLeadSubmitting] = useState(false)
  const [billLeadDone, setBillLeadDone] = useState(false)
  const [billLeadError, setBillLeadError] = useState('')

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
      setValidationError('Please enter the hospital or clinic name from your bill.')
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
        extractedPatient?: { name?: string; address?: string; accountNumber?: string; providerState?: string }
      }
      const { resultId: rid, extractedPatient: ep, ...analysisData } = data
      setResult(analysisData)
      setResultId(rid ?? null)

      if (ep) {
        setExtractedPatient(ep)
        if (ep.providerState && !userState) setUserState(ep.providerState)
        // Pre-fill letter form fields with OCR data
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        setLetterFormName(ep.name ?? fullName)
        setLetterFormAddress(ep.address ?? '')
        setLetterFormAccountNumber(ep.accountNumber ?? '')
      } else {
        setLetterFormName([firstName, lastName].filter(Boolean).join(' '))
      }

      flushSync(() => setStep('results'))
      scrollToAnalyzer()
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
      flushSync(() => {
        setLetterText(text)
        setLetterFormOpen(false)
        setStep('letter')
      })
      scrollToAnalyzer()

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
    setBillLeadPhone('')
    setBillLeadTcpa(false)
    setBillLeadSubmitting(false)
    setBillLeadDone(false)
    setBillLeadError('')
  }

  function getProgramCTAUrl(id: string): string {
    if (id === 'aca') return 'https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_source=coveredusa&utm_medium=bill_analyzer'
    if (id === 'medicaid') return 'https://www.healthcare.gov/medicaid-chip/'
    if (id === 'chip') return 'https://www.healthcare.gov/medicaid-chip/'
    if (id === 'va-healthcare') return 'https://www.va.gov/health-care/apply-for-health-care-form-10-10ez/introduction'
    return '/en/screener'
  }

  function getProgramCTAText(id: string): string {
    if (id === 'medicaid') return 'Apply for Medicaid'
    if (id === 'aca') return 'See My Plan Options'
    if (id === 'chip') return 'Apply for CHIP'
    if (id === 'va-healthcare') return 'Apply for VA Healthcare'
    return 'Check Eligibility'
  }

  function parseStateFromAddress(address: string): string | null {
    const m = address.match(/\b([A-Z]{2})\s+\d{5}\b/) || address.match(/,\s*([A-Z]{2})\s*(?:\d|$)/)
    return m ? m[1] : null
  }

  function getBestState(): string {
    if (userState) return userState
    if (extractedPatient?.providerState) return extractedPatient.providerState
    if (letterFormAddress) {
      const s = parseStateFromAddress(letterFormAddress)
      if (s) return s
    }
    return 'CA'
  }

  function getProgramDescription(id: string): string {
    const state = getBestState()
    if (id === 'medicaid') return `Free or near-free health coverage through ${state} Medicaid. Hospital visits, prescriptions, and emergency care covered at little to no cost. If you'd had this coverage, your bill would have been covered.`
    if (id === 'aca') return 'Monthly premium subsidies that make marketplace health plans affordable. With a plan, your portion of a bill like this would have been a fraction of what you were charged.'
    if (id === 'chip') return 'Low or no-cost health coverage for children under 19.'
    if (id === 'va-healthcare') return 'Comprehensive federal healthcare through the VA system — at little to no cost to you.'
    return 'Coverage that significantly reduces what you pay out of pocket for hospital visits and procedures.'
  }

  function getBillCTASubheadline(top: ProgramResult | undefined): string {
    if (!top || !incomeNum || !householdSizeNum) {
      return "Many people who receive bills like this qualify for free or subsidized health coverage they don't know about."
    }
    const fpl = getFPLPercent(incomeNum, householdSizeNum)
    const incomeStr = `$${incomeNum.toLocaleString()}/year`
    if (top.id === 'medicaid') {
      return `Your income (${incomeStr}, household of ${householdSizeNum}) puts you at ${fpl}% of the federal poverty level — within Medicaid's eligibility limit. If you'd had coverage, this bill would have been covered at little to no cost.`
    }
    if (top.id === 'aca') {
      return `At ${fpl}% of the federal poverty level (${incomeStr}, household of ${householdSizeNum}), you're in range for ACA marketplace subsidies. A plan would have significantly reduced what you paid for this bill.`
    }
    return `Your income and household size put you in range for health coverage programs that could prevent bills like this in the future.`
  }

  function getBillCTAHeadline(top: ProgramResult | undefined, totalBilled: number): string {
    const billed = `$${totalBilled.toLocaleString()}`
    if (!top) return "Don't get hit with a bill like this again"
    if (insuranceStatus === 'no' || insuranceStatus === '') {
      if (top.id === 'medicaid') return `That ${billed} bill could have been $0`
      if (top.id === 'aca') return `With coverage, a ${billed} bill costs far less`
    }
    if (insuranceStatus === 'yes') return "Your insurance may not be protecting you enough"
    return "Don't get hit with a bill like this again"
  }

  async function handleBillLead() {
    if (!billLeadPhone.trim()) {
      setBillLeadError('Phone number is required.')
      return
    }
    if (!billLeadTcpa) {
      setBillLeadError('You must accept the consent to continue.')
      return
    }
    setBillLeadSubmitting(true)
    setBillLeadError('')
    try {
      const bestState = getBestState()
      await fetch('/api/bill-analyzer-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: billLeadPhone,
          tcpaConsent: true,
          tcpaTimestamp: new Date().toISOString(),
          resultId: resultId ?? undefined,
          firstName,
          email,
          state: bestState,
          income: incomeNum || 0,
          householdSize: householdSizeNum || 1,
          insuranceStatus,
          eligiblePrograms: eligibleProgramsForLead,
        }),
      })
      setBillLeadDone(true)
    } catch {
      setBillLeadError('Something went wrong. Please try again.')
    } finally {
      setBillLeadSubmitting(false)
    }
  }

  // Computed outside render for use in handleBillLead closure — recalculated in letter step too
  const billState = extractedPatient?.providerState ?? getBestState()
  const hasEnoughForEligibilityGlobal = incomeNum > 0 && householdSizeNum > 0
  let eligibleProgramsForLead: string[] = []
  if (hasEnoughForEligibilityGlobal) {
    try {
      const { programs } = checkEligibility({
        state: billState,
        age: 35,
        householdSize: householdSizeNum,
        annualIncome: incomeNum,
        isPregnant: false,
        hasDisability: false,
        isVeteran: false,
        currentlyInsured: insuranceStatus === 'yes',
        insuranceSource: insuranceStatus === 'yes' ? 'employer' : undefined,
        numChildren: 0,
      })
      eligibleProgramsForLead = programs
        .filter(p => p.eligible === true || p.eligible === 'maybe')
        .slice(0, 2)
        .map(p => p.id)
    } catch {
      // ignore
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
              Take a photo or upload a PDF of your medical bill.
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
              <label className={labelStyles}>Hospital / clinic name</label>
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
              {!emailConsent && (
                <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#fefce8', color: '#92400e', border: '1px solid #fde68a' }}>
                  Without this, we won't be able to email your results or dispute letter. You can still copy them from the site.
                </p>
              )}
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

            {/* State */}
            <div>
              <label className={labelStyles}>Your state</label>
              <select
                value={userState}
                onChange={e => setUserState(e.target.value)}
                className={inputStyles}
              >
                <option value="">Select state</option>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
                  About 60% of hospitals and clinics are nonprofits and must offer financial assistance by law. Add your income to check if you qualify.
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
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    )
  }

  // ── ANALYZING ───────────────────────────────────────────────
  if (step === 'analyzing') {
    const analyzeProgress = Math.round(((analyzingStep + 1) / ANALYZING_STEPS.length) * 100)

    return (
      <div className="max-w-2xl mx-auto" style={{ overflowAnchor: 'none' }}>
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
      <div className="max-w-2xl mx-auto space-y-6" style={{ overflowAnchor: 'none' }}>
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
    // Compute inline eligibility using data already collected
    const letterBillState = getBestState()
    const hasEnoughForEligibility = incomeNum > 0 && householdSizeNum > 0
    let eligiblePrograms: ProgramResult[] = []
    if (hasEnoughForEligibility) {
      const { programs } = checkEligibility({
        state: letterBillState,
        age: 35,
        householdSize: householdSizeNum,
        annualIncome: incomeNum,
        isPregnant: false,
        hasDisability: false,
        isVeteran: false,
        currentlyInsured: insuranceStatus === 'yes',
        insuranceSource: insuranceStatus === 'yes' ? 'employer' : undefined,
        numChildren: 0,
      })
      eligiblePrograms = programs.filter(p => p.eligible === true || p.eligible === 'maybe').slice(0, 2)
    }
    const topProgram = eligiblePrograms[0]
    const totalBilled = result?.summary?.totalBilled ?? 0
    const ctaHeadline = getBillCTAHeadline(topProgram, totalBilled)
    const subheadline = getBillCTASubheadline(topProgram)
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
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0"
              style={{ height: '48px', background: 'linear-gradient(transparent, rgba(255,255,255,0.95))' }}
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

        {/* Inline health coverage results */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#99f6e4' }}>
          {/* Dark teal header */}
          <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #134e4a, #0d9488)' }}>
            <p className="text-white font-bold text-lg leading-snug">{ctaHeadline}</p>
            <p className="text-white/80 text-sm mt-2 leading-relaxed">{subheadline}</p>
          </div>

          {eligiblePrograms.length > 0 ? (
            <div className="bg-white">
              {eligiblePrograms.slice(0, 1).map(program => (
                <div key={program.id} className="p-6 sm:p-8" style={{ borderLeft: '4px solid #0d9488' }}>
                  {/* Program header: name + badge + value */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-[var(--text-primary)]">{program.name}</h3>
                      {program.estimatedValue > 0 && (
                        <p className="text-2xl font-bold mt-1" style={{ color: '#16a34a' }}>
                          ${program.estimatedValue.toLocaleString()}
                          <span className="text-sm font-normal text-[var(--text-muted)]">/year</span>
                        </p>
                      )}
                    </div>
                    <span
                      className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full text-white mt-1"
                      style={{ background: program.eligible === true ? 'var(--success)' : '#f59e0b' }}
                    >
                      {program.eligible === true ? 'Likely eligible' : 'May qualify'}
                    </span>
                  </div>

                  {/* ACA: Phone capture + HealthSherpa */}
                  {program.id === 'aca' && (
                    <>
                      {billLeadDone ? (
                        <div className="rounded-xl p-5 text-center" style={{ background: 'var(--success-light)' }}>
                          <p className="font-semibold text-[var(--text-primary)]">You&apos;re all set!</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">A licensed agent will call you shortly to help find the best plan.</p>
                        </div>
                      ) : (
                        <div className="bg-[var(--cream)] rounded-xl p-5">
                          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">Want help choosing a health plan?</h4>
                          <p className="text-sm text-[var(--text-secondary)] mb-4">A licensed agent can compare marketplace plans, apply your subsidies correctly, and handle enrollment for you. 100% free — agents are paid by insurance companies, not you.</p>
                          {/* Trust badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {['100% Free', 'Licensed agents', 'No obligation'].map(b => (
                              <span key={b} className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-light)]">✓ {b}</span>
                            ))}
                          </div>
                          <div className="space-y-3">
                            <input
                              type="tel"
                              value={billLeadPhone}
                              onChange={e => { setBillLeadPhone(e.target.value); setBillLeadError('') }}
                              placeholder="Your phone number"
                              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                            />
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" checked={billLeadTcpa} onChange={e => setBillLeadTcpa(e.target.checked)} className="mt-0.5" />
                              <span className="text-xs text-[var(--text-muted)] leading-relaxed">By checking this box, I agree to be contacted by a licensed insurance agent via phone or text. Consent is not required to purchase insurance.</span>
                            </label>
                            {billLeadError && <p className="text-sm" style={{ color: 'var(--error)' }}>{billLeadError}</p>}
                            <button
                              onClick={handleBillLead}
                              disabled={billLeadSubmitting}
                              className="btn-primary w-full"
                              style={{ opacity: billLeadSubmitting ? 0.7 : 1 }}
                            >
                              {billLeadSubmitting ? 'Submitting...' : 'Get Free Guidance'}
                            </button>
                          </div>
                        </div>
                      )}
                      {/* HealthSherpa secondary */}
                      <div className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-px bg-[var(--border-light)]" />
                          <span className="text-xs text-[var(--text-muted)] font-medium">or</span>
                          <div className="flex-1 h-px bg-[var(--border-light)]" />
                        </div>
                        <a
                          href={`https://www.healthsherpa.com/?_agent_id=dan-hardle&utm_source=coveredusa&utm_medium=bill_analyzer&utm_content=${resultId ?? ''}`}
                          target="_blank" rel="noopener noreferrer"
                          className="cta-btn w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all hover:opacity-90"
                          style={{ borderColor: '#0d9488', color: '#0d9488', background: 'white' }}
                        >
                          Apply Yourself on HealthSherpa
                          <span className="text-xs opacity-70">↗</span>
                        </a>
                      </div>
                    </>
                  )}

                  {/* Medicaid: direct apply button */}
                  {program.id === 'medicaid' && (
                    <a
                      href={getProgramCTAUrl(program.id)}
                      target="_blank" rel="noopener noreferrer"
                      className="cta-btn block w-full text-center py-3.5 px-4 rounded-lg font-semibold text-sm"
                      style={{ backgroundColor: '#0d9488', color: 'white' }}
                    >
                      Apply for Medicaid
                    </a>
                  )}

                  {/* Other programs: apply button */}
                  {program.id !== 'aca' && program.id !== 'medicaid' && (
                    <a
                      href={getProgramCTAUrl(program.id)}
                      target="_blank" rel="noopener noreferrer"
                      className="cta-btn block w-full text-center py-3.5 px-4 rounded-lg font-semibold text-sm"
                      style={{ backgroundColor: '#0d9488', color: 'white' }}
                    >
                      {getProgramCTAText(program.id)}
                    </a>
                  )}
                </div>
              ))}

              {/* See all programs footer */}
              <div className="px-6 py-4 border-t border-[var(--border-light)]" style={{ background: '#f0fdfa' }}>
                <a href={screenerUrl} className="text-sm font-medium" style={{ color: '#0d9488' }}>
                  See all programs you qualify for →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white px-6 py-5">
              <a
                href={screenerUrl}
                className="cta-btn block w-full text-center py-3.5 px-4 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: '#0d9488', color: 'white' }}
              >
                Check What You Qualify For
              </a>
            </div>
          )}
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

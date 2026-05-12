'use client'

import { useState, useRef } from 'react'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'

type Step = 'upload' | 'analyzing' | 'results' | 'letter'

const ANALYZING_STEPS = [
  'Reading your bill...',
  'Extracting line items...',
  'Comparing to Medicare rates...',
  'Checking for billing errors...',
  'Checking charity care eligibility...',
  'Preparing your results...',
]

export default function BillAnalyzer() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [income, setIncome] = useState('')
  const [householdSize, setHouseholdSize] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [analyzingStep, setAnalyzingStep] = useState(0)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterText, setLetterText] = useState('')
  const [patientName, setPatientName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(f: File) {
    setFile(f)
    setError('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  async function handleAnalyze() {
    if (!file) return
    setStep('analyzing')
    setError('')

    // Progress animation
    let stepIdx = 0
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, ANALYZING_STEPS.length - 1)
      setAnalyzingStep(stepIdx)
    }, 3500)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (income) formData.append('income', income)
      if (householdSize) formData.append('householdSize', householdSize)

      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        body: formData,
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStep('upload')
        return
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
      setStep('results')
    } catch {
      clearInterval(interval)
      setError('Network error. Please check your connection and try again.')
      setStep('upload')
    }
  }

  async function handleGetLetter() {
    if (!result) return
    setLetterLoading(true)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: result, patientName }),
      })
      const data = await res.json()
      setLetterText(data.text ?? '')
      setStep('letter')
    } catch {
      setError('Failed to generate letter. Please try again.')
    } finally {
      setLetterLoading(false)
    }
  }

  function downloadLetter() {
    const blob = new Blob([letterText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medical-bill-dispute-letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setStep('upload')
    setFile(null)
    setResult(null)
    setError('')
    setLetterText('')
    setAnalyzingStep(0)
  }

  // ── UPLOAD STEP ──────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="max-w-xl mx-auto">
        <div
          className="card-elevated rounded-2xl p-8 border-2 border-dashed transition-colors cursor-pointer"
          style={{ borderColor: 'var(--border)', background: 'var(--warm-white)' }}
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
            <div className="text-5xl mb-4">📄</div>
            {file ? (
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {file.name}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB — tap to change
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Upload your medical bill
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Drag and drop, tap to browse, or take a photo
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  PDF, JPEG, PNG, or WebP — up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optional income fields */}
        <div className="mt-6 rounded-xl p-5" style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Optional: Add income info to check charity care eligibility
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                Annual household income
              </label>
              <input
                type="number"
                placeholder="$35,000"
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--warm-white)',
                  color: 'var(--text-primary)',
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                Household size
              </label>
              <input
                type="number"
                placeholder="1"
                min="1"
                max="10"
                value={householdSize}
                onChange={e => setHouseholdSize(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--warm-white)',
                  color: 'var(--text-primary)',
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={e => { e.stopPropagation(); handleAnalyze() }}
            disabled={!file}
            className="btn-primary w-full py-4 text-base font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Analyze My Bill — Free
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Your bill is never stored. Analyzed securely and deleted immediately.
          </p>
        </div>
      </div>
    )
  }

  // ── ANALYZING STEP ───────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="inline-block w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-6"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          {ANALYZING_STEPS[analyzingStep]}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Usually takes 15-30 seconds
        </p>
        <div className="mt-8 flex gap-2 justify-center">
          {ANALYZING_STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors duration-500"
              style={{ background: i <= analyzingStep ? 'var(--primary)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── RESULTS STEP ─────────────────────────────────────────────
  if (step === 'results' && result) {
    const savings = result.summary.totalOvercharge
    const hasRates = result.summary.lineItemsWithRates > 0

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary card */}
        <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, var(--primary-deeper), var(--primary-dark))' }}>
          <p className="text-sm opacity-80 mb-1">Analysis complete — {result.provider.name}</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs opacity-70">You were billed</p>
              <p className="text-xl font-bold">${result.summary.totalBilled.toLocaleString()}</p>
            </div>
            {hasRates && (
              <>
                <div>
                  <p className="text-xs opacity-70">Medicare rate</p>
                  <p className="text-xl font-bold">${result.summary.totalMedicareRate.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Potential overcharge</p>
                  <p className="text-xl font-bold text-yellow-300">
                    ${savings.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
          {result.summary.errorsFound > 0 && (
            <div className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.15)' }}>
              {result.summary.errorsFound} billing error{result.summary.errorsFound > 1 ? 's' : ''} detected
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Line-by-Line Breakdown
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {result.lineItems.map((item, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.description}
                    </p>
                    {item.flags.map((flag, fi) => (
                      <p key={fi} className="text-xs mt-1" style={{ color: flag.severity === 'high' ? 'var(--error)' : 'var(--warning)' }}>
                        {flag.severity === 'high' ? '⚠️' : '!'} {flag.explanation}
                      </p>
                    ))}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${item.billedAmount.toLocaleString()}
                    </p>
                    {item.medicareRate != null && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Medicare: ${item.medicareRate.toLocaleString()}
                      </p>
                    )}
                    {item.overchargeAmount != null && item.overchargeAmount > 0 && (
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--error)' }}>
                        +${item.overchargeAmount.toLocaleString()} ({item.overchargePercent}%)
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
          <div className="rounded-2xl p-5" style={{ background: 'var(--success-light)', border: '1px solid #6ee7b7' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#065f46' }}>
              {result.charityCare.eligible
                ? 'You may qualify for free or reduced care'
                : 'This hospital has a charity care program'}
            </p>
            <p className="text-sm mb-3" style={{ color: '#047857' }}>
              {result.charityCare.explanation}
            </p>
            <ul className="space-y-1">
              {result.charityCare.nextSteps.map((step, i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: '#065f46' }}>
                  <span>•</span><span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your name (for the letter)"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 text-sm border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--warm-white)' }}
            />
          </div>
          <button
            onClick={handleGetLetter}
            disabled={letterLoading}
            className="btn-primary w-full py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {letterLoading ? 'Generating letter...' : 'Generate Dispute Letter'}
          </button>
          <a
            href="/en/screener"
            className="btn-secondary w-full py-4 rounded-xl font-semibold text-center block"
            style={{ textDecoration: 'none' }}
          >
            Check What Benefits You Qualify For
          </a>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {result.disclaimer}
        </p>

        <button onClick={reset} className="text-sm underline w-full text-center" style={{ color: 'var(--text-muted)' }}>
          Analyze another bill
        </button>
      </div>
    )
  }

  // ── LETTER STEP ──────────────────────────────────────────────
  if (step === 'letter') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card rounded-2xl p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Dispute Letter
          </h3>
          <div
            className="rounded-xl p-4 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96"
            style={{ background: 'var(--cream)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
          >
            {letterText}
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={downloadLetter}
            className="btn-primary w-full py-4 rounded-xl font-semibold"
          >
            Download Letter
          </button>
          <button
            onClick={() => setStep('results')}
            className="btn-secondary w-full py-3 rounded-xl font-semibold"
          >
            Back to Results
          </button>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          This letter is for informational purposes only and does not constitute legal advice.
          Review carefully before sending. Consider consulting a medical billing advocate for large bills.
        </p>
      </div>
    )
  }

  return null
}

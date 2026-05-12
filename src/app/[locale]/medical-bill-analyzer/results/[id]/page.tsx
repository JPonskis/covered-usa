'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'

export default function ResultsPage() {
  const params = useParams()
  const id = params.id as string

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterText, setLetterText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/results/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 410 ? 'expired' : 'not_found')
        return res.json()
      })
      .then(data => setResult(data))
      .catch(err => {
        setError(
          err.message === 'expired'
            ? 'These results have expired. Results are available for 48 hours after analysis.'
            : 'Results not found. The link may be invalid or expired.'
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleGetLetter() {
    if (!result || letterLoading) return
    setLetterLoading(true)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: result }),
      })
      const data = await res.json()
      if (data.text) setLetterText(data.text)
    } catch {
      // Silently fail
    } finally {
      setLetterLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([letterText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dispute-letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-muted)]">Loading your results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-8">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">Results unavailable</p>
          <p className="text-sm text-[var(--text-muted)] mb-6">{error}</p>
          <a
            href="/en/medical-bill-analyzer"
            className="inline-block py-3 px-6 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: '#0d9488' }}
          >
            Analyze a new bill
          </a>
        </div>
      </div>
    )
  }

  if (!result) return null

  const savings = result.summary.totalOvercharge
  const hasRates = result.summary.lineItemsWithRates > 0

  // Letter view
  if (letterText) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-light)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Your dispute letter</h3>
            <p className="text-sm text-[var(--text-muted)]">Review the letter below, then download or copy it.</p>
          </div>
          <div className="p-6">
            <div className="rounded-lg p-6 text-sm leading-relaxed whitespace-pre-wrap overflow-auto max-h-[32rem]" style={{ background: 'var(--cream)' }}>
              {letterText}
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={handleDownload} className="flex-1 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: '#0d9488' }}>
              Download
            </button>
            <button onClick={handleCopy} className="flex-1 py-3 rounded-lg font-medium border-2" style={{ borderColor: '#0d9488', color: '#0d9488' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <button onClick={() => setLetterText('')} className="text-sm w-full text-center font-medium" style={{ color: 'var(--primary)' }}>
          Back to results
        </button>
      </div>
    )
  }

  // Results view
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <p className="text-xs text-[var(--text-muted)]">Results expire 48 hours after analysis</p>
      </div>

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
          Generate a formal letter to send to the hospital billing department. It cites every overcharge and error found on your bill.
        </p>
        <button
          onClick={handleGetLetter}
          disabled={letterLoading}
          className="w-full py-3.5 px-4 rounded-lg font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#0d9488' }}
        >
          {letterLoading ? 'Generating letter...' : 'Generate Dispute Letter'}
        </button>
      </div>

      {/* Screener cross-sell */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Based on your situation</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Beyond disputing this bill, here's what else may help.</p>
        <a
          href="/en/screener?utm_source=bill_analyzer&utm_medium=results_email"
          className="block bg-[var(--cream)] border border-[var(--border-light)] rounded-lg p-4 transition-all hover:shadow-md"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">Check what health coverage you qualify for</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Free eligibility check. Takes about 3 minutes.</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-[var(--text-muted)]">{result.disclaimer}</p>

      <a href="/en/medical-bill-analyzer" className="text-sm w-full block text-center font-medium" style={{ color: 'var(--primary)' }}>
        Analyze another bill
      </a>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import {
  CharityCareCard,
  LegacyResultNotice,
  LineItemsCard,
  SummaryCard,
  UnbenchmarkedNote,
  WhatThisIsPanel,
  isLegacyResult,
} from '@/components/bill-analyzer/BillResults'

export default function ResultsPage() {
  const params = useParams()
  const id = params.id as string

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [letterLoading, setLetterLoading] = useState(false)
  const [letterText, setLetterText] = useState('')
  const [letterError, setLetterError] = useState('')
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
    setLetterError('')
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: result }),
      })
      const data = await res.json()
      const text = typeof data.text === 'string' ? data.text.trim() : ''
      if (!res.ok || !text) {
        setLetterError(data.error ?? 'We could not generate your letter. Please try again.')
        return
      }
      setLetterText(text)
    } catch {
      setLetterError('We could not generate your letter. Please try again.')
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

  // A result saved before the accuracy fix carries figures we no longer stand
  // behind. Show nothing rather than show the old number.
  if (isLegacyResult(result)) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <LegacyResultNotice />
      </div>
    )
  }


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

      <WhatThisIsPanel />

      <SummaryCard providerName={result.provider.name} summary={result.summary} />

      <UnbenchmarkedNote summary={result.summary} />

      <LineItemsCard lineItems={result.lineItems} />

      <CharityCareCard charityCare={result.charityCare} />

      {/* Generate letter */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Dispute this bill</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          A formal letter to the hospital billing department. It requests an itemized statement and asks them to justify the specific charges worth questioning.
        </p>
        <button
          onClick={handleGetLetter}
          disabled={letterLoading}
          className="w-full py-3.5 px-4 rounded-lg font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#0d9488' }}
        >
          {letterLoading ? 'Generating letter...' : 'Generate Dispute Letter'}
        </button>
        {letterError && (
          <p className="text-sm mt-3" style={{ color: 'var(--error)' }}>
            {letterError}
          </p>
        )}
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

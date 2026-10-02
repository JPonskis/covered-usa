'use client'

import type {
  AnalysisResult,
  AnalysisSummary,
  AnalyzedLineItem,
  CharityCareResult,
} from '@/lib/bill-analyzer/types'
import { basisLabel } from '@/lib/bill-analyzer/types'
import {
  WHAT_THIS_IS,
  coverageSentence,
  headlineExplanation,
  headlineLabel,
  headlineRange,
  money,
  unbenchmarkedSentence,
} from '@/lib/bill-analyzer/headline'

/**
 * One set of result blocks, shared by the embedded analyzer and the standalone
 * results page. They used to be two near-identical copies, which is how one
 * surface ends up making a more confident claim than the other.
 */

/** Results saved before the accuracy fix carry a figure we no longer stand behind. */
export function isLegacyResult(result: AnalysisResult): boolean {
  return result.summary?.coverageLevel == null
}

export function LegacyResultNotice() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#fefce8', border: '1px solid #fde68a' }}
    >
      <p className="font-semibold text-sm mb-1" style={{ color: '#92400e' }}>
        This saved result is out of date
      </p>
      <p className="text-sm" style={{ color: '#92400e' }}>
        We corrected how the analyzer calculates the amount above the Medicare
        rate. This result was produced with the old calculation, so we are not
        showing its figures. Please analyze your bill again — it takes under a
        minute.
      </p>
      <a
        href="/en/medical-bill-analyzer"
        className="inline-block mt-3 py-2 px-4 rounded-lg font-medium text-white text-sm"
        style={{ backgroundColor: '#0d9488' }}
      >
        Analyze my bill again
      </a>
    </div>
  )
}

export function WhatThisIsPanel() {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-[var(--text-primary)]">
        What this is
      </p>
      <p className="text-sm text-[var(--text-secondary)]">{WHAT_THIS_IS}</p>
    </div>
  )
}

export function SummaryCard({
  providerName,
  summary,
}: {
  providerName: string
  summary: AnalysisSummary
}) {
  const range = headlineRange(summary)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
      <div
        className="px-6 py-5"
        style={{ background: 'linear-gradient(135deg, var(--primary-deeper), var(--primary-dark))' }}
      >
        <p className="text-sm text-white/70 mb-1">Analysis Complete</p>
        <p className="text-lg font-semibold text-white">{providerName}</p>
      </div>
      <div className="bg-white px-6 py-5">
        <div className={`grid ${range ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Total billed
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {money(summary.totalBilled)}
            </p>
          </div>
          {range && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
                Medicare rate, {summary.lineItemsWithRates} priced charge
                {summary.lineItemsWithRates === 1 ? '' : 's'}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {money(summary.totalMedicareRate)}
              </p>
            </div>
          )}
        </div>

        {range ? (
          <div
            className="mt-5 rounded-lg p-4"
            style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
          >
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              {headlineLabel(summary)}
            </p>
            <p className="text-2xl font-bold" style={{ color: '#b45309' }}>
              {range}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {headlineExplanation(summary)}
            </p>
          </div>
        ) : (
          <div
            className="mt-5 rounded-lg p-4"
            style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}
          >
            <p className="text-sm text-[var(--text-secondary)]">
              {headlineExplanation(summary)}
            </p>
          </div>
        )}

        <p className="text-xs text-[var(--text-muted)] mt-3">
          {coverageSentence(summary)} {basisLabel(summary)}
        </p>

        {summary.coverageLevel === 'low' && (
          <div
            className="mt-3 px-4 py-3 rounded-lg text-sm"
            style={{ background: '#fefce8', color: '#92400e' }}
          >
            We priced under half of this bill, so the figure above covers only a
            slice of it. Read the unpriced charges below before you draw a
            conclusion about the whole bill.
          </div>
        )}

        {summary.errorsFound > 0 && (
          <div
            className="mt-3 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}
          >
            {summary.errorsFound} charge{summary.errorsFound > 1 ? 's' : ''} worth
            asking about
          </div>
        )}
      </div>
    </div>
  )
}

export function UnbenchmarkedNote({ summary }: { summary: AnalysisSummary }) {
  const sentence = unbenchmarkedSentence(summary)
  if (!sentence) return null

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'white', border: '1px solid var(--border-light)' }}
    >
      <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
        Charges we could not price
      </p>
      <p className="text-sm text-[var(--text-secondary)]">{sentence}</p>
      <div className="mt-3 pt-3 border-t border-[var(--border-light)] text-sm text-[var(--text-secondary)] space-y-1">
        <div className="flex justify-between">
          <span>Priced charges</span>
          <span className="font-medium text-[var(--text-primary)]">
            {money(summary.totalBenchmarkedBilled)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Unpriced charges</span>
          <span className="font-medium text-[var(--text-primary)]">
            {money(summary.totalUnbenchmarked)}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-[var(--border-light)]">
          <span className="font-medium text-[var(--text-primary)]">Total billed</span>
          <span className="font-bold text-[var(--text-primary)]">
            {money(summary.totalBilled)}
          </span>
        </div>
      </div>
    </div>
  )
}

function LineItemRow({ item }: { item: AnalyzedLineItem }) {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {item.description}
            {item.quantity > 1 && (
              <span className="text-[var(--text-muted)] font-normal">
                {' '}
                &times;{item.quantity}
              </span>
            )}
          </p>
          {item.flags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {item.flags.map((flag, fi) => (
                <span
                  key={fi}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: 'var(--warning-light)',
                    color: 'var(--warning)',
                  }}
                >
                  {flag.explanation}
                </span>
              ))}
            </div>
          )}
          {item.benchmarkConfidence === 'estimated' && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              We matched this to a billing code ourselves — the bill did not print
              one. Verify it before relying on the comparison.
            </p>
          )}
          {item.unbenchmarkedReason && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {item.unbenchmarkedReason}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {money(item.billedAmount)}
          </p>
          {item.medicareRate != null ? (
            <>
              <p className="text-xs mt-1 text-[var(--text-muted)]">
                Medicare: {money(item.medicareRate)}
              </p>
              {item.overchargeAmount != null && item.overchargeAmount > 0 && (
                <p className="text-xs font-medium mt-1" style={{ color: '#b45309' }}>
                  +{money(item.overchargeAmount)} ({item.overchargePercent}% over)
                </p>
              )}
            </>
          ) : (
            <p className="text-xs mt-1 text-[var(--text-muted)]">No benchmark</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function LineItemsCard({ lineItems }: { lineItems: AnalyzedLineItem[] }) {
  const priced = lineItems.filter(i => i.medicareRate != null)
  const unpriced = lineItems.filter(i => i.medicareRate == null)

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-light)]">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Line-by-line breakdown
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Priced charges are compared to the Medicare physician rate. The rest we
          could not price.
        </p>
      </div>

      {priced.length > 0 && (
        <>
          <div className="px-6 py-2 bg-[var(--cream)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Compared to Medicare ({priced.length})
            </p>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {priced.map((item, i) => (
              <LineItemRow key={`p-${i}`} item={item} />
            ))}
          </div>
        </>
      )}

      {unpriced.length > 0 && (
        <>
          <div className="px-6 py-2 bg-[var(--cream)] border-t border-[var(--border-light)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              No benchmark available ({unpriced.length})
            </p>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {unpriced.map((item, i) => (
              <LineItemRow key={`u-${i}`} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function CharityCareCard({ charityCare }: { charityCare: CharityCareResult }) {
  const likely = charityCare.eligibility === 'likely'
  const accent = likely ? 'var(--success)' : 'var(--primary)'

  const heading = likely
    ? 'You likely qualify for free or reduced care'
    : charityCare.nonprofitStatus === 'nonprofit'
      ? 'This hospital is required to have a financial assistance policy'
      : charityCare.nonprofitStatus === 'unknown'
        ? 'Check whether this hospital owes you financial assistance'
        : 'Ask about hardship assistance and discounts'

  return (
    <div className="bg-white border border-[var(--border-light)] rounded-xl shadow-sm overflow-hidden">
      <div className="border-l-4 p-5" style={{ borderLeftColor: accent }}>
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: accent }}
          >
            {likely ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 17v.01M12 7v6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
              {heading}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {charityCare.explanation}
            </p>
            <div className="bg-[var(--cream)] rounded-lg p-4">
              <p className="text-xs font-medium text-[var(--text-primary)] mb-2 uppercase tracking-wide">
                Next steps
              </p>
              <ul className="space-y-1.5">
                {charityCare.nextSteps.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--text-secondary)] flex gap-2"
                  >
                    <span className="font-bold shrink-0" style={{ color: accent }}>
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

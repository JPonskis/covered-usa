import type { Metadata } from 'next'
import BillAnalyzer from '@/components/BillAnalyzer'

export const metadata: Metadata = {
  title: 'Analyze Your Medical Bill | CoveredUSA',
  description: 'Upload your medical bill and find out if you were overcharged.',
  robots: { index: false, follow: false },
}

export default function AnalyzePage() {
  return (
    <main className="min-h-screen py-10 px-4" style={{ background: 'var(--warm-white)' }}>
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Analyzing your bill
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Free. No signup. Your bill is never stored.
        </p>
      </div>
      <BillAnalyzer mode="standalone" />
    </main>
  )
}

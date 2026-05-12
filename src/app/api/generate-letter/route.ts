import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, patientName, patientAddress } = body as {
      analysis: AnalysisResult
      patientName?: string
      patientAddress?: string
    }

    if (!analysis) {
      return NextResponse.json({ error: 'No analysis data provided' }, { status: 400 })
    }

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const flaggedItems = analysis.lineItems.filter(
      item => item.flags.length > 0 || (item.overchargeAmount && item.overchargeAmount > 100)
    )

    const prompt = `Write a formal medical billing dispute letter. Be professional and firm. Cite specific findings.

Patient: ${patientName ?? '[Patient Name]'}
Address: ${patientAddress ?? '[Patient Address]'}
Date: ${today}
Provider: ${analysis.provider.name}

Key findings:
- Total billed: $${analysis.summary.totalBilled.toLocaleString()}
- Medicare benchmark: $${analysis.summary.totalMedicareRate.toLocaleString()}
- Potential overcharge: $${analysis.summary.totalOvercharge.toLocaleString()} (${analysis.summary.overchargePercent}% above Medicare rates)
- Billing errors found: ${analysis.summary.errorsFound}

Flagged line items:
${flaggedItems
  .slice(0, 8)
  .map(
    item =>
      `- ${item.description}: billed $${item.billedAmount}, Medicare rate $${item.medicareRate ?? 'unknown'}${item.flags.length ? ` [${item.flags.map(f => f.type).join(', ')}]` : ''}`
  )
  .join('\n')}

Charity care: ${analysis.charityCare.eligible ? 'Patient may qualify for financial assistance under 501(r)' : 'N/A'}
${analysis.provider.isNonprofit ? 'Provider is a nonprofit hospital subject to 501(r) requirements.' : ''}

Write a formal dispute letter that:
1. Requests an itemized statement of charges
2. Cites the specific overcharges found with Medicare benchmarks
3. Flags duplicate or bundling errors if found
4. Invokes 501(r) financial assistance rights if the hospital is nonprofit
5. References the Hospital Price Transparency Rule (CMS)
6. Requests a written response within 30 days
7. States the patient is disputing the bill and requests a corrected statement

End with: "This letter is for informational purposes only and does not constitute legal advice."

Write the full letter text only. No additional commentary.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const letterText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      text: letterText,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Letter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate dispute letter. Please try again.' },
      { status: 500 }
    )
  }
}

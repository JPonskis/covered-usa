import { NextRequest, NextResponse } from 'next/server'
import { llm, LETTER_PRIMARY, LETTER_FALLBACK } from '@/lib/llm'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'

export const maxDuration = 30

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold**
    .replace(/\*([^*\n]+)\*/g, '$1')      // *italic*
    .replace(/_{2}([^_]+)_{2}/g, '$1')   // __bold__
    .replace(/_([^_\n]+)_/g, '$1')        // _italic_
    .replace(/^#{1,6}\s+/gm, '')          // # headings
    .replace(/^[-*+]\s+/gm, '  ')        // bullet points → indent
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, patientName, patientAddress, accountNumber } = body as {
      analysis: AnalysisResult
      patientName?: string
      patientAddress?: string
      accountNumber?: string
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

IMPORTANT FORMATTING RULES:
- Output plain text ONLY. No markdown. No asterisks, no pound signs, no bullet dashes.
- Use numbered lists (1. 2. 3.) not dashes or asterisks.
- Do not bold or italicize anything.
- Write it exactly as it would appear in a printed letter.

Patient: ${patientName ?? '[Patient Name]'}
Address: ${patientAddress ?? '[Patient Address]'}
${accountNumber ? `Account Number: ${accountNumber}` : ''}
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

    const raw = await llm(LETTER_PRIMARY, LETTER_FALLBACK, {
      prompt,
      maxTokens: 1500,
    })

    const letterText = stripMarkdown(raw)

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

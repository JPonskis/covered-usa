import { NextRequest, NextResponse } from 'next/server'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import { buildDisputeLetter } from '@/lib/bill-analyzer/letter'
import {
  buildAllowedFigures,
  scrubOutbound,
} from '@/lib/bill-analyzer/outbound-guard'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, patientName, patientAddress, accountNumber, dateOfService } =
      body as {
        analysis: AnalysisResult
        patientName?: string
        patientAddress?: string
        accountNumber?: string
        dateOfService?: string
      }

    if (!analysis) {
      return NextResponse.json({ error: 'No analysis data provided' }, { status: 400 })
    }

    const letterText = buildDisputeLetter({
      analysis,
      patientName,
      patientAddress,
      accountNumber,
      dateOfService,
    })

    // Nothing with an untraceable dollar figure goes in the mail.
    const { ok, violations } = scrubOutbound(
      letterText,
      buildAllowedFigures(analysis)
    )
    if (!ok) {
      console.error('Dispute letter blocked — untraceable figures:', violations)
      return NextResponse.json(
        {
          error:
            'We could not generate a letter we can stand behind for this bill. Please try again, or email us and we will look at it.',
        },
        { status: 500 }
      )
    }

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

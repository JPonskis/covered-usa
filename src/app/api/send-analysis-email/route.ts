import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { jsPDF } from 'jspdf'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import {
  buildBillAnalysisSubject,
  buildBillAnalysisHtml,
} from '@/emails/BillAnalysisEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export const maxDuration = 15

function generateLetterPdf(letterText: string, patientName?: string): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 60
  const usableWidth = pageWidth - margin * 2
  const lineHeight = 16
  let y = margin

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  const lines = doc.splitTextToSize(letterText, usableWidth) as string[]

  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += lineHeight
  }

  // Return as Buffer (Node.js)
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, analysis, letterText } = body as {
      email: string
      firstName?: string
      analysis: AnalysisResult
      letterText?: string
    }

    if (!email || !analysis) {
      return NextResponse.json(
        { error: 'Email and analysis data are required' },
        { status: 400 }
      )
    }

    const subject = buildBillAnalysisSubject(firstName, analysis.provider.name)
    const html = buildBillAnalysisHtml({
      firstName,
      analysis,
      letterGenerated: !!letterText,
    })

    // Build attachments array
    const attachments: Array<{ filename: string; content: Buffer }> = []

    if (letterText) {
      const pdfBuffer = generateLetterPdf(letterText, firstName)
      attachments.push({
        filename: 'medical-bill-dispute-letter.pdf',
        content: pdfBuffer,
      })
    }

    const { error } = await resend.emails.send({
      from: 'Jacob from CoveredUSA <jacob@coveredusa.org>',
      replyTo: 'jacob@coveredusa.org',
      to: email,
      subject,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send analysis email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { jsPDF } from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import {
  buildBillAnalysisSubject,
  buildBillAnalysisHtml,
} from '@/emails/BillAnalysisEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export const maxDuration = 15

function generateLetterPdf(letterText: string): Buffer {
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

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

function generateLetterDocx(letterText: string): Promise<Buffer> {
  const paragraphs = letterText.split('\n').map(line => {
    // Detect headings (all caps lines like "SUMMARY OF FINDINGS")
    const isHeading = line === line.toUpperCase() && line.trim().length > 3 && /[A-Z]/.test(line)

    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          font: 'Calibri',
          size: isHeading ? 24 : 22, // half-points: 12pt / 11pt
          bold: isHeading,
        }),
      ],
      spacing: { after: line.trim() === '' ? 200 : 80 },
    })
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch in twips
          },
        },
        children: paragraphs,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, resultId, analysis, letterText } = body as {
      email: string
      firstName?: string
      resultId?: string
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
      resultId,
    })

    // Build attachments: PDF + DOCX
    const attachments: Array<{ filename: string; content: Buffer }> = []

    if (letterText) {
      const pdfBuffer = generateLetterPdf(letterText)
      attachments.push({
        filename: 'medical-bill-dispute-letter.pdf',
        content: pdfBuffer,
      })

      const docxBuffer = await generateLetterDocx(letterText)
      attachments.push({
        filename: 'medical-bill-dispute-letter.docx',
        content: docxBuffer,
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

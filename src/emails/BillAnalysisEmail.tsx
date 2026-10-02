// CoveredUSA Bill Analysis Email — sent after dispute letter is generated
import type { AnalysisResult } from '@/lib/bill-analyzer/types'
import { basisLabel } from '@/lib/bill-analyzer/types'
import {
  coverageSentence,
  headlineLabel,
  headlineRange,
  money,
  unbenchmarkedSentence,
} from '@/lib/bill-analyzer/headline'

interface BillAnalysisEmailProps {
  firstName?: string
  analysis: AnalysisResult
  letterGenerated: boolean
  resultId?: string
}

function formatMoney(amount: number): string {
  return money(amount)
}

export function buildBillAnalysisSubject(
  firstName: string | undefined,
  providerName: string
): string {
  const name = firstName ? `${firstName}, your` : 'Your'
  return `${name} bill analysis for ${providerName} is ready`
}

export function buildBillAnalysisHtml(props: BillAnalysisEmailProps): string {
  const { firstName, analysis, letterGenerated, resultId } = props
  const { summary, provider, lineItems, charityCare } = analysis

  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

  // Coverage-aware framing. When we priced nothing, the email says so — it does
  // not fall back to a whole-bill figure dressed up as savings.
  const range = headlineRange(summary)
  const preheader = range
    ? `On the ${summary.lineItemsWithRates} charge${summary.lineItemsWithRates === 1 ? '' : 's'} we could price, your ${provider.name} bill runs about ${range} above the Medicare rate.`
    : `Your ${provider.name} bill analysis is ready — here is what to ask them.`

  // Build flagged line items rows
  const flaggedItems = lineItems.filter(
    item => item.flags.length > 0 || (item.overchargeAmount && item.overchargeAmount > 100)
  )
  const topItems = flaggedItems.slice(0, 5)

  const lineItemRows = topItems
    .map(
      item => `
                <tr>
                  <td style="padding: 10px 8px 10px 0; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                    ${item.description}
                    ${item.flags.length > 0 ? `<br><span style="font-size: 12px; color: #b45309; font-weight: 600;">${item.flags.map(f => f.type === 'duplicate' ? 'Appears more than once — ask them to confirm' : f.type === 'overcoding' ? 'Far above the Medicare rate — ask them to justify' : f.explanation).join('; ')}</span>` : ''}
                    ${item.benchmarkConfidence === 'estimated' ? `<br><span style="font-size: 12px; color: #78716c;">Estimated code match — verify this one</span>` : ''}
                  </td>
                  <td style="padding: 10px 8px 10px 12px; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif; text-align: right; white-space: nowrap; font-weight: 600;">
                    ${formatMoney(item.billedAmount)}
                  </td>
                  <td style="padding: 10px 0 10px 12px; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; white-space: nowrap;">
                    ${item.medicareRate != null ? formatMoney(item.medicareRate) : 'No benchmark'}
                  </td>
                </tr>`
    )
    .join('')

  const remainingCount = flaggedItems.length - topItems.length
  const remainingRow =
    remainingCount > 0
      ? `<tr><td colspan="3" style="padding: 10px 0; font-size: 13px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">+ ${remainingCount} more flagged item${remainingCount > 1 ? 's' : ''}</td></tr>`
      : ''

  // Charity care — three states, and a lookup miss is never reported as for-profit.
  const charityHeading =
    charityCare.eligibility === 'likely'
      ? 'You likely qualify for financial assistance'
      : charityCare.nonprofitStatus === 'nonprofit'
        ? 'This hospital must have a financial assistance policy'
        : charityCare.nonprofitStatus === 'unknown'
          ? 'Check whether this hospital owes you financial assistance'
          : 'Ask about hardship assistance'

  const charityCareHtml = `
              <tr>
                <td style="padding: 24px 36px 0 36px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #166534; font-family: Georgia, 'Times New Roman', serif;">${charityHeading}</p>
                        <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 20px; color: #166534; font-family: Georgia, 'Times New Roman', serif;">
                          ${charityCare.explanation}
                        </p>
                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #166534; font-family: Georgia, 'Times New Roman', serif;">
                          ${charityCare.nextSteps.slice(0, 2).map((s, i) => `${i + 1}. ${s}`).join('<br>')}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`

  // "What to do next" steps
  function stepHtml(num: number, title: string, desc: string, first = false) {
    return `<tr>
                <td style="padding: ${first ? '0' : '18px'} 0 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="width: 28px; vertical-align: top; padding-top: 1px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #0d9488; color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; line-height: 24px; font-family: Georgia, 'Times New Roman', serif;">${num}</div>
                      </td>
                      <td style="padding-left: 12px; vertical-align: top;">
                        <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">${title}</p>
                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">${desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
  }

  const step3Html =
    charityCare.nonprofitStatus === 'nonprofit'
      ? stepHtml(3, 'Ask for a financial assistance application', `Ask ${provider.name} for their financial assistance policy and application. You will need proof of income. Send it with your dispute — they cannot send you to collections while it is pending.`)
      : charityCare.nonprofitStatus === 'unknown'
        ? stepHtml(3, 'Find out if they owe you financial assistance', `Search ${provider.name}'s website for "financial assistance policy". Nonprofit hospitals are required by federal law to publish one, and to cap what they charge patients who qualify.`)
        : ''

  const nextStepsHtml = letterGenerated
    ? `
          <tr>
            <td style="padding: 28px 36px 0 36px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">What to do next</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${stepHtml(1, 'Call the billing department', "Call the number on your bill and tell them you are requesting an itemized statement. Ask for the billing department's email or fax number so you can send your letter.", true)}
              ${stepHtml(2, 'Send your letter', 'Your letter is attached as a PDF and an editable Word document. Email or mail it to the billing department. Keep a copy for your records.')}
              ${step3Html}
              </table>
            </td>
          </tr>`
    : ''

  // Intro paragraph — letter mention is folded in here, not as a separate block
  const letterMention = letterGenerated
    ? ` Your letter is attached — both a PDF and an editable Word doc.`
    : ''

  const leadParagraph = range
    ? `We looked at your bill from <strong style="color: #1C1A16;">${provider.name}</strong>. ${coverageSentence(summary)} Those charges run about <strong style="color: #b45309;">${range}</strong> above the Medicare physician rate${summary.errorsFound > 0 ? `, and ${summary.errorsFound} charge${summary.errorsFound > 1 ? 's are' : ' is'} worth asking about` : ''}. Medicare is a reference floor, not a fair price and not what you owe, so treat this as a starting point for questions.${letterMention}`
    : `We looked at your bill from <strong style="color: #1C1A16;">${provider.name}</strong>. ${coverageSentence(summary)} That does not mean the charges are correct — it means the services on this bill are paid under fee schedules we have not loaded yet, so we have no rate to compare them to. What we can do is help you make them show their work.${letterMention}`

  const summaryCardHtml = range
    ? `
          <!-- Summary card — 2-col top (Billed | Medicare) + full-width bottom (range) -->
          <tr>
            <td style="padding: 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #134e4a; border-radius: 8px;">
                <tr>
                  <td style="width: 50%; padding: 20px 12px 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); border-right: 1px solid rgba(255,255,255,0.15); vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); font-family: Georgia, 'Times New Roman', serif;">Total billed</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalBilled)}</p>
                  </td>
                  <td style="width: 50%; padding: 20px 20px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.15); vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); font-family: Georgia, 'Times New Roman', serif;">Medicare rate, ${summary.lineItemsWithRates} priced charge${summary.lineItemsWithRates === 1 ? '' : 's'}</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalMedicareRate)}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 16px 20px 20px 20px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); font-family: Georgia, 'Times New Roman', serif;">${headlineLabel(summary)}</p>
                    <p style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; color: #fcd34d; font-family: Georgia, 'Times New Roman', serif;">${range}</p>
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: rgba(255,255,255,0.7); font-family: Georgia, 'Times New Roman', serif;">${coverageSentence(summary)} ${basisLabel(summary)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : `
          <tr>
            <td style="padding: 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #134e4a; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); font-family: Georgia, 'Times New Roman', serif;">Total billed</p>
                    <p style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalBilled)}</p>
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: rgba(255,255,255,0.7); font-family: Georgia, 'Times New Roman', serif;">${coverageSentence(summary)} ${basisLabel(summary)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

  const unpriced = unbenchmarkedSentence(summary)
  const unbenchmarkedHtml = unpriced
    ? `
          <tr>
            <td style="padding: 20px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFCF9; border-radius: 8px; border: 1px solid #d6cfc5;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">${unpriced}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Bill Analysis Results</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Georgia, 'Times New Roman', serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #FFFCF9; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    ${'&nbsp;&zwnj;'.repeat(30)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FFFCF9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #d6cfc5;">

          <!-- Logo -->
          <tr>
            <td style="padding: 32px 36px 0 36px;">
              <a href="https://coveredusa.org" style="text-decoration: none;">
                <img src="https://coveredusa.org/logo-email.png" alt="CoveredUSA" width="160" style="width: 160px; height: auto; border: 0;" />
              </a>
            </td>
          </tr>

          <!-- Greeting + intro (letter mention folded in) -->
          <tr>
            <td style="padding: 24px 36px 20px 36px;">
              <p style="margin: 0 0 14px 0; font-size: 17px; line-height: 28px; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">${greeting}</p>
              <p style="margin: 0; font-size: 16px; line-height: 26px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                ${leadParagraph}
              </p>
            </td>
          </tr>

          ${summaryCardHtml}
          ${unbenchmarkedHtml}

          <!-- Flagged line items -->
          ${topItems.length > 0 ? `
          <tr>
            <td style="padding: 28px 36px 0 36px;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">Charges worth asking about</p>
              <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 19px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">Questions to raise, not findings of error.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 6px 8px 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; border-bottom: 1px solid #d6cfc5;">Item</td>
                  <td style="padding: 6px 8px 6px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; border-bottom: 1px solid #d6cfc5; white-space: nowrap;">Billed</td>
                  <td style="padding: 6px 0 6px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; border-bottom: 1px solid #d6cfc5; white-space: nowrap;">Medicare</td>
                </tr>
                ${lineItemRows}
                ${remainingRow}
              </table>
            </td>
          </tr>` : ''}

          ${charityCareHtml}
          ${nextStepsHtml}

          <!-- CTA -->
          <tr>
            <td style="padding: 28px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; background-color: #0d9488; text-align: center;">
                    <a href="https://coveredusa.org/en/medical-bill-analyzer${resultId ? `/results/${resultId}` : ''}" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">View Full Results</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Screener cross-sell -->
          <tr>
            <td style="padding: 12px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; border: 2px solid #0d9488; text-align: center;">
                    <a href="https://coveredusa.org/en/screener" target="_blank" style="display: block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #0d9488; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">Check Your Health Coverage Eligibility</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 28px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="border-top: 1px solid #d6cfc5; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Sign off -->
          <tr>
            <td style="padding: 20px 36px 32px 36px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 23px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">Questions? Just reply to this email.</p>
              <p style="margin: 0 0 2px 0; font-size: 15px; line-height: 22px; color: #1C1A16; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">Jacob Posner</p>
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">Founder, CoveredUSA</p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 20px 36px 0 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">
                You received this because you used the bill analyzer at
                <a href="https://coveredusa.org" style="color: #78716c; text-decoration: underline;">coveredusa.org</a>
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #a8a29e; font-family: Georgia, 'Times New Roman', serif;">
                CoveredUSA.org &middot; Los Angeles, CA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// CoveredUSA Bill Analysis Email — sent after dispute letter is generated
import type { AnalysisResult } from '@/lib/bill-analyzer/types'

interface BillAnalysisEmailProps {
  firstName?: string
  analysis: AnalysisResult
  letterGenerated: boolean
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function buildBillAnalysisSubject(
  firstName: string | undefined,
  providerName: string
): string {
  const name = firstName ? `${firstName}, your` : 'Your'
  return `${name} bill analysis for ${providerName} is ready`
}

export function buildBillAnalysisHtml(props: BillAnalysisEmailProps): string {
  const { firstName, analysis, letterGenerated } = props
  const { summary, provider, lineItems, charityCare } = analysis

  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  const preheader = `We found ${formatMoney(summary.totalOvercharge)} in potential savings on your ${provider.name} bill.`

  // Build flagged line items rows
  const flaggedItems = lineItems.filter(
    item => item.flags.length > 0 || (item.overchargeAmount && item.overchargeAmount > 100)
  )
  const topItems = flaggedItems.slice(0, 5)

  const lineItemRows = topItems
    .map(
      item => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                    ${item.description}
                    ${item.flags.length > 0 ? `<br><span style="font-size: 12px; color: #dc2626; font-weight: 600;">${item.flags.map(f => f.type === 'duplicate' ? 'Duplicate charge' : f.type === 'unbundled' ? 'Unbundled procedure' : f.type === 'upcoding' ? 'Possible upcoding' : f.type === 'overcoding' ? 'Overcoding' : f.explanation).join(', ')}</span>` : ''}
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif; text-align: right; white-space: nowrap; font-weight: 600;">
                    ${formatMoney(item.billedAmount)}
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #d6cfc5; font-size: 14px; line-height: 20px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; white-space: nowrap;">
                    ${item.medicareRate ? formatMoney(item.medicareRate) : 'N/A'}
                  </td>
                </tr>`
    )
    .join('')

  const remainingCount = flaggedItems.length - topItems.length
  const remainingRow =
    remainingCount > 0
      ? `<tr><td colspan="3" style="padding: 10px 0; font-size: 13px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">+ ${remainingCount} more flagged item${remainingCount > 1 ? 's' : ''}</td></tr>`
      : ''

  // Charity care section
  const charityCareHtml = charityCare.eligible
    ? `
              <tr>
                <td style="padding: 20px 36px 0 36px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <tr>
                      <td style="padding: 16px;">
                        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #166534; font-family: Georgia, 'Times New Roman', serif;">You may qualify for financial assistance</p>
                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #166534; font-family: Georgia, 'Times New Roman', serif;">
                          ${provider.name} is a nonprofit hospital. Under federal law, they are required to offer financial assistance to patients who qualify. ${charityCare.fplPercent ? `Based on your income, you are at ${charityCare.fplPercent}% of the federal poverty level.` : ''} Contact the hospital's billing department and ask about their Financial Assistance Policy.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
    : ''

  // Letter attachment note
  const letterNote = letterGenerated
    ? `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                Your dispute letter is attached as a PDF. Print it or forward it to the hospital's billing department. You have the legal right to dispute any charges you believe are incorrect.
              </p>`
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

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 36px 0 36px;">
              <p style="margin: 0; font-size: 17px; line-height: 28px; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">${greeting}</p>
            </td>
          </tr>

          <!-- Main message -->
          <tr>
            <td style="padding: 16px 36px 0 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                We analyzed your bill from <strong style="color: #1C1A16;">${provider.name}</strong> and found <strong style="color: #dc2626;">${formatMoney(summary.totalOvercharge)}</strong> in potential savings. ${summary.errorsFound > 0 ? `We also flagged ${summary.errorsFound} billing error${summary.errorsFound > 1 ? 's' : ''}.` : ''}
              </p>
              ${letterNote}
            </td>
          </tr>

          <!-- Summary card -->
          <tr>
            <td style="padding: 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #134e4a; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width: 33%; vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.7); font-family: Georgia, 'Times New Roman', serif;">Total billed</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalBilled)}</p>
                        </td>
                        <td style="width: 33%; vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.7); font-family: Georgia, 'Times New Roman', serif;">Federal rate</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalMedicareRate)}</p>
                        </td>
                        <td style="width: 33%; vertical-align: top;">
                          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.7); font-family: Georgia, 'Times New Roman', serif;">Potential savings</p>
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #fca5a5; font-family: Georgia, 'Times New Roman', serif;">${formatMoney(summary.totalOvercharge)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Flagged line items -->
          ${topItems.length > 0 ? `
          <tr>
            <td style="padding: 20px 36px 0 36px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #1C1A16; font-family: Georgia, 'Times New Roman', serif;">Flagged charges</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; border-bottom: 1px solid #d6cfc5;">Item</td>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; border-bottom: 1px solid #d6cfc5;">Billed</td>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; font-family: Georgia, 'Times New Roman', serif; text-align: right; border-bottom: 1px solid #d6cfc5;">Federal</td>
                </tr>
                ${lineItemRows}
                ${remainingRow}
              </table>
            </td>
          </tr>` : ''}

          ${charityCareHtml}

          <!-- CTA -->
          <tr>
            <td style="padding: 24px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; background-color: #0d9488; text-align: center;">
                    <a href="https://coveredusa.org/en/medical-bill-analyzer" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">View Full Results</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Screener cross-sell -->
          <tr>
            <td style="padding: 14px 36px 0 36px;">
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

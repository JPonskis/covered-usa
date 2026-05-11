// CoveredUSA Day 3 Follow-up — sent only if user hasn't submitted phone number.
// This is the last email we send.
import { buildUnsubscribeUrl } from '@/app/api/unsubscribe/route';

interface Day3EmailProps {
  firstName?: string;
  submissionId: string;
  primaryProgramName: string;
  primaryProgramId: string;
  estimatedValue: number;
  resultsUrl: string;
  healthsherpaUrl?: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildDay3Subject(firstName: string | undefined): string {
  return firstName
    ? `${firstName}, still need health coverage?`
    : `Still looking for health coverage?`;
}

export function buildDay3Html(props: Day3EmailProps): string {
  const { firstName, submissionId, primaryProgramName, primaryProgramId, estimatedValue, resultsUrl, healthsherpaUrl } = props;

  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const valueText = estimatedValue > 0 ? ` (${formatMoney(estimatedValue)}/year)` : '';
  const preheader = `Your CoveredUSA results are still available. This is our last email.`;
  const unsubscribeUrl = buildUnsubscribeUrl(submissionId);

  const isACA = primaryProgramId === 'aca';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Still need coverage?</title>
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
                <img src="https://coveredusa.org/logo.png" alt="CoveredUSA" width="160" style="width: 160px; height: auto; border: 0;" />
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
                Three days ago you found out you may qualify for <strong style="color: #1C1A16;">${primaryProgramName}</strong>${valueText}.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #44403c; font-family: Georgia, 'Times New Roman', serif;">
                Your results are still available. If you haven't applied yet, now is a good time. Open enrollment periods don't last forever.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">
                This is our last email. We won't follow up again.
              </p>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; background-color: #0d9488; text-align: center;">
                    <a href="${resultsUrl}" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">See Your Coverage Options</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${isACA && healthsherpaUrl ? `
          <!-- Secondary CTA for ACA -->
          <tr>
            <td style="padding: 14px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; border: 2px solid #0d9488; text-align: center;">
                    <a href="${healthsherpaUrl}" target="_blank" style="display: block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #0d9488; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">Apply Yourself on HealthSherpa</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ''}

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
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 23px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">Questions? Reply to this email anytime.</p>
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
                You received this because you completed a health coverage screening at
                <a href="https://coveredusa.org" style="color: #78716c; text-decoration: underline;">coveredusa.org</a>
              </p>
              <p style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #78716c; font-family: Georgia, 'Times New Roman', serif;">
                <a href="${unsubscribeUrl}" style="color: #78716c; text-decoration: underline;">Unsubscribe</a>
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
</html>`;
}

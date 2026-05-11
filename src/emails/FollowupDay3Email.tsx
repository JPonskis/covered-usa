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
  const isMedicare = ['medicare', 'medicare-savings'].includes(primaryProgramId);

  let primaryCtaUrl: string;
  let primaryCtaLabel: string;
  if (isACA && healthsherpaUrl) {
    primaryCtaUrl = healthsherpaUrl;
    primaryCtaLabel = 'Apply on HealthSherpa';
  } else if (isMedicare) {
    primaryCtaUrl = `${resultsUrl}#get-help`;
    primaryCtaLabel = 'Get Free Medicare Guidance';
  } else {
    primaryCtaUrl = resultsUrl;
    primaryCtaLabel = 'View Your Results';
  }

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
<body style="margin: 0; padding: 0; background-color: #F0F7FF; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    ${'&nbsp;&zwnj;'.repeat(30)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #F0F7FF;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #D0E4F7;">

          <tr>
            <td style="padding: 32px 36px 0 36px;">
              <a href="https://coveredusa.org" style="text-decoration: none;">
                <span style="font-size: 20px; font-weight: 700; color: #1a56db; font-family: Georgia, 'Times New Roman', serif;">Covered</span><span style="font-size: 20px; font-weight: 700; color: #0e9f6e; font-family: Georgia, 'Times New Roman', serif;">USA</span>
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 36px 0 36px;">
              <p style="margin: 0; font-size: 17px; line-height: 28px; color: #111928; font-family: Georgia, 'Times New Roman', serif;">${greeting}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 36px 0 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #374151; font-family: Georgia, 'Times New Roman', serif;">
                Three days ago you found out you may qualify for <strong style="color: #111928;">${primaryProgramName}</strong>${valueText}.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #374151; font-family: Georgia, 'Times New Roman', serif;">
                Your results are still available. If you haven't applied yet, now is a good time — open enrollment periods close, and these benefits don't wait around.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #6B7280; font-family: Georgia, 'Times New Roman', serif;">
                This is our last email. We won't follow up again.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-radius: 8px; background-color: #1a56db; text-align: center;">
                    <a href="${primaryCtaUrl}" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: Georgia, 'Times New Roman', serif;">${primaryCtaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 36px 0 36px;">
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #8A8278; text-align: center; font-family: Georgia, 'Times New Roman', serif;">
                <a href="${resultsUrl}" style="color: #6B7280; text-decoration: underline;">View your full results</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 36px 0 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="border-top: 1px solid #E5E7EB; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 36px 32px 36px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 23px; color: #8A8278; font-family: Georgia, 'Times New Roman', serif;">Questions? Reply to this email anytime.</p>
              <p style="margin: 0 0 2px 0; font-size: 15px; line-height: 22px; color: #111928; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">Jacob Posner</p>
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #8A8278; font-family: Georgia, 'Times New Roman', serif;">Founder, CoveredUSA</p>
            </td>
          </tr>

        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 20px 36px 0 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #9CA3AF; font-family: Georgia, 'Times New Roman', serif;">
                You received this because you completed a health coverage screening at
                <a href="https://coveredusa.org" style="color: #9CA3AF; text-decoration: underline;">coveredusa.org</a>
              </p>
              <p style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #9CA3AF; font-family: Georgia, 'Times New Roman', serif;">
                <a href="${unsubscribeUrl}" style="color: #9CA3AF; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #D1D5DB; font-family: Georgia, 'Times New Roman', serif;">
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

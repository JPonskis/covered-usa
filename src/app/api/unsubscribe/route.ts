import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'dev-secret';

export function buildUnsubscribeUrl(submissionId: string, baseUrl = 'https://coveredusa.org'): string {
  const token = createHmac('sha256', UNSUBSCRIBE_SECRET).update(submissionId).digest('hex').slice(0, 16);
  return `${baseUrl}/api/unsubscribe?id=${encodeURIComponent(submissionId)}&token=${token}`;
}

function verifyToken(submissionId: string, token: string): boolean {
  const expected = createHmac('sha256', UNSUBSCRIBE_SECRET).update(submissionId).digest('hex').slice(0, 16);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

const CONFIRMATION_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribed</title></head>
<body style="margin: 0; padding: 60px 20px; font-family: Arial, Helvetica, sans-serif; text-align: center; background: #f0f7ff;">
  <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px 32px; border: 1px solid #d0e4f7;">
    <p style="font-size: 24px; margin: 0 0 16px 0;">&#10003;</p>
    <h1 style="font-size: 20px; margin: 0 0 12px 0; color: #1a1a1a;">You've been unsubscribed</h1>
    <p style="font-size: 15px; color: #6b7280; line-height: 22px; margin: 0 0 24px 0;">You won't receive any more emails from CoveredUSA.</p>
    <a href="https://coveredusa.org" style="color: #1a56db; text-decoration: underline; font-size: 14px;">Back to CoveredUSA</a>
  </div>
</body>
</html>`;

const INVALID_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invalid Link</title></head>
<body style="margin: 0; padding: 60px 20px; font-family: Arial, Helvetica, sans-serif; text-align: center; background: #f0f7ff;">
  <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px 32px; border: 1px solid #d0e4f7;">
    <h1 style="font-size: 20px; margin: 0 0 12px 0; color: #1a1a1a;">Invalid unsubscribe link</h1>
    <p style="font-size: 15px; color: #6b7280; line-height: 22px; margin: 0 0 24px 0;">This link may have expired or is malformed. Reply to any of our emails to unsubscribe.</p>
    <a href="https://coveredusa.org" style="color: #1a56db; text-decoration: underline; font-size: 14px;">Back to CoveredUSA</a>
  </div>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!submissionId || !token || !verifyToken(submissionId, token)) {
    return new Response(INVALID_HTML, { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  await supabaseAdmin
    .from('covered_usa_submissions')
    .update({ unsubscribed: true })
    .eq('id', submissionId);

  return new Response(CONFIRMATION_HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

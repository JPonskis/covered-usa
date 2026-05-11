import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'b5a600e393587628a4976896807b6d46';

export async function GET() {
  return new NextResponse(INDEXNOW_KEY + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const TTL_MS = 48 * 60 * 60 * 1000 // 48 hours

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid result ID' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.storage
    .from('bill-results')
    .download(`${id}.json`)

  if (error || !data) {
    return NextResponse.json(
      { error: 'Results not found or expired.' },
      { status: 404 }
    )
  }

  const text = await data.text()
  const stored = JSON.parse(text) as { analysis: unknown; createdAt: string }

  // Check TTL
  const createdAt = new Date(stored.createdAt).getTime()
  if (Date.now() - createdAt > TTL_MS) {
    // Expired — delete and return 404
    await supabaseAdmin.storage.from('bill-results').remove([`${id}.json`])
    return NextResponse.json(
      { error: 'These results have expired. Please analyze your bill again.' },
      { status: 410 }
    )
  }

  return NextResponse.json(stored.analysis)
}

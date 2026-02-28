import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/notemaker'
console.log('n8n Webhook URL:', N8N_WEBHOOK_URL)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, meeting_title, meeting_date } = body

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    if (transcript.length > 200_000) {
      return NextResponse.json({ error: 'Transcript too long (max 200k chars)' }, { status: 400 })
    }

    console.log(
      {
        "meeting_title": meeting_title,
        "meeting_date": meeting_date,
        "transcript_length": transcript.length,
      }
    )

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcript.trim(),
        meeting_title: meeting_title || 'Untitled Meeting',
        meeting_date: meeting_date || new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(90_000), // 90s for long meetings
    })

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text()
      console.error('[n8n] error:', n8nResponse.status, errText)
      return NextResponse.json({ error: 'n8n AI agent failed to process transcript' }, { status: 502 })
    }

    const data = await n8nResponse.json()

    if (!data?.notes) {
      console.error('[n8n] unexpected response:', data)
      return NextResponse.json({ error: 'Invalid response from n8n' }, { status: 502 })
    }

    return NextResponse.json(data)

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'AI processing timed out — transcript may be too long' }, { status: 504 })
    }
    console.error('[transcribe] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
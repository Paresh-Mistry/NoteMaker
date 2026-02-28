import { NextRequest, NextResponse } from 'next/server'

const FATHOM_API_BASE = 'https://api.fathom.ai/external/v1'

export async function GET(req: NextRequest) {
  const apiKey = process.env.FATHOM_API_KEY

  console.log('Fetching transcript for recording_id:', new URL(req.url).searchParams.get('recording_id'))
  console.log('Fathom API Key present:', !!apiKey)

  if (!apiKey) {
    return NextResponse.json({ error: 'FATHOM_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const recordingId = searchParams.get('recording_id')

  if (!recordingId) {
    return NextResponse.json({ error: 'recording_id is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${FATHOM_API_BASE}/recordings/${recordingId}/transcript`,
      {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Fathom API] transcript error:', response.status, errText)

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Transcript not found — meeting may still be processing' },
          { status: 404 }
        )
      }

      return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 502 })
    }

    const data = await response.json()

    return NextResponse.json({
      transcript: data.transcript || data || [],
    })

  } catch (err) {
    console.error('[Fathom transcript] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
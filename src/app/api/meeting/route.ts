import { NextRequest, NextResponse } from 'next/server'

const FATHOM_API_BASE = 'https://api.fathom.ai/external/v1'

export async function GET(req: NextRequest) {
  const apiKey = process.env.FATHOM_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'FATHOM_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')

  // Build query params for Fathom
  const params = new URLSearchParams()
  params.set('limit', '20')
  // include_transcript would be large — we fetch separately per meeting
  if (cursor) params.set('cursor', cursor)

  try {
    const response = await fetch(`${FATHOM_API_BASE}/meetings?${params.toString()}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      // Cache for 60 seconds so refreshing doesn't hammer Fathom
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[Fathom API] meetings error:', response.status, errText)

      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid Fathom API key' }, { status: 401 })
      }

      return NextResponse.json({ error: 'Failed to fetch meetings from Fathom' }, { status: 502 })
    }

    const data = await response.json()

    return NextResponse.json({
      meetings: data.items || [],
      next_cursor: data.next_cursor || null,
      total: data.items?.length || 0,
    })

  } catch (err) {
    console.error('[Fathom meetings] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import type { FathomMeeting } from '@/types/meeting.types'

interface Props {
  onSelect: (meeting: FathomMeeting) => void
  selectedId?: string
}

export default function MeetingsList({ onSelect, selectedId }: Props) {
  const [meetings, setMeetings] = useState<FathomMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchMeetings = useCallback(async (cursor?: string) => {
    const isInitial = !cursor
    if (isInitial) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    try {
      const url = `/api/meeting${cursor ? `?cursor=${cursor}` : ''}`
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch meetings')

      if (isInitial) {
        setMeetings(data.meetings)
      } else {
        setMeetings((prev) => [...prev, ...data.meetings])
      }
      setNextCursor(data.next_cursor || null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return null
    const ms = new Date(end).getTime() - new Date(start).getTime()
    const mins = Math.round(ms / 60000)
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
          Fathom Meetings
        </h2>
        <button
          onClick={() => fetchMeetings()}
          className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
          title="Refresh"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-3 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400 text-xs mb-2">⚠ {error}</p>
          {error.includes('API key') && (
            <p className="text-zinc-500 text-xs">Add your <code className="text-violet-400">FATHOM_API_KEY</code> to <code className="text-zinc-400">.env.local</code></p>
          )}
          <button onClick={() => fetchMeetings()} className="text-xs text-violet-400 hover:underline mt-2">
            Try again
          </button>
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-zinc-500 text-sm">No meetings found</p>
          <p className="text-zinc-600 text-xs mt-1">Record a meeting with Fathom first</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {meetings.map((meeting) => {
              const isSelected = meeting.id === selectedId
              const duration = formatDuration(meeting.recording_start_time, meeting.recording_end_time)

              return (
                <button
                  key={meeting.id}
                  onClick={() => onSelect(meeting)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-violet-500/50 bg-violet-600/10 shadow-lg shadow-violet-900/20'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium leading-snug ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {meeting.title} 
                    </p>
                    <span className="text-xs text-zinc-600 shrink-0">{formatDate(meeting.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {duration && (
                      <span className="text-xs text-zinc-500">⏱ {duration}</span>
                    )}
                    {meeting.meeting_type && (
                      <span className="text-xs text-zinc-600 capitalize bg-white/5 px-1.5 py-0.5 rounded">
                        {meeting.meeting_type}
                      </span>
                    )}
                    {meeting.calendar_invitees && meeting.calendar_invitees.length > 0 && (
                      <span className="text-xs text-zinc-500">
                        👥 {meeting.calendar_invitees.length}
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-xs text-violet-400 ml-auto">Selected ✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {nextCursor && (
            <button
              onClick={() => fetchMeetings(nextCursor)}
              disabled={loadingMore}
              className="text-xs text-zinc-500 hover:text-violet-400 transition-colors text-center py-2"
            >
              {loadingMore ? 'Loading...' : 'Load more meetings'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
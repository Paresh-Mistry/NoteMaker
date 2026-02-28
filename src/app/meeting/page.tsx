'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FathomMeeting } from '@/types/meeting.types'
import { useInfiniteMeetings } from '@/hooks/useMeetings'

type SortBy = 'newest' | 'oldest' | 'longest' | 'shortest'
type FilterBy = 'all' | 'internal' | 'external'

export default function MeetingsPage() {
    const {
        data: meeting,
        isLoading: loading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage: loadingMore,
        refetch,
    } = useInfiniteMeetings()

    console.log('Meetings data:', meeting)

    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SortBy>('newest')
    const [filterBy, setFilterBy] = useState<FilterBy>('all')

    // Flatten paginated data
    const meetings: FathomMeeting[] = useMemo(
        () => meeting?.pages.flatMap((p) => p) ?? [],
        [meeting]
    )
    const getDuration = (m: FathomMeeting) => {
        if (!m.recording_start_time || !m.recording_end_time) return 0
        return new Date(m.recording_end_time).getTime() - new Date(m.recording_start_time).getTime()
    }

    const formatDuration = (ms: number) => {
        if (!ms) return '—'
        const mins = Math.round(ms / 60000)
        return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })

    const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    })

    const filtered = meetings
        .filter((m) => {
            const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
            const matchFilter = filterBy === 'all' || m.meeting_type === filterBy
            return matchSearch && matchFilter
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            if (sortBy === 'longest') return getDuration(b) - getDuration(a)
            if (sortBy === 'shortest') return getDuration(a) - getDuration(b)
            return 0
        })

    const totalDuration = meetings.reduce((acc, m) => acc + getDuration(m), 0)
    const totalHours = Math.round(totalDuration / 3600000 * 10) / 10

    return (
        <>
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-violet-950/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Page title + stats */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        All Meetings
                    </h1>
                    {!loading && meetings.length > 0 && (
                        <div className="flex items-center gap-4 mt-3">
                            <StatPill label="Total" value={`${meetings.length} meetings`} />
                            <StatPill label="Recorded" value={`${totalHours}h`} />
                            <StatPill label="This week" value={`${meetings.filter(m => (Date.now() - new Date(m.created_at).getTime()) < 604800000).length} meetings`} />
                        </div>
                    )}
                </div>

                {/* Search + filters */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search meetings..."
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex gap-1 p-1.5 bg-white/[0.04] rounded-xl border border-white/[0.07]">
                        {(['all', 'internal', 'external'] as FilterBy[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterBy(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterBy === f ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => refetch()} className="text-zinc-600 hover:text-violet-400 text-sm transition-colors px-2">↻</button>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-xs text-zinc-600 font-mono mb-4">
                        {filtered.length} meeting{filtered.length !== 1 ? 's' : ''} {search && `matching "${search}"`}
                    </p>
                )}

                {/* Content */}
                {loading ? (
                    <div className="grid gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-4 w-1/2 bg-white/8 rounded mb-2" />
                                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                                    </div>
                                    <div className="h-3 w-16 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-8 text-center">
                        <p className="text-red-400 mb-2">⚠ {error}</p>
                        <button onClick={() => refetch()} className="text-xs text-violet-400 hover:underline">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-zinc-400 font-medium">No meetings found</p>
                        <p className="text-zinc-600 text-sm mt-1">{search ? 'Try a different search term' : 'Record a meeting with Fathom first'}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((meeting, idx) => {
                            const dur = getDuration(meeting)
                            return (
                                <Link
                                    key={meeting.id}
                                    href={`/meetings/${meeting.id}`}
                                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all duration-200 flex items-center gap-5"
                                >
                                    {/* Index */}
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-xs font-mono text-zinc-600 shrink-0 group-hover:border-violet-500/20 group-hover:text-violet-500 transition-all">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm leading-snug group-hover:text-violet-200 transition-colors truncate">
                                            {meeting.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-xs text-zinc-600">{formatDate(meeting.created_at)}</span>
                                            <span className="text-xs text-zinc-700">·</span>
                                            <span className="text-xs text-zinc-600">{formatTime(meeting.created_at)}</span>
                                            {meeting.meeting_type && (
                                                <>
                                                    <span className="text-xs text-zinc-700">·</span>
                                                    <span className="text-xs text-zinc-600 capitalize">{meeting.meeting_type}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        {(meeting.calendar_invitees?.length ?? 0) > 0 && (
                                            <span className="text-xs text-zinc-600">👥 {meeting.calendar_invitees!.length}</span>
                                        )}
                                        {dur > 0 && (
                                            <span className="text-xs font-mono text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                                                {formatDuration(dur)}
                                            </span>
                                        )}
                                        <span className="text-zinc-700 group-hover:text-violet-400 transition-colors text-sm">→</span>
                                    </div>
                                </Link>
                            )
                        })}

                        {/* Load more */}
                        {hasNextPage && (
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={loadingMore}
                                className="mt-2 w-full py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-violet-400 hover:border-violet-500/20 text-sm transition-all"
                            >
                                {loadingMore ? 'Loading...' : 'Load more meetings ↓'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

function StatPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
            <span className="text-xs text-zinc-600">{label}</span>
            <span className="text-xs font-semibold text-zinc-300">{value}</span>
        </div>
    )
}
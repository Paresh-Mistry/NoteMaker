'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Notes, Status } from "@/types/index"
import { geistMono, instrumentSerif } from '@/font/font'
import { useMeetingById, useTranscriptByRecordingId } from '@/hooks/useMeetings'
import { FathomMeeting, TranscriptLine } from "@/types/meeting.types"


function getEmbedUrl(shareUrl: string): string | null {
    if (!shareUrl) return null
    return shareUrl.replace('/share/', '/embed/')
}

function getDurationMs(m: FathomMeeting) {
    if (!m.recording_start_time || !m.recording_end_time) return 0
    return Math.max(0, new Date(m.recording_end_time).getTime() - new Date(m.recording_start_time).getTime())
}

function formatDuration(ms: number) {
    if (!ms) return null
    const mins = Math.round(ms / 60000)
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function formatDateTime(d: string) {
    const date = new Date(d)
    return {
        date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
}

// Speaker color palette
const SPEAKER_COLORS = [
    'text-amber-400', 'text-sky-400', 'text-emerald-400',
    'text-rose-400', 'text-violet-400', 'text-orange-400',
]
function getSpeakerColor(name: string, map: Map<string, string>): string {
    if (!map.has(name)) map.set(name, SPEAKER_COLORS[map.size % SPEAKER_COLORS.length])
    return map.get(name)!
}

export default function MeetingDetailPage() {
    const { id } = useParams<{ id: string }>()

    const [notes, setNotes] = useState<Notes | null>(null)
    const [notesStatus, setNotesStatus] = useState<Status>('idle')
    const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'notes'>('video')
    const [iframeError, setIframeError] = useState(false)
    const [copied, setCopied] = useState(false)
    const speakerColorMap = useRef(new Map<string, string>())

    const {
        data: meeting,
        isLoading: meetingLoading,
        error: meetingError,
    } = useMeetingById(id as string, !!id)


    const {
        data: transcriptData,
        isLoading: transcriptLoading,
        error: transcriptError,
    } = useTranscriptByRecordingId(
        meeting?.recording_id + " ",
        !!meeting?.recording_id
    )

    console.log('Transcript data:', transcriptData)

    const transcriptLines: TranscriptLine[] =
        transcriptData?.map(transcript => ({
            ...transcript,
            speaker: {
                ...transcript.speaker,
                display_name: transcript.speaker.display_name || 'Unknown Speaker',
            },
        })) || []

    const transcript = React.useMemo(() => {
        if (!transcriptLines.length) return ""

        return transcriptLines
            .map(
                (t) =>
                    `[${t.timestamp}] ${t.speaker.display_name}: ${t.text}`
            )
            .join("\n")
    }, [transcriptLines])

    const handleGenerateNotes = async () => {
        if (!transcript || !meeting) return
        setNotesStatus('processing')
        try {
            const res = await fetch('/api/n8n', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript,
                    meeting_title: meeting.title || meeting.meeting_title,
                    meeting_date: meeting.recording_start_time || meeting.created_at,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setNotes(data.notes)
            setNotesStatus('done')
            setActiveTab('notes')
        } catch { setNotesStatus('error') }
    }

    const copyNotes = () => {
        if (!notes) return
        const md = `# ${notes.meeting_title}\n\n## Summary\n${notes.summary}\n\n## Key Points\n${notes.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n## Action Items\n${notes.action_items.map(a => `- [ ] ${a}`).join('\n')}\n\n## Decisions\n${notes.decisions.map(d => `- ✓ ${d}`).join('\n')}\n\n## Follow-ups\n${notes.follow_ups?.map(f => `- → ${f}`).join('\n') || 'None'}`
        navigator.clipboard.writeText(md)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (meetingLoading) return <Loader text="Loading meeting..." />
    if (meetingError || !meeting) return <ErrorView message={(meetingError as any)?.message || 'Meeting not found'} />

    const embedUrl = getEmbedUrl(meeting.share_url)
    const dur = formatDuration(getDurationMs(meeting))
    const { date, time } = formatDateTime(meeting.recording_start_time || meeting.created_at)
    const isInternal = meeting.calendar_invitees_domains_type === 'only_internal'
    const tabs = [
        { key: 'video', icon: '▶', label: 'Recording', disabled: !embedUrl },
        { key: 'transcript', icon: '☰', label: 'Transcript', disabled: false },
        { key: 'notes', icon: '✦', label: 'AI Notes', disabled: !notes },
    ]

    return (
        <>

            {/* Grain texture overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
            // style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }}
            />

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-violet-950/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* ── MAIN ── */}
            <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 flex flex-col gap-6">
                <div className="anim-1 flex items-end justify-between gap-6 flex-wrap">
                    <div>
                        <p className={`text-[11px] font-medium text-zinc-600 uppercase tracking-[0.15em] mb-2 ${geistMono.className}`}>
                            Meeting Recording
                        </p>
                        <h1 className={`text-[#f5f0e8] ${instrumentSerif.className} text-2xl md:text-3xl font-medium`}>
                            {meeting.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span className="text-sm text-zinc-500">{date}</span>
                            <span className="text-zinc-700">·</span>
                            <span className="text-sm text-zinc-500">{time}</span>
                            {dur && <>
                                <span className="text-zinc-700">·</span>
                                <span className="text-sm text-zinc-500">{dur}</span>
                            </>}
                            <span className="text-zinc-700">·</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${isInternal ? 'text-sky-400 border-sky-500/25 bg-sky-500/8' : 'text-orange-400 border-orange-500/25 bg-orange-500/8'}`}>
                                {isInternal ? 'Internal' : 'External'}
                            </span>
                        </div>
                    </div>

                    {/* Generate Notes CTA */}
                    <button
                        onClick={handleGenerateNotes}
                        disabled={!transcript || notesStatus === 'processing' || transcriptLoading}
                        className={`group relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden ${!transcript || notesStatus === 'processing' || transcriptLoading
                            ? 'bg-white/[0.04] text-zinc-600 cursor-not-allowed border border-white/[0.06]'
                            : 'text-white border border-amber-500/30 hover:border-amber-400/50'
                            }`}
                        style={transcript && notesStatus !== 'processing' ? { background: 'linear-gradient(135deg, rgba(217,119,6,0.15), rgba(180,83,9,0.25))' } : {}}
                    >
                        {transcript && notesStatus !== 'processing' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className="relative flex items-center gap-2">
                            {notesStatus === 'processing' ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
                                    Generating notes...
                                </>
                            ) : notesStatus === 'done' ? (
                                <><span className="text-amber-400">✓</span> Regenerate Notes</>
                            ) : (
                                <><span className="text-amber-400">✦</span> Generate AI Notes</>
                            )}
                        </span>
                    </button>
                </div>

                {/* ── PEOPLE ROW ── */}
                {((meeting.calendar_invitees?.length ?? 0) > 0 || meeting.recorded_by) && (
                    <div className="anim-2 flex items-center gap-4 flex-wrap py-4 border-y border-white/[0.05]">
                        {meeting.recorded_by && (
                            <div className="flex items-center gap-2.5">
                                <Avatar name={meeting.recorded_by.name} size="sm" gradient="from-amber-500 to-orange-600" />
                                <div>
                                    <p className="text-xs text-zinc-300 leading-none">{meeting.recorded_by.name}</p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5" style={{ fontFamily: 'var(--mono)' }}>recorded by</p>
                                </div>
                            </div>
                        )}
                        {(meeting.calendar_invitees?.length ?? 0) > 0 && (
                            <>
                                {meeting.recorded_by && <div className="w-px h-8 bg-white/[0.06]" />}
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {meeting.calendar_invitees!.slice(0, 5).map((inv, i) => (
                                            <div key={i} title={inv.name} className="relative" style={{ zIndex: 5 - i }}>
                                                <Avatar name={inv.name || '?'} size="sm" />
                                            </div>
                                        ))}
                                        {meeting.calendar_invitees!.length > 5 && (
                                            <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-[10px] text-zinc-400 font-medium" style={{ zIndex: 0 }}>
                                                +{meeting.calendar_invitees!.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-300 leading-none">{meeting.calendar_invitees!.map(i => i.name).filter(Boolean).join(', ')}</p>
                                        <p className="text-[10px] text-zinc-600 mt-0.5" style={{ fontFamily: 'var(--mono)' }}>{meeting.calendar_invitees!.length} attendees</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── TAB BAR ── */}
                <div className="anim-3 flex items-center gap-1 border-b border-white/[0.06] pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => !tab.disabled && setActiveTab(tab.key as typeof activeTab)}
                            disabled={tab.disabled}
                            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 -mb-px ${activeTab === tab.key
                                ? 'text-white border-b-2 border-amber-400'
                                : tab.disabled
                                    ? 'text-zinc-700 cursor-not-allowed'
                                    : 'text-zinc-500 hover:text-zinc-200 border-b-2 border-transparent'
                                }`}
                        >
                            <span className={`text-xs ${activeTab === tab.key ? 'text-amber-400' : ''}`}>{tab.icon}</span>
                            {tab.label}
                            {tab.key === 'notes' && notesStatus === 'done' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── VIDEO TAB ── */}
                {activeTab === 'video' && (
                    <div className="anim-4">
                        {!embedUrl ? (
                            <EmptyState icon="🎬" title="No video available" sub="This meeting has no share URL" />
                        ) : iframeError ? (
                            <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: 'rgba(15,14,20,0.8)' }}>
                                <div className="aspect-video flex flex-col items-center justify-center gap-5 text-center px-8">
                                    <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-2xl">🔒</div>
                                    <div>
                                        <p className="text-white font-semibold mb-1.5" style={{ fontFamily: 'var(--serif)' }}>Requires Fathom Login</p>
                                        <p className="text-zinc-500 text-sm max-w-xs">This recording needs authentication. Watch it directly on Fathom.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={meeting.share_url} target="_blank" rel="noopener noreferrer"
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                                            style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
                                        >
                                            ▶ Watch on Fathom
                                        </a>
                                        {meeting.url && (
                                            <a href={meeting.url} target="_blank" rel="noopener noreferrer"
                                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 border border-white/[0.10] hover:border-white/[0.20] transition-all"
                                            >
                                                Open Page ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/60">
                                {/* Theater chrome top bar */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]" style={{ background: 'rgba(10,9,12,0.9)' }}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs text-zinc-500" style={{ fontFamily: 'var(--mono)' }}>fathom recording</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {dur && <span className="text-[11px] text-zinc-600 font-medium" style={{ fontFamily: 'var(--mono)' }}>{dur}</span>}
                                        <a href={meeting.share_url} target="_blank" rel="noopener noreferrer"
                                            className="text-[11px] text-amber-500/70 hover:text-amber-400 transition-colors"
                                        >
                                            full screen ↗
                                        </a>
                                    </div>
                                </div>

                                {/* Iframe */}
                                <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        src={`${embedUrl}?autoplay=0`}
                                        className="absolute inset-0 w-full h-full"
                                        allowFullScreen
                                        allow="encrypted-media *; fullscreen *;"
                                        style={{ border: 'none' }}
                                        onError={() => setIframeError(true)}
                                        title={meeting.title}
                                    />
                                </div>

                                {/* Theater chrome bottom bar */}
                                <div className="px-4 py-2.5 border-t border-white/[0.05]" style={{ background: 'rgba(10,9,12,0.9)' }}>
                                    <p className="text-xs text-zinc-600 truncate" style={{ fontFamily: 'var(--mono)' }}>
                                        {meeting.title} · {date}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TRANSCRIPT TAB ── */}
                {activeTab === 'transcript' && (
                    <div className="anim-4 rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(9,9,12,0.7)' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <span className="text-zinc-600 text-xs" style={{ fontFamily: 'var(--mono)' }}>TRANSCRIPT</span>
                                {!transcriptLoading && transcriptLines.length > 0 && (
                                    <span className="text-[11px] text-zinc-700 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                                        {transcriptLines.length} lines
                                    </span>
                                )}
                            </div>
                            {transcript && (
                                <button
                                    onClick={() => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                                    className="text-xs text-zinc-500 hover:text-zinc-200 border border-white/[0.07] hover:border-white/[0.15] px-3 py-1.5 rounded-lg transition-all"
                                >
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="max-h-[600px] overflow-y-auto">
                            {transcriptLoading ? (
                                <div className="flex items-center justify-center py-20 gap-3">
                                    <div className="w-5 h-5 border border-amber-500/50 border-t-amber-400 rounded-full animate-spin" />
                                    <span className="text-zinc-600 text-sm">Fetching from Fathom...</span>
                                </div>
                            ) : transcriptError ? (
                                <EmptyState icon="📭" title="No transcript yet" sub={typeof transcriptError === 'string' ? transcriptError : 'Failed to load transcript'} />
                            ) : (
                                <div className="px-6 py-4">
                                    {/* Speaker legend */}
                                    {transcriptLines.length > 0 && (() => {
                                        const speakers = [...new Set(transcriptLines.map(l => l.speaker.display_name))]
                                        return (
                                            <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-white/[0.04]">
                                                {speakers.map(name => (
                                                    <div key={name} className="flex items-center gap-1.5">
                                                        <span className={`text-[10px] font-semibold ${getSpeakerColor(name, speakerColorMap.current)}`}>{name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })()}

                                    {/* Lines */}
                                    <div className="flex flex-col">
                                        {transcriptLines.map((line, i) => {
                                            const color = getSpeakerColor(line.speaker.display_name, speakerColorMap.current)
                                            const showSpeakerLabel = i === 0 || transcriptLines[i - 1].speaker.display_name !== line.speaker.display_name
                                            return (
                                                <div key={i} className={`flex gap-4 group ${showSpeakerLabel && i !== 0 ? 'mt-4' : ''}`}>
                                                    {/* Timestamp */}
                                                    <span className="text-[10px] text-zinc-700 font-medium shrink-0 mt-1 w-12 tabular-nums text-right" style={{ fontFamily: 'var(--mono)' }}>
                                                        {line.timestamp}
                                                    </span>
                                                    {/* Content */}
                                                    <div className="flex-1 pb-1">
                                                        {showSpeakerLabel && (
                                                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${color}`} style={{ fontFamily: 'var(--mono)' }}>
                                                                {line.speaker.display_name}
                                                            </p>
                                                        )}
                                                        <p className="text-[13.5px] text-zinc-300 leading-relaxed group-hover:text-zinc-100 transition-colors">
                                                            {line.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── NOTES TAB ── */}
                {activeTab === 'notes' && notes && (
                    <div className="anim-4 flex flex-col gap-4">
                        {/* Notes header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs text-zinc-500 font-medium" style={{ fontFamily: 'var(--mono)' }}>AI NOTES</span>
                                </div>
                                <span className="text-[11px] text-zinc-700 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                                    Gemini 2.0 Flash
                                </span>
                            </div>
                            <button
                                onClick={copyNotes}
                                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 border border-white/[0.07] hover:border-white/[0.18] px-3 py-1.5 rounded-lg transition-all"
                            >
                                {copied ? <><span className="text-emerald-400">✓</span> Copied!</> : <>Copy Markdown</>}
                            </button>
                        </div>

                        {/* Summary — full width hero */}
                        <div className="rounded-2xl p-6 border border-amber-500/15 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.15), rgba(92,38,8,0.08))' }}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
                            <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'var(--mono)' }}>
                                ◈ Summary
                            </p>
                            <p className="text-zinc-200 leading-relaxed relative z-10" style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem' }}>
                                {notes.summary}
                            </p>
                        </div>

                        {/* 2-col grid for smaller sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {notes.key_points?.length > 0 && (
                                <NoteSection icon="◆" label="Key Points" accent="indigo">
                                    {notes.key_points.map((p, i) => (
                                        <div key={i} className="flex gap-3 mb-3 last:mb-0">
                                            <span className="text-[11px] text-indigo-500/70 font-bold shrink-0 mt-0.5 w-5 text-right tabular-nums" style={{ fontFamily: 'var(--mono)' }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{p}</p>
                                        </div>
                                    ))}
                                </NoteSection>
                            )}

                            {notes.action_items?.length > 0 && (
                                <NoteSection icon="▸" label="Action Items" accent="emerald">
                                    {notes.action_items.map((a, i) => (
                                        <div key={i} className="flex gap-3 mb-3 last:mb-0 group/item">
                                            <span className="text-emerald-500/60 text-xs shrink-0 mt-0.5">☐</span>
                                            <p className="text-sm text-zinc-300 leading-relaxed group-hover/item:text-zinc-100 transition-colors">{a}</p>
                                        </div>
                                    ))}
                                </NoteSection>
                            )}

                            {notes.decisions?.length > 0 && (
                                <NoteSection icon="◉" label="Decisions Made" accent="violet">
                                    {notes.decisions.map((d, i) => (
                                        <div key={i} className="flex gap-3 mb-3 last:mb-0">
                                            <span className="text-violet-400/60 text-xs shrink-0 mt-0.5">✓</span>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{d}</p>
                                        </div>
                                    ))}
                                </NoteSection>
                            )}

                            {notes.follow_ups?.length > 0 && (
                                <NoteSection icon="→" label="Follow-ups" accent="sky">
                                    {notes.follow_ups.map((f, i) => (
                                        <div key={i} className="flex gap-3 mb-3 last:mb-0">
                                            <span className="text-sky-400/60 text-xs shrink-0 mt-0.5">→</span>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{f}</p>
                                        </div>
                                    ))}
                                </NoteSection>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

// ── Micro-components ──────────────────────────────────────────

function Avatar({ name, size = 'sm', gradient }: { name: string; size?: 'sm' | 'md'; gradient?: string }) {
    const s = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-sm'
    const g = gradient || 'from-violet-500 to-fuchsia-600'
    return (
        <div className={`${s} rounded-full bg-gradient-to-br ${g} flex items-center justify-center font-bold text-white border-2 border-[#060608]`}>
            {name[0]?.toUpperCase() || '?'}
        </div>
    )
}

type Accent = 'indigo' | 'emerald' | 'violet' | 'sky'
const sectionStyles: Record<Accent, { border: string; bg: string; label: string }> = {
    indigo: { border: 'border-indigo-500/12', bg: 'rgba(30,27,75,0.25)', label: 'text-indigo-400/70' },
    emerald: { border: 'border-emerald-500/12', bg: 'rgba(6,47,35,0.25)', label: 'text-emerald-400/70' },
    violet: { border: 'border-violet-500/12', bg: 'rgba(46,16,101,0.25)', label: 'text-violet-400/70' },
    sky: { border: 'border-sky-500/12', bg: 'rgba(8,47,73,0.25)', label: 'text-sky-400/70' },
}

function NoteSection({ icon, label, accent, children }: { icon: string; label: string; accent: Accent; children: React.ReactNode }) {
    const { border, bg, label: lc } = sectionStyles[accent]
    return (
        <div className={`rounded-xl border ${border} p-5`} style={{ background: bg }}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-4 flex items-center gap-1.5 ${lc}`} style={{ fontFamily: 'var(--mono)' }}>
                <span>{icon}</span><span>{label}</span>
            </p>
            {children}
        </div>
    )
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <span className="text-3xl mb-1">{icon}</span>
            <p className="text-zinc-400 font-medium text-sm">{title}</p>
            <p className="text-zinc-700 text-xs max-w-xs">{sub}</p>
        </div>
    )
}

function Loader({ text }: { text: string }) {
    return (
        <main className="min-h-screen bg-[#060608] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-600 text-sm">{text}</p>
            </div>
        </main>
    )
}

function ErrorView({ message }: { message: string }) {
    return (
        <main className="min-h-screen bg-[#060608] flex items-center justify-center">
            <div className="text-center">
                <p className="text-5xl mb-4">⚠</p>
                <p className="text-zinc-400 mb-5 text-sm">{message}</p>
                <Link href="/meetings" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">← Back to meetings</Link>
            </div>
        </main>
    )
}
'use client'

import { useState } from 'react'
import type { FathomMeeting, Notes, Status } from '@/types/index'
import MeetingsList from '@/components/common/MeetingList'
import TranscriptPanel from '@/components/common/TranscriptPanel'
import StatusBadge from '@/components/common/StatusBadge'
import NotesDisplay from '@/components/common/NotesDisplay'

export default function Home() {
    const [selectedMeeting, setSelectedMeeting] = useState<FathomMeeting | null>(null)
    const [transcript, setTranscript] = useState<string>('')
    const [notes, setNotes] = useState<Notes | null>(null)
    const [status, setStatus] = useState<Status>('idle')
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'transcript' | 'notes'>('transcript')

    const handleMeetingSelect = async (meeting: FathomMeeting) => {
        setSelectedMeeting(meeting)
        setNotes(null)
        setError(null)
        setActiveTab('transcript')

        // If transcript already included in meeting object, use it
        if (meeting.transcript && meeting.transcript.length > 0) {
            const formatted = meeting.transcript
                .map((t: any) => `[${t.timestamp}] ${t.speaker.display_name}: ${t.text}`)
                .join('\n')
            setTranscript(formatted)
            setStatus('idle')
        } else {
            // Fetch transcript separately
            setStatus('loading')
            try {
                const res = await fetch(`/api/transcript?recording_id=${meeting.recording_id}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch transcript')
                const formatted = data.transcript
                    .map((t: { timestamp: string; speaker: { display_name: string }; text: string }) =>
                        `[${t.timestamp}] ${t.speaker.display_name}: ${t.text}`
                    )
                    .join('\n')
                setTranscript(formatted)
                setStatus('idle')
                console.log('Transcript fetched for meeting:', meeting.id, 'Transcript length:', formatted.length)
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load transcript')
                setStatus('error')
            }
        }
    }

    const handleGenerateNotes = async () => {
        if (!transcript.trim()) return
        setStatus('processing')
        setNotes(null)
        setError(null)

        try {
            const res = await fetch('/api/n8n', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript,
                    meeting_title: selectedMeeting?.title || 'Meeting',
                    meeting_date: selectedMeeting?.created_at || new Date().toISOString(),
                }),
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to generate notes')
            }

            const data = await res.json()
            setNotes(data.notes)
            setStatus('done')
            setActiveTab('notes')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setStatus('error')
        }
    }

    console.log('Selected Meeting:', selectedMeeting)
    console.log('Transcript length:', transcript.length)
    console.log('Notes generated:', notes)

    return (
        <main className="min-h-screen bg-[#080810] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-violet-950/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}


                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-12 gap-6">

                        {/* Left: Meetings List */}
                        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                            <MeetingsList
                                onSelect={handleMeetingSelect}
                                selectedId={selectedMeeting?.id}
                            />
                        </div>

                        {/* Right: Transcript + Notes */}
                        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                            {!selectedMeeting ? (
                                <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center rounded-2xl border border-white/5 bg-white/[0.02]">
                                    <div className="text-5xl mb-4">🎙️</div>
                                    <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                                        Select a meeting
                                    </h2>
                                    <p className="text-zinc-500 max-w-sm text-sm">
                                        Choose a Fathom meeting from the left to view its transcript and generate AI-structured notes.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {/* Meeting Header */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                                                    {selectedMeeting.title}
                                                </h2>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                    <span>📅 {new Date(selectedMeeting.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    {selectedMeeting.meeting_type && (
                                                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">{selectedMeeting.meeting_type}</span>
                                                    )}
                                                    {selectedMeeting.calendar_invitees && (
                                                        <span>👥 {selectedMeeting.calendar_invitees.length} attendees</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleGenerateNotes}
                                                disabled={!transcript || status === 'processing' || status === 'loading'}
                                                className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${!transcript || status === 'processing' || status === 'loading'
                                                        ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30 hover:scale-[1.02] active:scale-[0.98]'
                                                    }`}
                                            >
                                                {status === 'processing' ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                                        Generating...
                                                    </span>
                                                ) : '✦ Generate Notes'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    {(transcript || notes) && (
                                        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                                            {(['transcript', 'notes'] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    disabled={tab === 'notes' && !notes}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50'
                                                            : notes || tab === 'transcript'
                                                                ? 'text-zinc-400 hover:text-white'
                                                                : 'text-zinc-700 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {tab === 'transcript' ? '📝 Transcript' : `✨ Notes${notes ? '' : ' (generate first)'}`}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Content */}
                                    {error && (
                                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                                            ⚠ {error}
                                        </div>
                                    )}

                                    {activeTab === 'transcript' && (
                                        <TranscriptPanel
                                            transcript={transcript}
                                            isLoading={status === 'loading'}
                                            fathomSummary={selectedMeeting.default_summary}
                                        />
                                    )}

                                    {activeTab === 'notes' && notes && (
                                        <NotesDisplay notes={notes} meetingTitle={selectedMeeting.title} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

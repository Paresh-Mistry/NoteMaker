'use client'

import type { Notes } from '@/types/index'

interface Props {
  notes: Notes
  meetingTitle: string
}

export default function NotesDisplay({ notes, meetingTitle }: Props) {
  const copyAll = () => {
    const text = `
# ${notes.meeting_title || meetingTitle}
${notes.meeting_date ? `Date: ${new Date(notes.meeting_date).toLocaleDateString()}` : ''}

## Summary
${notes.summary}

## Key Points
${notes.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Action Items
${notes.action_items.map((a) => `☐ ${a}`).join('\n')}

## Decisions Made
${notes.decisions.map((d) => `✓ ${d}`).join('\n')}

## Follow-ups
${notes.follow_ups?.map((f) => `→ ${f}`).join('\n') || 'None'}
    `.trim()
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI-Generated Notes
          <span className="text-zinc-600 normal-case tracking-normal font-normal">via n8n + OpenAI</span>
        </div>
        <button
          onClick={copyAll}
          className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-500/60 px-3 py-1 rounded-lg transition-all"
        >
          Copy All
        </button>
      </div>

      {/* Summary */}
      <NoteCard icon="◈" label="Summary" accent="violet">
        <p className="text-zinc-300 text-sm leading-relaxed">{notes.summary}</p>
      </NoteCard>

      {/* Key Points */}
      {notes.key_points?.length > 0 && (
        <NoteCard icon="◆" label="Key Points" accent="indigo">
          <ul className="flex flex-col gap-2">
            {notes.key_points.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="text-indigo-400 font-mono shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </NoteCard>
      )}

      {/* Action Items */}
      {notes.action_items?.length > 0 && (
        <NoteCard icon="▸" label="Action Items" accent="emerald">
          <ul className="flex flex-col gap-2">
            {notes.action_items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="text-emerald-400 shrink-0 mt-0.5">☐</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </NoteCard>
      )}

      {/* Decisions */}
      {notes.decisions?.length > 0 && (
        <NoteCard icon="◉" label="Decisions Made" accent="amber">
          <ul className="flex flex-col gap-2">
            {notes.decisions.map((d, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </NoteCard>
      )}

      {/* Follow-ups */}
      {notes.follow_ups?.length > 0 && (
        <NoteCard icon="→" label="Follow-ups" accent="sky">
          <ul className="flex flex-col gap-2">
            {notes.follow_ups.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </NoteCard>
      )}
    </div>
  )
}

type Accent = 'violet' | 'indigo' | 'emerald' | 'amber' | 'sky'

function NoteCard({ icon, label, accent, children }: {
  icon: string
  label: string
  accent: Accent
  children: React.ReactNode
}) {
  const styles: Record<Accent, { border: string; label: string }> = {
    violet: { border: 'border-violet-500/20 bg-violet-500/5', label: 'text-violet-400' },
    indigo: { border: 'border-indigo-500/20 bg-indigo-500/5', label: 'text-indigo-400' },
    emerald: { border: 'border-emerald-500/20 bg-emerald-500/5', label: 'text-emerald-400' },
    amber: { border: 'border-amber-500/20 bg-amber-500/5', label: 'text-amber-400' },
    sky: { border: 'border-sky-500/20 bg-sky-500/5', label: 'text-sky-400' },
  }

  return (
    <div className={`rounded-2xl border p-5 ${styles[accent].border}`}>
      <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest font-mono ${styles[accent].label}`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}
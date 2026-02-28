'use client'

import type { FathomSummary } from '@/types/index'

interface Props {
  transcript: string
  isLoading: boolean
  fathomSummary?: FathomSummary
}

export default function TranscriptPanel({ transcript, isLoading, fathomSummary }: Props) {
  const copyTranscript = () => navigator.clipboard.writeText(transcript)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading transcript from Fathom...</p>
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center min-h-[200px] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">No transcript available yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fathom's own summary — shown as reference */}
      {fathomSummary?.markdown_formatted && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest font-mono text-amber-400">
            <span>◈</span>
            <span>Fathom Summary</span>
            <span className="ml-auto text-zinc-600 normal-case tracking-normal font-normal">from Fathom AI</span>
          </div>
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {fathomSummary.markdown_formatted
              .replace(/^## /gm, '')
              .replace(/\*\*/g, '')
              .trim()}
          </div>
        </div>
      )}

      {/* Full Transcript */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest font-mono text-zinc-400">
            <span>◆</span>
            <span>Full Transcript</span>
          </div>
          <button
            onClick={copyTranscript}
            className="text-xs text-zinc-500 hover:text-violet-400 border border-white/10 hover:border-violet-500/30 px-3 py-1 rounded-lg transition-all"
          >
            Copy
          </button>
        </div>
        <div className="p-5 max-h-[500px] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {transcript.split('\n').map((line, i) => {
              // Parse [00:00:00] Speaker: text format
              const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\]\s+([^:]+):\s+(.+)$/)
              if (match) {
                const [, time, speaker, text] = match
                return (
                  <div key={i} className="flex gap-3 group py-1">
                    <span className="text-xs text-zinc-600 font-mono shrink-0 mt-0.5 w-16">{time}</span>
                    <div>
                      <span className="text-xs font-semibold text-violet-400 mr-2">{speaker}</span>
                      <span className="text-sm text-zinc-300 leading-relaxed">{text}</span>
                    </div>
                  </div>
                )
              }
              return (
                <p key={i} className="text-sm text-zinc-300 leading-relaxed">
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
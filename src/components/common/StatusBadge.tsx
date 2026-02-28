import type { Status } from '@/types/index'

const config: Record<Status, { label: string; color: string; dot: string }> = {
  idle: { label: 'Ready', color: 'text-zinc-500 border-zinc-700 bg-zinc-800/50', dot: 'bg-zinc-500' },
  loading: { label: 'Loading transcript...', color: 'text-blue-300 border-blue-500/40 bg-blue-900/20', dot: 'bg-blue-400 animate-pulse' },
  processing: { label: 'Generating notes...', color: 'text-violet-300 border-violet-500/40 bg-violet-900/30', dot: 'bg-violet-400 animate-pulse' },
  done: { label: 'Notes ready ✓', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-900/20', dot: 'bg-emerald-400' },
  error: { label: 'Error', color: 'text-red-300 border-red-500/40 bg-red-900/20', dot: 'bg-red-400' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, color, dot } = config[status]
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </div>
  )
}
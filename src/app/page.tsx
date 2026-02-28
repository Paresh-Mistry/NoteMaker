'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const features = [
  {
    icon: '🎙️',
    title: 'Fathom Integration',
    desc: 'Auto-pulls transcripts from your Fathom-recorded meetings. Select any meeting and the transcript loads instantly.',
  },
  {
    icon: '📋',
    title: 'Manual Input',
    desc: 'Paste any transcript or upload .txt, .pdf, .docx files. Works with any meeting recorder or transcript source.',
  },
  {
    icon: '🤖',
    title: 'Gemini AI Agent',
    desc: 'Google Gemini analyzes your transcript and extracts structured notes with precision and context awareness.',
  },
  {
    icon: '⚡',
    title: 'Instant Structure',
    desc: 'Get Summary, Key Points, Action Items, Decisions and Follow-ups — all organized and ready to share.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Connect Fathom',
    desc: 'Add your Fathom API key. Your recorded meetings appear automatically in the sidebar.',
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    num: '02',
    title: 'Select a Meeting',
    desc: 'Click any meeting to load its full transcript with speaker names and timestamps.',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    num: '03',
    title: 'Generate Notes',
    desc: 'Hit Generate Notes. Gemini AI processes the transcript through n8n and returns structured notes.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    num: '04',
    title: 'Copy & Share',
    desc: 'Copy your notes as formatted Markdown. Summary, action items, decisions — all ready to paste.',
    color: 'from-rose-500 to-orange-500',
  },
]

const notePreview = {
  summary: 'The team agreed to accelerate Q4 launch timeline by two weeks. Sarah will lead the frontend push while John coordinates with the design team on final assets.',
  key_points: [
    'Q4 launch moved from Dec 15 to Dec 1',
    'Frontend team needs 3 additional engineers',
    'Design assets due by Nov 20',
  ],
  action_items: [
    'Sarah: Finalize component library by Nov 18',
    'John: Brief design team on revised timeline',
    'Mike: Prepare infrastructure scaling plan',
  ],
  decisions: [
    'Launch date moved to December 1st',
    'Budget approved for contractor hiring',
  ],
}

export default function HomePage() {
  const [activeNote, setActiveNote] = useState<keyof typeof notePreview>('summary')
  const [typed, setTyped] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const transcript = `[00:00:12] Sarah: Okay team, let's talk Q4 launch.
[00:00:18] John: I think we need to move the date up.
[00:00:24] Sarah: Agreed. Dec 1st instead of Dec 15th?
[00:00:31] Mike: That works. I'll handle infrastructure.
[00:00:38] John: I'll brief design on the new timeline.`

  // Typing effect for transcript
  useEffect(() => {
    let i = 0
    setTyped('')
    setTypingDone(false)
    const interval = setInterval(() => {
      if (i < transcript.length) {
        setTyped(transcript.slice(0, i + 1))
        i++
      } else {
        setTypingDone(true)
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [])

  // Rotate note sections
  useEffect(() => {
    if (!typingDone) return
    const keys = Object.keys(notePreview) as (keyof typeof notePreview)[]
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % keys.length
      setActiveNote(keys[i])
    }, 2500)
    return () => clearInterval(interval)
  }, [typingDone])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <main className="min-h-screen bg-[#050508] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[900px] h-[900px] bg-violet-900/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[700px] h-[700px] bg-fuchsia-900/15 rounded-full blur-[180px]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>


      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Fathom API + Google Gemini + n8n
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[0.95]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Meeting transcripts
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              into structured notes
            </span>
          </h1>

          <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect Fathom, select any meeting, and get AI-generated notes in seconds.
            Summary, action items, decisions — all organized automatically.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/meeting"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-violet-900/40"
            >
              ✦ Start Taking Notes
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 font-medium text-base hover:border-white/20 hover:bg-white/[0.07] transition-all"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Live demo preview */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Transcript side */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-zinc-500 font-mono ml-2">transcript.txt</span>
              <span className="ml-auto text-[10px] text-violet-400 font-mono">● live</span>
            </div>
            <div className="p-5 font-mono text-xs leading-7 text-zinc-300 min-h-[200px]">
              {typed}
              {!typingDone && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
            </div>
          </div>

          {/* Notes side */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-zinc-500 font-mono ml-2">ai-notes.json</span>
              {typingDone && <span className="ml-auto text-[10px] text-emerald-400 font-mono">✓ generated</span>}
            </div>
            <div className="p-5 min-h-[200px]">
              {!typingDone ? (
                <div className="flex items-center justify-center h-32 gap-3">
                  <div className="w-5 h-5 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
                  <span className="text-zinc-600 text-xs font-mono">waiting for transcript...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 animate-fade-in">
                  {/* Tab buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {(Object.keys(notePreview) as (keyof typeof notePreview)[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveNote(key)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium capitalize transition-all ${
                          activeNote === key
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {key.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {activeNote === 'summary' && (
                      <p>{notePreview.summary}</p>
                    )}
                    {activeNote !== 'summary' && (
                      <ul className="flex flex-col gap-1.5">
                        {notePreview[activeNote].map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-violet-400 shrink-0">
                              {activeNote === 'action_items' ? '☐' : activeNote === 'decisions' ? '✓' : '·'}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 font-mono mb-3">How it works</p>
          <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            From meeting to notes in 4 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className={`text-3xl font-black bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4 font-mono`}>
                {step.num}
              </div>
              <h3 className="text-white font-bold mb-2 text-base">{step.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 text-zinc-700 text-lg z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 font-mono mb-3">Features</p>
          <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Everything you need
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all duration-300 group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 font-mono mb-6">Built with</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { name: 'Next.js', color: 'text-white' },
              { name: 'Fathom API', color: 'text-violet-400' },
              { name: 'Google Gemini', color: 'text-blue-400' },
              { name: 'n8n', color: 'text-orange-400' },
              { name: 'Tailwind CSS', color: 'text-cyan-400' },
            ].map((tech) => (
              <span key={tech.name} className={`text-lg font-bold ${tech.color} opacity-70 hover:opacity-100 transition-opacity`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24 text-center">
        <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-900/20 to-fuchsia-900/10 p-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Ready to try it?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
              Open the app, connect your Fathom account, and generate your first AI notes in under a minute.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-violet-900/50"
            >
              ✦ Open NoteMaker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="text-zinc-600 text-xs font-mono">
          NoteMaker — Fathom + Gemini + n8n · Built with Next.js
        </p>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease forwards;
        }
      `}</style>
    </main>
  )
}
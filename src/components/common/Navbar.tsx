'use client'

import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useMeetingById } from "@/hooks/useMeetings"
import { orbitron, instrumentSerif } from "@/font/font"
import { ArrowRight } from "lucide-react"

export default function Navbar() {
    const router = useRouter()

    return (
        < header className="z-10 border-b z-20 border-white/[0.06] bg-black/20 backdrop-blur-xl sticky top-0" >
            <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        <span className={`text-white font-semibold italic text-sm ${orbitron.className}`}>NoteMaker</span>
                    </Link>
                    <span className="text-zinc-700">/</span>
                    <span className="text-zinc-400 text-xs">All Meetings</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/meetings/player" className="px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs hover:bg-violet-600/30 transition-all">
                        ▶ Play All
                    </Link>
                    <Link href={"https://fathom.ai"} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 px-3 py-1.5 rounded-lg border border-violet-500/30 hover:border-violet-500/50 transition-all">
                        Open in Fathom ↗
                    </Link>
                </div>
            </div>
        </header >
    )
}

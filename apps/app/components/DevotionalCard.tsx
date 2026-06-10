'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
import type { Devotional } from '@/lib/types'

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  const [showReflection, setShowReflection] = useState(false)

  const date = new Date(devotional.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return (
    <div className="bg-[#2E2860] rounded-[20px] p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#E0A943]" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-[#E0A943] uppercase tracking-widest">
            Devocional de Hoje
          </span>
        </div>
        <span className="text-[11px] text-white/40 capitalize">{date}</span>
      </div>

      {/* Verse */}
      <p className="font-serif-devotional italic text-lg text-[#F3F1FA] leading-relaxed mb-3">
        &ldquo;{decodeHtml(devotional.verse_text)}&rdquo;
      </p>
      <p className="text-sm font-semibold text-[#B6B1D8] mb-5">{decodeHtml(devotional.verse_ref)}</p>

      {/* Reflection */}
      {devotional.reflection && (
        showReflection ? (
          <p className="text-sm text-white/80 leading-relaxed">
            {decodeHtml(devotional.reflection)}
          </p>
        ) : (
          <button
            onClick={() => setShowReflection(true)}
            className="inline-flex items-center gap-1.5 bg-[#E0A943] text-[#1E1B2E] text-sm font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform"
          >
            Ler reflexão
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        )
      )}
    </div>
  )
}

import { decodeHtml } from '@/lib/html'
import type { Devotional } from '@/lib/types'

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  const date = new Date(devotional.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return (
    <div className="bg-[#2E2860] rounded-3xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E0A943]" />
          <span className="text-xs font-semibold text-[#E0A943] uppercase tracking-widest">
            Devocional de Hoje
          </span>
        </div>
        <span className="text-[11px] text-white/40 capitalize">{date}</span>
      </div>

      {/* Verse block */}
      <div className="bg-white/8 rounded-2xl px-5 py-4 mb-4 border border-white/10">
        <p className="font-serif-devotional italic text-base text-white/90 leading-relaxed mb-3">
          &ldquo;{decodeHtml(devotional.verse_text)}&rdquo;
        </p>
        <p className="text-sm font-semibold text-[#E0A943]">{decodeHtml(devotional.verse_ref)}</p>
      </div>

      {/* Reflection */}
      {devotional.reflection && (
        <p className="text-sm text-white/75 leading-relaxed line-clamp-3">
          {decodeHtml(devotional.reflection)}
        </p>
      )}
    </div>
  )
}

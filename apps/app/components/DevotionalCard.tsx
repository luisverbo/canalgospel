import type { Devotional } from '@/lib/types'

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  return (
    <div className="bg-[#2E2860] rounded-3xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
          Devocional de Hoje
        </span>
        <span className="text-xs text-white/40">
          {new Date(devotional.date + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long',
          })}
        </span>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 mb-4">
        <p className="italic text-sm text-white/90 leading-relaxed mb-2">
          &ldquo;{devotional.verse_text}&rdquo;
        </p>
        <p className="text-xs text-[#E0A943] font-semibold">{devotional.verse_ref}</p>
      </div>

      {devotional.reflection && (
        <p className="text-sm text-white/80 leading-relaxed line-clamp-4">
          {devotional.reflection}
        </p>
      )}
    </div>
  )
}

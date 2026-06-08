import Link from 'next/link'

interface Devotional {
  id: string
  title: string
  verse: string
  verse_reference: string
  reflection: string
  scheduled_date: string
  study_id?: string | null
}

export function DevotionalCard({ devotional }: { devotional: Devotional }) {
  return (
    <div className="bg-[#2E2860] rounded-3xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/60 uppercase tracking-widest">
          Devocional de Hoje
        </span>
        <span className="text-xs text-white/40">
          {new Date(devotional.scheduled_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
          })}
        </span>
      </div>

      <h2 className="text-xl font-bold leading-snug mb-4">{devotional.title}</h2>

      <div className="bg-white/10 rounded-2xl p-4 mb-4">
        <p className="italic text-sm text-white/90 leading-relaxed mb-2">
          "{devotional.verse}"
        </p>
        <p className="text-xs text-[#E0A943] font-semibold">{devotional.verse_reference}</p>
      </div>

      <p className="text-sm text-white/80 leading-relaxed line-clamp-3 mb-4">
        {devotional.reflection}
      </p>

      {devotional.study_id ? (
        <Link
          href={`/studies`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#E0A943]"
        >
          Ler estudo completo →
        </Link>
      ) : null}
    </div>
  )
}

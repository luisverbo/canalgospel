import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DevotionalForm } from './DevotionalForm'

export default async function DevocionalPage() {
  const supabase = await createServerSupabaseClient()

  const { data: devotionals } = await supabase
    .from('daily_devotionals')
    .select('id, date, verse_ref, verse_text, reflection, youtube_url')
    .order('date', { ascending: false })
    .limit(30)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Devocionais Diários</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Novo Devocional</h2>
          <DevotionalForm />
        </div>

        <div>
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Devocionais</h2>
          <div className="flex flex-col gap-3">
            {devotionals?.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1E1B2E] text-sm">{d.verse_ref}</p>
                    <p className="text-xs text-[#8A8797] mt-0.5 line-clamp-2">{d.verse_text}</p>
                    {d.youtube_url && (
                      <a
                        href={d.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2E2860] underline mt-0.5 block truncate"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-[#8A8797] shrink-0">
                    {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { DevotionalForm } from './DevotionalForm'

export default async function DevocionalPage() {
  const supabase = await createServerSupabaseClient()

  const { data: devotionals } = await supabase
    .from('daily_devotionals')
    .select('*')
    .order('scheduled_date', { ascending: false })
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
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Programados</h2>
          <div className="flex flex-col gap-3">
            {devotionals?.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-[#1E1B2E] text-sm">{d.title}</p>
                    <p className="text-xs text-[#8A8797] mt-0.5">{d.verse_reference}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={d.published ? 'green' : 'neutral'}>
                      {d.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <span className="text-xs text-[#8A8797]">
                      {new Date(d.scheduled_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

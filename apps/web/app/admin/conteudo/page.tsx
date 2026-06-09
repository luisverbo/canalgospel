import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { StudyModerationActions } from './StudyModerationActions'

export default async function ConteudoPage() {
  const supabase = await createServerSupabaseClient()

  const [{ data: studies }, { data: categories }] = await Promise.all([
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, status, read_time_min, created_at, preacher_id, category_id, preachers(display_name), categories(name)')
      .in('status', ['pending_review', 'draft'])
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name').order('name'),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E2860] mb-2">Moderação de Conteúdo</h1>
      <p className="text-[#8A8797] mb-6">
        {studies?.length ?? 0} estudo{studies?.length !== 1 ? 's' : ''} aguardando aprovação.
      </p>

      <div className="flex flex-col gap-4">
        {studies?.map((study) => (
          <div key={study.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="gold">Pendente</Badge>
                  {study.categories
                    ? <Badge variant="neutral">{(study.categories as { name: string }).name}</Badge>
                    : <Badge variant="red">Sem categoria</Badge>
                  }
                  {study.youtube_url && <Badge variant="indigo">YouTube</Badge>}
                </div>
                <h3 className="font-semibold text-[#1E1B2E] mb-1 line-clamp-2">{study.title}</h3>
                <p className="text-sm text-[#8A8797]">
                  {(study.preachers as { display_name: string } | null)?.display_name ?? 'Sem pregador'}
                </p>
                {study.youtube_url && (
                  <a href={study.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#2E2860] underline mt-1 inline-block">
                    Ver vídeo ↗
                  </a>
                )}
                {study.body && (
                  <p className="text-sm text-[#8A8797] mt-2 line-clamp-2">{study.body.slice(0, 200)}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <StudyModerationActions
                studyId={study.id}
                categoryId={study.category_id}
                categories={categories ?? []}
              />
            </div>
          </div>
        ))}

        {!studies?.length && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#1E1B2E]/8">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-[#8A8797]">Nenhum conteúdo pendente de revisão.</p>
          </div>
        )}
      </div>
    </div>
  )
}

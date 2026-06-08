import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { StudyModerationActions } from './StudyModerationActions'

export default async function ConteudoPage() {
  const supabase = await createServerSupabaseClient()

  const { data: studies } = await supabase
    .from('studies')
    .select('*, preachers(name, slug), categories(name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E2860] mb-2">Moderação de Conteúdo</h1>
      <p className="text-[#8A8797] mb-6">
        {studies?.length ?? 0} estudo{studies?.length !== 1 ? 's' : ''} aguardando revisão.
      </p>

      <div className="flex flex-col gap-4">
        {studies?.map((study) => (
          <div
            key={study.id}
            className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="gold">Pendente</Badge>
                  {study.categories && (
                    <Badge variant="neutral">
                      {(study.categories as { name: string }).name}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-[#1E1B2E] text-lg mb-1">
                  {study.title}
                </h3>
                <p className="text-sm text-[#8A8797] mb-2">
                  Por {(study.preachers as { name: string } | null)?.name} ·{' '}
                  {study.read_time_minutes} min de leitura
                </p>
                {study.summary && (
                  <p className="text-sm text-[#8A8797] line-clamp-2">{study.summary}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1E1B2E]/5 line-clamp-4 text-sm text-[#1E1B2E] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: study.body.slice(0, 500) + '...' }} />
            </div>

            <div className="mt-4">
              <StudyModerationActions studyId={study.id} preacherId={study.preacher_id} />
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

import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { StudyModerationActions } from './StudyModerationActions'
import Link from 'next/link'

const TAB_STATUSES = {
  pendentes: ['pending'],
  publicados: ['published'],
  rejeitados: ['rejected', 'draft'],
}

const TAB_LABELS = {
  pendentes: 'Pendentes',
  publicados: 'Publicados',
  rejeitados: 'Rejeitados / Rascunhos',
}

const STATUS_BADGE: Record<string, { label: string; variant: 'gold' | 'green' | 'red' | 'neutral' }> = {
  pending:   { label: 'Pendente',   variant: 'gold' },
  published: { label: 'Publicado',  variant: 'green' },
  rejected:  { label: 'Rejeitado',  variant: 'red' },
  draft:     { label: 'Rascunho',   variant: 'neutral' },
}

export default async function ConteudoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>
}) {
  const params = await searchParams
  const aba = (params.aba ?? 'pendentes') as keyof typeof TAB_STATUSES
  const statuses = TAB_STATUSES[aba] ?? TAB_STATUSES.pendentes

  const supabase = await createAdminSupabaseClient()

  const [studiesResult, { data: categories }] = await Promise.all([
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, status, created_at, preacher_id, category_id, preachers(display_name), categories(name)')
      .in('status', statuses)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name').order('name'),
  ])
  const studies = studiesResult.data
  const studiesError = studiesResult.error

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2E2860]">Moderação de Conteúdo</h1>
        <Link href="/admin/conteudo/novo"
          className="px-4 py-2 bg-[#2E2860] text-white rounded-xl text-sm font-semibold hover:bg-[#3D3580] transition-colors">
          + Novo Conteúdo
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[#1E1B2E]/8 p-1 w-fit">
        {(Object.keys(TAB_LABELS) as (keyof typeof TAB_LABELS)[]).map((tab) => (
          <Link
            key={tab}
            href={`/admin/conteudo?aba=${tab}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              aba === tab
                ? 'bg-[#2E2860] text-white'
                : 'text-[#8A8797] hover:text-[#1E1B2E]'
            }`}
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </div>

      <p className="text-[#8A8797] mb-4 text-sm">
        {studies?.length ?? 0} {aba === 'pendentes' ? 'aguardando aprovação' : aba === 'publicados' ? 'publicados' : 'rejeitados/rascunhos'}
      </p>

      <div className="flex flex-col gap-4">
        {studiesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-mono">
            Erro: {studiesError.message}
          </div>
        )}

        {studies?.map((study) => {
          const badge = STATUS_BADGE[study.status] ?? { label: study.status, variant: 'neutral' as const }
          return (
            <div key={study.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
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
                {study.body && study.body.trim() && (
                  <p className="text-sm text-[#8A8797] mt-2 line-clamp-2">{study.body.slice(0, 200)}</p>
                )}
              </div>

              <div className="mt-4">
                <StudyModerationActions
                  studyId={study.id}
                  categoryId={study.category_id}
                  categories={categories ?? []}
                  currentStatus={study.status}
                />
              </div>
            </div>
          )
        })}

        {!studies?.length && !studiesError && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#1E1B2E]/8">
            <p className="text-4xl mb-3">{aba === 'pendentes' ? '✅' : '📭'}</p>
            <p className="text-[#8A8797]">
              {aba === 'pendentes' ? 'Nenhum conteúdo pendente.' : 'Nenhum conteúdo aqui.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

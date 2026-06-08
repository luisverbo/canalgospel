import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ParceiroDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: preacher } = await supabase
    .from('preachers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!preacher) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🕊</p>
        <h2 className="text-xl font-bold text-[#2E2860] mb-2">Bem-vindo ao Canal Gospel!</h2>
        <p className="text-[#8A8797] mb-6">Seu perfil de parceiro ainda está sendo configurado.</p>
        <Link href="/parceiro/perfil" className="px-6 py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm">
          Completar Perfil
        </Link>
      </div>
    )
  }

  const { data: studies } = await supabase
    .from('studies')
    .select('id, title, status, view_count, published_at')
    .eq('preacher_id', preacher.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const publishedCount = studies?.filter((s) => s.status === 'published').length ?? 0
  const pendingCount = studies?.filter((s) => s.status === 'pending_review').length ?? 0

  const statusLabel = {
    draft: 'Rascunho',
    pending_review: 'Em Revisão',
    published: 'Publicado',
    rejected: 'Rejeitado',
  }

  const statusVariant = {
    draft: 'neutral',
    pending_review: 'gold',
    published: 'green',
    rejected: 'red',
  } as const

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2860]">Olá, {preacher.name} 👋</h1>
        {preacher.status === 'pending' && (
          <div className="mt-3 bg-[#E0A943]/10 border border-[#E0A943]/30 rounded-xl px-4 py-3">
            <p className="text-sm text-[#B07A20] font-medium">
              Seu perfil está aguardando aprovação. Você poderá publicar estudos após a aprovação.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#2E2860]">{preacher.total_studies}</p>
          <p className="text-xs text-[#8A8797] mt-1">Estudos Publicados</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#2E2860]">{preacher.total_views.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#8A8797] mt-1">Total de Leituras</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#E0A943]">{pendingCount}</p>
          <p className="text-xs text-[#8A8797] mt-1">Em Revisão</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1E1B2E]">Últimos Estudos</h2>
          <Link href="/parceiro/estudos" className="text-sm font-medium text-[#2E2860]">
            Ver todos →
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
          {studies?.map((study) => (
            <div key={study.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1E1B2E] truncate">{study.title}</p>
                {study.published_at && (
                  <p className="text-xs text-[#8A8797]">
                    {new Date(study.published_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-[#8A8797]">{study.view_count} views</span>
                <Badge variant={statusVariant[study.status as keyof typeof statusVariant]}>
                  {statusLabel[study.status as keyof typeof statusLabel]}
                </Badge>
              </div>
            </div>
          ))}
          {!studies?.length && (
            <p className="text-center text-[#8A8797] py-8">Nenhum estudo ainda.</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Em Revisão',
  published: 'Publicado',
  rejected: 'Rejeitado',
}
const statusVariant: Record<string, 'neutral' | 'gold' | 'green' | 'red'> = {
  draft: 'neutral',
  pending: 'gold',
  published: 'green',
  rejected: 'red',
}

export default async function ParceiroDashboardPage() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = await createAdminSupabaseClient()

  const { data: preacher } = await supabase
    .from('preachers')
    .select('id, display_name, status, auto_publish')
    .eq('id', user.id)
    .single()

  if (!preacher) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🕊</p>
        <h2 className="text-xl font-bold text-[#2E2860] mb-2">Bem-vindo ao Canal Gospel!</h2>
        <p className="text-[#8A8797]">Seu perfil de parceiro ainda não foi configurado. Fale com o administrador.</p>
      </div>
    )
  }

  const { data: studies } = await supabase
    .from('studies')
    .select('id, title, status, view_count, published_at, created_at')
    .eq('preacher_id', preacher.id)
    .order('created_at', { ascending: false })

  const all = studies ?? []
  const publishedCount = all.filter((s) => s.status === 'published').length
  const pendingCount = all.filter((s) => s.status === 'pending').length
  const totalViews = all
    .filter((s) => s.status === 'published')
    .reduce((sum, s) => sum + (s.view_count ?? 0), 0)

  const recent = all.slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2860]">Olá, {preacher.display_name} 👋</h1>
        {preacher.status === 'disabled' && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700 font-medium">
              Seu acesso está desativado. Fale com o administrador.
            </p>
          </div>
        )}
        {preacher.status === 'active' && (
          <p className="text-sm text-[#8A8797] mt-1">
            {preacher.auto_publish
              ? 'Você é um parceiro confiável: seus estudos são publicados sem aprovação.'
              : 'Seus estudos passam por moderação antes de serem publicados.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#2E2860]">{publishedCount}</p>
          <p className="text-xs text-[#8A8797] mt-1">Publicados</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#E0A943]">{pendingCount}</p>
          <p className="text-xs text-[#8A8797] mt-1">Em Revisão</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 text-center">
          <p className="text-3xl font-bold text-[#2E2860]">{totalViews.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#8A8797] mt-1">Leituras</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1E1B2E]">Últimos Estudos</h2>
          <Link href="/parceiro/estudos" className="text-sm font-medium text-[#2E2860]">Ver todos →</Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
          {recent.map((study) => (
            <Link key={study.id} href={`/parceiro/estudos/${study.id}`}
              className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF7F1]">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1E1B2E] truncate">{study.title}</p>
                {study.published_at && (
                  <p className="text-xs text-[#8A8797]">
                    {new Date(study.published_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <Badge variant={statusVariant[study.status] ?? 'neutral'}>
                {statusLabel[study.status] ?? study.status}
              </Badge>
            </Link>
          ))}
          {!recent.length && <p className="text-center text-[#8A8797] py-8">Nenhum estudo ainda.</p>}
        </div>
      </div>
    </div>
  )
}

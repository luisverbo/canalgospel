import { createAdminSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createAdminSupabaseClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalStudies },
    { count: pendingStudies },
    { count: totalPreachers },
    { count: totalSubscribers },
    { count: dauCount },
    { data: recentStudies },
    { data: studyRows },
    { data: preacherRows },
  ] = await Promise.all([
    supabase.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('preachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('recorded_at', today),
    supabase
      .from('studies')
      .select('id, title, slug, published_at, preachers(display_name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5),
    supabase.from('studies').select('preacher_id, status'),
    supabase.from('preachers').select('id, display_name').eq('status', 'active'),
  ])

  // Top pregadores por nº de estudos publicados
  const counts = new Map<string, number>()
  for (const s of studyRows ?? []) {
    if (s.preacher_id && s.status === 'published') {
      counts.set(s.preacher_id, (counts.get(s.preacher_id) ?? 0) + 1)
    }
  }
  const topPreachers = (preacherRows ?? [])
    .map((p) => ({ ...p, count: counts.get(p.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats = [
    { label: 'Estudos Publicados', value: totalStudies ?? 0 },
    { label: 'Aguardando Revisão', value: pendingStudies ?? 0 },
    { label: 'Pregadores Ativos', value: totalPreachers ?? 0 },
    { label: 'Assinantes Ativos', value: totalSubscribers ?? 0 },
    { label: 'Usuários Hoje (DAU)', value: dauCount ?? 0 },
  ]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[#2E2860]">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#1E1B2E]/8 shadow-sm">
            <p className="text-3xl font-bold text-[#1E1B2E]">{stat.value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-[#8A8797] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Estudos recentes</h2>
          <div className="flex flex-col gap-3">
            {recentStudies?.map((study, i) => (
              <div key={study.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8A8797] w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1B2E] truncate">{study.title}</p>
                  <p className="text-xs text-[#8A8797]">
                    {(study.preachers as { display_name: string } | null)?.display_name ?? 'Sem pregador'}
                  </p>
                </div>
                {study.published_at && (
                  <span className="text-xs text-[#8A8797]">
                    {new Date(study.published_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
            {!recentStudies?.length && <p className="text-sm text-[#8A8797]">Nenhum estudo publicado.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1E1B2E]">Top pregadores</h2>
            <Link href="/admin/parceiros" className="text-xs font-medium text-[#2E2860]">Ver todos →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {topPreachers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8A8797] w-5">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1E1B2E]">{p.display_name}</p>
                </div>
                <span className="text-sm font-semibold text-[#2E2860]">{p.count} estudos</span>
              </div>
            ))}
            {!topPreachers.length && <p className="text-sm text-[#8A8797]">Nenhum pregador ativo.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

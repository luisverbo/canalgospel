import { createServerSupabaseClient } from '@canal-gospel/supabase'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalStudies },
    { count: pendingStudies },
    { count: totalPreachers },
    { count: totalSubscribers },
    { count: dauCount },
    { data: topStudies },
    { data: topPreachers },
  ] = await Promise.all([
    supabase.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('preachers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('recorded_at', today),
    supabase
      .from('studies')
      .select('id, title, slug, view_count, preachers(name)')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(5),
    supabase
      .from('preachers')
      .select('id, name, slug, total_studies, total_views')
      .eq('status', 'approved')
      .order('total_views', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Estudos Publicados', value: totalStudies ?? 0, color: 'bg-[#2E2860]' },
    { label: 'Aguardando Revisão', value: pendingStudies ?? 0, color: 'bg-[#E0A943]' },
    { label: 'Pregadores Ativos', value: totalPreachers ?? 0, color: 'bg-emerald-600' },
    { label: 'Assinantes Ativos', value: totalSubscribers ?? 0, color: 'bg-purple-600' },
    { label: 'Usuários Hoje (DAU)', value: dauCount ?? 0, color: 'bg-sky-600' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[#2E2860]">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-[#1E1B2E]/8 shadow-sm"
          >
            <p className="text-3xl font-bold text-[#1E1B2E]">
              {stat.value.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-[#8A8797] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Estudos mais lidos</h2>
          <div className="flex flex-col gap-3">
            {topStudies?.map((study, i) => (
              <div key={study.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8A8797] w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E1B2E] truncate">{study.title}</p>
                  <p className="text-xs text-[#8A8797]">
                    {(study.preachers as { name: string } | null)?.name}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#2E2860]">
                  {study.view_count.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Top pregadores</h2>
          <div className="flex flex-col gap-3">
            {topPreachers?.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8A8797] w-5">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1E1B2E]">{p.name}</p>
                  <p className="text-xs text-[#8A8797]">{p.total_studies} estudos</p>
                </div>
                <span className="text-sm font-semibold text-[#2E2860]">
                  {p.total_views.toLocaleString('pt-BR')} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

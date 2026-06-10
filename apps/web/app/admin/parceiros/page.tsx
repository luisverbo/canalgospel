import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { PreacherActions } from './PreacherActions'
import Link from 'next/link'

const statusColor = {
  pending: 'gold',
  active: 'green',
  disabled: 'red',
} as const

const statusLabel = {
  pending: 'Pendente',
  active: 'Ativo',
  disabled: 'Desativado',
}

export default async function ParceirosPage() {
  const supabase = await createAdminSupabaseClient()

  const [{ data: preachers }, { data: studyRows }] = await Promise.all([
    supabase
      .from('preachers')
      .select('id, display_name, slug, church, city, status, auto_publish, photo_url, profiles(email)')
      .order('created_at', { ascending: false }),
    supabase.from('studies').select('preacher_id, status'),
  ])

  // contagem de estudos publicados por pregador
  const counts = new Map<string, number>()
  for (const s of studyRows ?? []) {
    if (s.preacher_id && s.status === 'published') {
      counts.set(s.preacher_id, (counts.get(s.preacher_id) ?? 0) + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2E2860]">Parceiros</h1>
        <Link
          href="/admin/parceiros/novo"
          className="px-4 py-2 bg-[#2E2860] text-white rounded-xl text-sm font-semibold hover:bg-[#3D3580] transition-colors"
        >
          + Novo Parceiro
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAF7F1] border-b border-[#1E1B2E]/8">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">Pregador</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">Igreja / Cidade</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">Estudos</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">Confiança</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1B2E]/5">
            {preachers?.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAF7F1]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.display_name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-[#2E2860]/10 flex items-center justify-center text-sm font-bold text-[#2E2860]">
                        {p.display_name?.[0] ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#1E1B2E]">{p.display_name}</p>
                      <p className="text-xs text-[#8A8797]">
                        {(p.profiles as { email: string } | null)?.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#8A8797]">
                  {[p.church, p.city].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-5 py-4 text-sm text-[#1E1B2E]">{counts.get(p.id) ?? 0}</td>
                <td className="px-5 py-4">
                  {p.auto_publish ? (
                    <Badge variant="green">Confiável</Badge>
                  ) : (
                    <Badge variant="neutral">Moderado</Badge>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                </td>
                <td className="px-5 py-4">
                  <PreacherActions
                    preacherId={p.id}
                    currentStatus={p.status}
                    autoPublish={p.auto_publish}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!preachers?.length && (
          <p className="text-center text-[#8A8797] py-12">Nenhum parceiro ainda. Crie o primeiro.</p>
        )}
      </div>
    </div>
  )
}

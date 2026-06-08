import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { PreacherActions } from './PreacherActions'

export default async function ParceirosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: preachers } = await supabase
    .from('preachers')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  const statusColor = {
    pending: 'gold',
    approved: 'green',
    disabled: 'red',
  } as const

  const statusLabel = {
    pending: 'Pendente',
    approved: 'Aprovado',
    disabled: 'Desativado',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E2860] mb-6">Parceiros</h1>

      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAF7F1] border-b border-[#1E1B2E]/8">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">
                Pregador
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">
                Igreja / Cidade
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">
                Estudos
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1B2E]/5">
            {preachers?.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAF7F1]">
                <td className="px-5 py-4">
                  <p className="font-medium text-[#1E1B2E]">{p.name}</p>
                  <p className="text-xs text-[#8A8797]">
                    {(p.profiles as { email: string } | null)?.email}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-[#8A8797]">
                  {[p.church, p.city, p.state].filter(Boolean).join(' · ')}
                </td>
                <td className="px-5 py-4 text-sm text-[#1E1B2E]">{p.total_studies}</td>
                <td className="px-5 py-4">
                  <Badge variant={statusColor[p.status]}>
                    {statusLabel[p.status]}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <PreacherActions preacherId={p.id} currentStatus={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!preachers?.length && (
          <p className="text-center text-[#8A8797] py-12">Nenhum parceiro encontrado.</p>
        )}
      </div>
    </div>
  )
}

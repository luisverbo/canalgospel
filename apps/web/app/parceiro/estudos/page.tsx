import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ParceiroEstudosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: preacher } = await supabase
    .from('preachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const { data: studies } = preacher
    ? await supabase
        .from('studies')
        .select('*, categories(name)')
        .eq('preacher_id', preacher.id)
        .order('created_at', { ascending: false })
    : { data: [] }

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2E2860]">Meus Estudos</h1>
        <Link
          href="/parceiro/estudos/novo"
          className="px-5 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] transition-colors"
        >
          + Novo Estudo
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAF7F1] border-b border-[#1E1B2E]/8">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Título</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Categoria</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Views</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1B2E]/5">
            {studies?.map((study) => (
              <tr key={study.id} className="hover:bg-[#FAF7F1]">
                <td className="px-5 py-4">
                  <p className="font-medium text-sm text-[#1E1B2E] max-w-xs truncate">{study.title}</p>
                  {study.rejection_reason && (
                    <p className="text-xs text-red-600 mt-0.5 max-w-xs truncate">{study.rejection_reason}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-[#8A8797]">
                  {(study.categories as { name: string } | null)?.name ?? '—'}
                </td>
                <td className="px-5 py-4 text-sm text-[#1E1B2E]">{study.view_count}</td>
                <td className="px-5 py-4">
                  <Badge variant={statusVariant[study.status as keyof typeof statusVariant]}>
                    {statusLabel[study.status as keyof typeof statusLabel]}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/parceiro/estudos/${study.id}`}
                    className="text-xs font-medium text-[#2E2860] hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!studies?.length && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-[#8A8797]">Você ainda não tem estudos.</p>
            <Link href="/parceiro/estudos/novo" className="mt-4 inline-block text-sm font-medium text-[#2E2860]">
              Criar primeiro estudo →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

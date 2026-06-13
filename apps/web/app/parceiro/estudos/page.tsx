import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PartnerStudyDeleteButton } from './PartnerStudyDeleteButton'

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

export default async function ParceiroEstudosPage() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  let studies: Array<{
    id: string
    title: string
    status: string
    content_type: string | null
    youtube_url: string | null
    published_at: string | null
    categories: { name: string } | null
  }> | null = null

  try {
    const supabase = await createAdminSupabaseClient()
    const { data } = await supabase
      .from('studies')
      .select('id, title, status, content_type, youtube_url, published_at, categories(name)')
      .eq('preacher_id', user.id)
      .order('created_at', { ascending: false })
    studies = data as typeof studies
  } catch (err) {
    console.error('[parceiro/estudos] erro ao carregar estudos:', err)
  }

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
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Categoria</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E1B2E]/5">
            {studies?.map((study) => {
              const isVideo = study.content_type === 'video' || !!study.youtube_url
              return (
                <tr key={study.id} className="hover:bg-[#FAF7F1]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-sm text-[#1E1B2E] max-w-xs truncate">{study.title}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#8A8797]">{isVideo ? '▶ Vídeo' : '📝 Texto'}</td>
                  <td className="px-5 py-4 text-sm text-[#8A8797]">
                    {(study.categories as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[study.status] ?? 'neutral'}>
                      {statusLabel[study.status] ?? study.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/parceiro/estudos/${study.id}`} className="text-xs font-medium text-[#2E2860] hover:underline">
                        Editar
                      </Link>
                      <PartnerStudyDeleteButton studyId={study.id} title={study.title} />
                    </div>
                  </td>
                </tr>
              )
            })}
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

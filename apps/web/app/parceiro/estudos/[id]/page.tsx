import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PartnerStudyForm } from '../PartnerStudyForm'

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Em revisão',
  published: 'Publicado',
  rejected: 'Rejeitado',
}

export default async function EditarEstudoParceiroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = await createAdminSupabaseClient()

  const [{ data: study }, { data: categories }] = await Promise.all([
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, category_id, content_type, cover_url, audio_url, status, preacher_id')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('categories').select('id, name, kind').order('name'),
  ])

  // Ownership: só o dono pode editar
  if (!study || study.preacher_id !== user.id) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/parceiro/estudos" className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
          ← Voltar para Meus Estudos
        </Link>
        <h1 className="text-2xl font-bold text-[#2E2860] mt-2">Editar Estudo</h1>
        <p className="text-sm text-[#8A8797] mt-1">Status atual: {statusLabel[study.status] ?? study.status}</p>
      </div>
      <PartnerStudyForm categories={categories ?? []} study={study} />
    </div>
  )
}

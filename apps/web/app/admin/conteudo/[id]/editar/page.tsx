import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EditStudyForm } from './EditStudyForm'

export default async function EditarConteudoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createAdminSupabaseClient()

  const [{ data: study }, { data: categories }] = await Promise.all([
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, category_id, content_type')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('categories').select('id, name, type').order('name'),
  ])

  if (!study) notFound()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/conteudo" className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
          ← Voltar para Conteúdo
        </Link>
        <h1 className="text-2xl font-bold text-[#2E2860] mt-2">Editar Conteúdo</h1>
        <p className="text-[#8A8797] mt-1">Edite o título, a descrição e a categoria</p>
      </div>
      <EditStudyForm study={study} categories={categories ?? []} />
    </div>
  )
}

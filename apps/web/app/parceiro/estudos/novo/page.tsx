import { createServerSupabaseClient } from '@canal-gospel/supabase'
import { redirect } from 'next/navigation'
import { StudyEditorForm } from './StudyEditorForm'

export default async function NovoEstudoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: preacher }, { data: categories }] = await Promise.all([
    supabase.from('preachers').select('id, status').eq('profile_id', user.id).single(),
    supabase.from('categories').select('id, name, type').eq('active', true).order('sort_order'),
  ])

  if (!preacher || preacher.status !== 'approved') {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-[#8A8797]">
          Seu perfil precisa ser aprovado antes de publicar estudos.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E2860] mb-6">Novo Estudo</h1>
      <StudyEditorForm
        preacherId={preacher.id}
        categories={categories?.map((c) => ({ id: c.id, name: c.name, type: c.type })) ?? []}
      />
    </div>
  )
}

import { createServerSupabaseClient } from '@canal-gospel/supabase'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'

export default async function ParceiroPerfilPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: preacher } = await supabase
    .from('preachers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2E2860] mb-6">Meu Perfil Público</h1>
      <ProfileForm userId={user.id} preacher={preacher ?? null} />
    </div>
  )
}

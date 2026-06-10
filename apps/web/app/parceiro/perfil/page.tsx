import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'

export default async function ParceiroPerfilPage() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createAdminSupabaseClient()
  const { data: preacher } = await supabase
    .from('preachers')
    .select('id, slug, display_name, bio, church, city, photo_url, instagram, whatsapp, pix_key')
    .eq('id', user.id)
    .single()

  if (!preacher) {
    return (
      <div className="text-center py-16">
        <p className="text-[#8A8797]">Perfil de pregador não encontrado. Fale com o administrador.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2E2860]">Meu Perfil Público</h1>
        <p className="text-[#8A8797] mt-1">
          Visível em <span className="font-mono">/profile/{preacher.slug}</span>
        </p>
      </div>
      <ProfileForm preacher={preacher} />
    </div>
  )
}

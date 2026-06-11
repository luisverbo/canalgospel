import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from './server'

export async function requirePartner() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await sessionClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'partner' && profile?.role !== 'admin') {
    redirect('/')
  }

  const admin = await createAdminSupabaseClient()

  const { data: preacher } = await admin
    .from('preachers')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!preacher) redirect('/parceiro?sem-perfil=1')

  return { supabase: admin, preacher, userId: user.id }
}

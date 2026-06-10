import { createServerSupabaseClient, createAdminSupabaseClient } from './server'

/**
 * Garante que há um usuário logado com papel 'partner' (ou 'admin'), validado
 * pela sessão via cookies, e que existe um registro de pregador vinculado.
 * Retorna um client com service role para gravações seguras + o pregador.
 * Lança se não autenticado, sem permissão, ou sem registro de pregador.
 *
 * O vínculo é por id: preachers.id === profiles.id === auth user id.
 */
export async function requirePartner() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await sessionClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'partner' && profile?.role !== 'admin') {
    throw new Error('Acesso negado: apenas parceiros')
  }

  const admin = createAdminSupabaseClient()

  const { data: preacher } = await admin
    .from('preachers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!preacher) throw new Error('Perfil de pregador não encontrado')

  return { supabase: admin, preacher, userId: user.id }
}

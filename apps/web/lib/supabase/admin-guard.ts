import { createServerSupabaseClient, createAdminSupabaseClient } from './server'

/**
 * Garante que há um usuário logado com papel 'admin' (validado pela sessão via
 * cookies), e retorna um client com service role para gravações seguras.
 * Lança se o usuário não estiver autenticado ou não for admin.
 */
export async function requireAdminClient() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await sessionClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Acesso negado: apenas administradores')

  return createAdminSupabaseClient()
}

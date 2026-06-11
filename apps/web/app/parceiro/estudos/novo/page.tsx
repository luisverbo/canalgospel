import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PartnerStudyForm } from '../PartnerStudyForm'

export default async function NovoEstudoPage() {
  const sessionClient = await createServerSupabaseClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = await createAdminSupabaseClient()

  const [{ data: preacher }, { data: categories }] = await Promise.all([
    supabase.from('preachers').select('id, status').eq('id', user.id).maybeSingle(),
    supabase.from('categories').select('id, name, kind').order('name'),
  ])

  if (!preacher || preacher.status === 'disabled') {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔒</p>
        <p className="text-[#8A8797]">Seu acesso está desativado. Fale com o administrador.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/parceiro/estudos" className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
          ← Voltar para Meus Estudos
        </Link>
        <h1 className="text-2xl font-bold text-[#2E2860] mt-2">Novo Estudo</h1>
      </div>
      <PartnerStudyForm categories={categories ?? []} />
    </div>
  )
}

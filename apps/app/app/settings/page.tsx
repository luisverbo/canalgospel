import { SettingsClient } from './SettingsClient'
import { createClient } from '@canal-gospel/supabase'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let subscription = null
  if (session?.user?.id) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single()
    subscription = data
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860] mb-6">Configurações</h1>
      <SettingsClient
        user={session?.user ?? null}
        subscription={subscription}
      />
    </div>
  )
}

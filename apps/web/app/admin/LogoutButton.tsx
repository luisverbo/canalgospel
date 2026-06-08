'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left text-xs text-white/50 hover:text-white transition-colors"
    >
      Sair →
    </button>
  )
}

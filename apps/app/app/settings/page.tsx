'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { SettingsClient } from './SettingsClient'
import type { User } from '@supabase/supabase-js'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860] mb-6">Configurações</h1>
      {!loading && <SettingsClient user={user} subscription={null} />}
    </div>
  )
}

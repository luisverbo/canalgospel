'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PreacherActions({
  preacherId,
  currentStatus,
}: {
  preacherId: string
  currentStatus: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: 'approved' | 'disabled' | 'pending') => {
    setLoading(true)
    await supabase.from('preachers').update({ status }).eq('id', preacherId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== 'approved' && (
        <button
          onClick={() => updateStatus('approved')}
          disabled={loading}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          Aprovar
        </button>
      )}
      {currentStatus !== 'disabled' && (
        <button
          onClick={() => updateStatus('disabled')}
          disabled={loading}
          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          Desativar
        </button>
      )}
    </div>
  )
}

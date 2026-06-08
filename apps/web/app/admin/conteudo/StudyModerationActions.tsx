'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function StudyModerationActions({
  studyId,
  preacherId,
}: {
  studyId: string
  preacherId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const approve = async () => {
    setLoading(true)
    await supabase
      .from('studies')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', studyId)
    // Increment total_studies for preacher
    await supabase.rpc('increment_preacher_studies' as never, { preacher_id: preacherId })
    router.refresh()
    setLoading(false)
  }

  const reject = async () => {
    if (!reason.trim()) return
    setLoading(true)
    await supabase
      .from('studies')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', studyId)
    router.refresh()
    setLoading(false)
  }

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição..."
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={reject}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Confirmar Rejeição
          </button>
          <button
            onClick={() => setRejecting(false)}
            className="px-4 py-2 bg-[#1E1B2E]/5 text-[#8A8797] rounded-lg text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={approve}
        disabled={loading}
        className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        ✓ Aprovar
      </button>
      <button
        onClick={() => setRejecting(true)}
        disabled={loading}
        className="px-5 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        ✗ Rejeitar
      </button>
    </div>
  )
}

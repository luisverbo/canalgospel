'use client'

import { useState } from 'react'
import { approveStudy, rejectStudy } from './actions'

export function StudyModerationActions({ studyId }: { studyId: string }) {
  const [loading, setLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await approveStudy(studyId)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await rejectStudy(studyId)
    setRejecting(false)
    setLoading(false)
  }

  if (rejecting) {
    return (
      <div className="flex gap-2">
        <button onClick={handleReject} disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
        </button>
        <button onClick={() => setRejecting(false)}
          className="px-4 py-2 bg-[#1E1B2E]/5 text-[#8A8797] rounded-lg text-sm">
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <button onClick={handleApprove} disabled={loading}
        className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
        {loading ? '...' : '✓ Aprovar'}
      </button>
      <button onClick={() => setRejecting(true)} disabled={loading}
        className="px-5 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
        ✗ Rejeitar
      </button>
    </div>
  )
}

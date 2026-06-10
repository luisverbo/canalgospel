'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setPartnerStatus, setPartnerAutoPublish } from './actions'

export function PreacherActions({
  preacherId,
  currentStatus,
  autoPublish,
}: {
  preacherId: string
  currentStatus: 'pending' | 'active' | 'disabled'
  autoPublish: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [trusted, setTrusted] = useState(autoPublish)

  const toggleTrust = () => {
    const next = !trusted
    setTrusted(next)
    startTransition(async () => {
      await setPartnerAutoPublish(preacherId, next)
      router.refresh()
    })
  }

  const changeStatus = (status: 'active' | 'disabled') => {
    startTransition(async () => {
      await setPartnerStatus(preacherId, status)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={toggleTrust}
        disabled={isPending}
        title="Publica sem aprovação"
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          trusted
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-[#1E1B2E]/5 text-[#8A8797] hover:bg-[#1E1B2E]/10'
        }`}
      >
        {trusted ? '✓ Confiável' : 'Tornar confiável'}
      </button>

      {currentStatus !== 'disabled' ? (
        <button
          onClick={() => changeStatus('disabled')}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          Desativar
        </button>
      ) : (
        <button
          onClick={() => changeStatus('active')}
          disabled={isPending}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          Reativar
        </button>
      )}

      <Link
        href={`/admin/parceiros/${preacherId}/editar`}
        className="px-3 py-1.5 border border-[#1E1B2E]/15 text-[#2E2860] rounded-lg text-xs font-semibold hover:bg-[#2E2860]/5 transition-colors"
      >
        Editar
      </Link>
    </div>
  )
}

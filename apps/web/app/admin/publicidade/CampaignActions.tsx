'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CampaignForm } from './CampaignForm'
import { toggleCampaignActive, deleteCampaign } from './actions'

interface Campaign {
  id: string
  advertiser_name: string
  target_url: string
  slot: string
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  weight: number | null
  is_active: boolean
}

export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)

  const run = async (fn: () => Promise<unknown>) => {
    setPending(true)
    await fn()
    setPending(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="mt-4 border-t border-[#1E1B2E]/8 pt-4">
        <CampaignForm campaign={campaign} onClose={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      <button
        onClick={() => run(() => toggleCampaignActive(campaign.id, !campaign.is_active))}
        disabled={pending}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
          campaign.is_active
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-[#1E1B2E]/5 text-[#8A8797] hover:bg-[#1E1B2E]/10'
        }`}
      >
        {campaign.is_active ? '● Ativo' : '○ Inativo'}
      </button>

      <button onClick={() => setEditing(true)} disabled={pending}
        className="px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-xs font-semibold text-[#2E2860] hover:bg-[#2E2860]/5 disabled:opacity-50">
        Editar
      </button>

      {confirmDelete ? (
        <>
          <span className="text-xs text-red-700 font-medium">Confirmar?</span>
          <button onClick={() => run(() => deleteCampaign(campaign.id))} disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50">
            Excluir
          </button>
          <button onClick={() => setConfirmDelete(false)}
            className="px-3 py-1.5 rounded-lg bg-[#1E1B2E]/5 text-[#8A8797] text-xs">
            Cancelar
          </button>
        </>
      ) : (
        <button onClick={() => setConfirmDelete(true)} disabled={pending}
          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 disabled:opacity-50">
          Excluir
        </button>
      )}
    </div>
  )
}

export function NewCampaignButton() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#2E2860] text-white rounded-xl text-sm font-semibold hover:bg-[#3D3580] transition-colors">
        + Nova Campanha
      </button>
    )
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 mb-6">
      <h2 className="font-semibold text-[#1E1B2E] mb-4">Nova campanha</h2>
      <CampaignForm onClose={() => setOpen(false)} />
    </div>
  )
}

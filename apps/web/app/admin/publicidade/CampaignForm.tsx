'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign, updateCampaign } from './actions'
import { uploadAdImage } from './upload-actions'

interface Campaign {
  id: string
  title: string
  advertiser: string
  destination_url: string
  placement: 'banner' | 'interstitial' | 'native'
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  budget_impressions: number | null
}

const PLACEMENTS = [
  { value: 'banner', label: 'Banner (faixa fixa)' },
  { value: 'native', label: 'Feed Nativo (entre estudos)' },
  { value: 'interstitial', label: 'Intersticial' },
]

export function CampaignForm({
  campaign,
  onClose,
}: {
  campaign?: Campaign
  onClose: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(campaign?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadAdImage(fd)
    setUploading(false)
    if (res.error) { setError(res.error); return }
    setImageUrl(res.url ?? '')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('image_url', imageUrl)
    const res = campaign ? await updateCampaign(campaign.id, fd) : await createCampaign(fd)
    setLoading(false)
    if (res?.error) { setError(res.error); return }
    router.refresh()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Nome interno</label>
          <input name="title" required defaultValue={campaign?.title}
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Anunciante</label>
          <input name="advertiser" required defaultValue={campaign?.advertiser}
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">URL de destino</label>
        <input name="destination_url" type="url" required defaultValue={campaign?.destination_url}
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">Slot</label>
        <select name="placement" required defaultValue={campaign?.placement ?? 'banner'}
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] bg-white">
          {PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">Imagem do anúncio</label>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt="preview" className="h-16 w-28 rounded-lg object-cover border border-[#1E1B2E]/10" />
          )}
          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm font-medium text-[#2E2860] hover:bg-[#2E2860]/5 disabled:opacity-50">
            {uploading ? 'Enviando...' : imageUrl ? 'Trocar imagem' : 'Carregar imagem'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Início</label>
          <input name="starts_at" type="date" defaultValue={campaign?.starts_at?.slice(0, 10) ?? ''}
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Fim</label>
          <input name="ends_at" type="date" defaultValue={campaign?.ends_at?.slice(0, 10) ?? ''}
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Limite de impressões</label>
          <input name="budget_impressions" type="number" min="0"
            defaultValue={campaign?.budget_impressions ?? ''}
            placeholder="Ilimitado"
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-5 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm font-medium text-[#8A8797] hover:text-[#1E1B2E]">
          Cancelar
        </button>
        <button type="submit" disabled={loading || uploading}
          className="px-5 py-2 rounded-xl bg-[#2E2860] text-white text-sm font-semibold hover:bg-[#3D3580] disabled:opacity-50">
          {loading ? 'Salvando...' : campaign ? 'Salvar alterações' : 'Criar campanha'}
        </button>
      </div>
    </form>
  )
}

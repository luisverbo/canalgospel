'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign, updateCampaign } from './actions'
import { uploadAdImage } from './upload-actions'

interface Campaign {
  id: string
  advertiser_name: string
  target_url: string
  slot: string
  image_url: string | null
  starts_at: string | null
  ends_at: string | null
  weight: number | null
}

const SLOTS = [
  { value: 'banner', label: 'Banner (faixa fixa)', hint: '640 × 100 px (JPG ou PNG)', ratio: 6.4 },
  { value: 'feed_native', label: 'Feed Nativo (entre estudos)', hint: '600 × 500 px (JPG ou PNG)', ratio: 1.2 },
  { value: 'interstitial', label: 'Intersticial (tela cheia)', hint: '1080 × 1920 px (JPG ou PNG)', ratio: 0.5625 },
]

function checkAspectRatio(file: File, expectedRatio: number): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const actual = img.width / img.height
      const deviation = Math.abs(actual - expectedRatio) / expectedRatio
      resolve(deviation > 0.25 ? `Proporção da imagem (${img.width}×${img.height}) está muito diferente do recomendado para este slot.` : null)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export function CampaignForm({
  campaign,
  onClose,
}: {
  campaign?: Campaign
  onClose: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(campaign?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [slot, setSlot] = useState(campaign?.slot ?? 'banner')
  const fileRef = useRef<HTMLInputElement>(null)

  const currentSlot = SLOTS.find((s) => s.value === slot) ?? SLOTS[0]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setWarning('')

    const ratioWarning = await checkAspectRatio(file, currentSlot.ratio)
    if (ratioWarning) setWarning(ratioWarning)

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
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Anunciante</label>
          <input name="advertiser_name" required defaultValue={campaign?.advertiser_name}
            placeholder="Ex.: Livraria Esperança"
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Peso (prioridade)</label>
          <input name="weight" type="number" min="1" defaultValue={campaign?.weight ?? 1}
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">URL de destino</label>
        <input name="target_url" type="url" required defaultValue={campaign?.target_url}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">Slot</label>
        <select name="slot" required value={slot} onChange={(e) => setSlot(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] bg-white">
          {SLOTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">
          Imagem do anúncio
          <span className="ml-2 font-normal text-[#8A8797]">Recomendado: {currentSlot.hint}</span>
        </label>
        {warning && (
          <p className="mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            ⚠️ {warning}
          </p>
        )}
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt="preview"
              className="h-14 rounded-lg object-cover border border-[#1E1B2E]/10"
              style={{ aspectRatio: String(currentSlot.ratio) }} />
          )}
          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm font-medium text-[#2E2860] hover:bg-[#2E2860]/5 disabled:opacity-50">
            {uploading ? 'Enviando...' : imageUrl ? 'Trocar imagem' : 'Carregar imagem'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      {/* Only show "activate" toggle when creating a new campaign */}
      {!campaign && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="hidden" name="is_active" value="false" />
          <input
            type="checkbox"
            name="is_active"
            value="true"
            defaultChecked
            className="h-4 w-4 rounded border-[#1E1B2E]/20 text-[#2E2860] cursor-pointer"
          />
          <span className="text-sm text-[#1E1B2E]">Ativar campanha imediatamente</span>
        </label>
      )}

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

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateMyProfile } from './actions'
import { uploadPartnerImage } from '../upload-actions'

interface Preacher {
  id: string
  display_name: string
  bio: string | null
  church: string | null
  city: string | null
  photo_url: string | null
  instagram: string | null
  whatsapp: string | null
  pix_key: string | null
}

export function ProfileForm({ preacher }: { preacher: Preacher }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState(preacher.photo_url ?? '')
  const [photoPreview, setPhotoPreview] = useState(preacher.photo_url ?? '')
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2860] placeholder-[#8A8797]'

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadPartnerImage(fd)
      if (result.error || !result.url) throw new Error(result.error ?? 'Falha no upload')
      setPhotoUrl(result.url)
      setPhotoPreview(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload da foto')
    } finally {
      setPhotoUploading(false)
      if (photoRef.current) photoRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    fd.set('photo_url', photoUrl)
    const result = await updateMyProfile(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
      {success && <p className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm font-medium">Perfil atualizado!</p>}
      {error && <p className="bg-red-50 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</p>}

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Foto</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <img src={photoPreview} alt="Foto" className="h-16 w-16 rounded-full object-cover border border-[#1E1B2E]/10" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#2E2860]/10 flex items-center justify-center text-[#2E2860] text-xl font-bold">
              {preacher.display_name[0]}
            </div>
          )}
          <button type="button" onClick={() => photoRef.current?.click()} disabled={photoUploading}
            className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
            {photoUploading ? 'Enviando…' : 'Trocar foto'}
          </button>
        </div>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome completo *</label>
        <input name="display_name" required defaultValue={preacher.display_name} className={inputCls} placeholder="Pr. João da Silva" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Bio</label>
        <textarea name="bio" defaultValue={preacher.bio ?? ''} rows={3} className={inputCls} placeholder="Breve apresentação sobre você e seu ministério..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Igreja</label>
          <input name="church" defaultValue={preacher.church ?? ''} className={inputCls} placeholder="Igreja Batista Central" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Cidade</label>
          <input name="city" defaultValue={preacher.city ?? ''} className={inputCls} placeholder="São Paulo" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Instagram</label>
          <input name="instagram" defaultValue={preacher.instagram ?? ''} className={inputCls} placeholder="joaosilva" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">WhatsApp (com DDD e país)</label>
          <input name="whatsapp" defaultValue={preacher.whatsapp ?? ''} className={inputCls} placeholder="5511999999999" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Chave PIX</label>
        <input name="pix_key" defaultValue={preacher.pix_key ?? ''} className={inputCls} placeholder="sua@chave.pix" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors mt-2">
        {loading ? 'Salvando...' : 'Atualizar Perfil'}
      </button>
    </form>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePartner, setPartnerAutoPublish, setPartnerStatus } from '../../actions'
import { uploadStudyImage } from '../../../conteudo/upload-actions'

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
  status: 'pending' | 'active' | 'disabled'
  auto_publish: boolean
}

export function EditPartnerForm({ preacher }: { preacher: Preacher }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(preacher.photo_url ?? '')
  const [photoPreview, setPhotoPreview] = useState(preacher.photo_url ?? '')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [trusted, setTrusted] = useState(preacher.auto_publish)
  const [status, setStatus] = useState(preacher.status)
  const photoRef = useRef<HTMLInputElement>(null)

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-white text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadStudyImage(fd)
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    fd.set('photo_url', photoUrl)
    const result = await updatePartner(preacher.id, fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSuccess(false), 2500)
  }

  const toggleTrust = async () => {
    const next = !trusted
    setTrusted(next)
    await setPartnerAutoPublish(preacher.id, next)
    router.refresh()
  }

  const changeStatus = async (s: 'active' | 'disabled') => {
    setStatus(s)
    await setPartnerStatus(preacher.id, s)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
      {/* Controles de confiança + status */}
      <div className="flex flex-wrap gap-3 bg-[#FAF7F1] rounded-xl p-4 border border-[#1E1B2E]/10">
        <button type="button" onClick={toggleTrust}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            trusted ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-[#8A8797] border border-[#1E1B2E]/10'
          }`}>
          {trusted ? '✓ Confiável (publica sem aprovação)' : 'Tornar confiável'}
        </button>
        {status !== 'disabled' ? (
          <button type="button" onClick={() => changeStatus('disabled')}
            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
            Desativar acesso
          </button>
        ) : (
          <button type="button" onClick={() => changeStatus('active')}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
            Reativar acesso
          </button>
        )}
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Foto</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <img src={photoPreview} alt="Foto" className="h-14 w-14 rounded-full object-cover border border-[#1E1B2E]/10" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-[#2E2860]/10 flex items-center justify-center text-[#2E2860] text-lg font-bold">
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
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome *</label>
        <input name="display_name" required defaultValue={preacher.display_name} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Igreja</label>
          <input name="church" defaultValue={preacher.church ?? ''} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Cidade</label>
          <input name="city" defaultValue={preacher.city ?? ''} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Bio</label>
        <textarea name="bio" rows={3} defaultValue={preacher.bio ?? ''} className={`${inputCls} resize-y`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">WhatsApp</label>
          <input name="whatsapp" defaultValue={preacher.whatsapp ?? ''} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Instagram</label>
          <input name="instagram" defaultValue={preacher.instagram ?? ''} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Chave PIX</label>
        <input name="pix_key" defaultValue={preacher.pix_key ?? ''} className={inputCls} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm">Salvo!</div>}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        <Link href="/admin/parceiros"
          className="px-5 py-2.5 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl font-semibold text-sm hover:text-[#1E1B2E] transition-colors flex items-center">
          Voltar
        </Link>
      </div>
    </form>
  )
}

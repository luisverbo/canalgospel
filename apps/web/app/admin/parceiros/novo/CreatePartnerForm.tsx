'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createPartner } from '../actions'
import { uploadStudyImage } from '../../conteudo/upload-actions'

export function CreatePartnerForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [copied, setCopied] = useState(false)
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
    const fd = new FormData(e.currentTarget)
    fd.set('photo_url', photoUrl)
    const result = await createPartner(fd)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setCredentials(result.credentials ?? null)
    setLoading(false)
  }

  if (credentials) {
    return (
      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="font-semibold text-emerald-800">Parceiro criado com sucesso!</p>
          <p className="text-sm text-emerald-700 mt-1">
            Envie estas credenciais ao pregador. A senha não poderá ser recuperada depois — apenas redefinida.
          </p>
        </div>

        <div className="bg-[#FAF7F1] rounded-xl border border-[#1E1B2E]/10 p-4 flex flex-col gap-2 font-mono text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-[#8A8797]">E-mail:</span>
            <span className="text-[#1E1B2E]">{credentials.email}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8A8797]">Senha:</span>
            <span className="text-[#1E1B2E]">{credentials.password}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`E-mail: ${credentials.email}\nSenha: ${credentials.password}\nAcesse: /login`)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] transition-colors"
          >
            {copied ? '✓ Copiado' : 'Copiar credenciais'}
          </button>
          <Link
            href="/admin/parceiros"
            className="px-5 py-2.5 border border-[#1E1B2E]/15 text-[#2E2860] rounded-xl font-semibold text-sm hover:bg-[#2E2860]/5 transition-colors flex items-center"
          >
            Concluir
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Foto</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <img src={photoPreview} alt="Foto" className="h-14 w-14 rounded-full object-cover border border-[#1E1B2E]/10" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-[#2E2860]/10 flex items-center justify-center text-[#2E2860] text-lg font-bold">?</div>
          )}
          <button type="button" onClick={() => photoRef.current?.click()} disabled={photoUploading}
            className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
            {photoUploading ? 'Enviando…' : photoPreview ? 'Trocar foto' : 'Escolher foto'}
          </button>
        </div>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome *</label>
          <input name="display_name" required placeholder="Pr. João da Silva" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">E-mail *</label>
          <input name="email" type="email" required placeholder="joao@email.com" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Igreja</label>
          <input name="church" placeholder="Igreja Batista Central" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Cidade</label>
          <input name="city" placeholder="São Paulo" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Bio</label>
        <textarea name="bio" rows={3} placeholder="Breve apresentação do ministério..." className={`${inputCls} resize-y`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">WhatsApp</label>
          <input name="whatsapp" placeholder="5511999999999" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Instagram</label>
          <input name="instagram" placeholder="joaosilva" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Chave PIX</label>
        <input name="pix_key" placeholder="sua@chave.pix" className={inputCls} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer bg-[#FAF7F1] rounded-xl p-4 border border-[#1E1B2E]/10">
        <input name="auto_publish" type="checkbox" className="h-4 w-4 mt-0.5 rounded accent-[#2E2860]" />
        <span className="text-sm text-[#1E1B2E]">
          <span className="font-semibold">Parceiro confiável</span> — publica sem aprovação.
          <span className="block text-xs text-[#8A8797] mt-0.5">
            Estudos enviados por este pregador entram publicados automaticamente. Deixe desmarcado para exigir moderação.
          </span>
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors">
          {loading ? 'Criando...' : 'Criar Parceiro'}
        </button>
        <Link href="/admin/parceiros"
          className="px-5 py-2.5 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl font-semibold text-sm hover:text-[#1E1B2E] transition-colors flex items-center">
          Cancelar
        </Link>
      </div>
    </form>
  )
}

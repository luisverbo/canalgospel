'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Preacher {
  id: string
  name: string
  bio: string | null
  church: string | null
  city: string | null
  state: string | null
  instagram_handle: string | null
  whatsapp: string | null
  pix_key: string | null
  pix_key_type: string | null
  photo_url: string | null
  slug: string
}

export function ProfileForm({
  userId,
  preacher,
}: {
  userId: string
  preacher: Preacher | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: preacher?.name ?? '',
    bio: preacher?.bio ?? '',
    church: preacher?.church ?? '',
    city: preacher?.city ?? '',
    state: preacher?.state ?? '',
    instagram_handle: preacher?.instagram_handle ?? '',
    whatsapp: preacher?.whatsapp ?? '',
    pix_key: preacher?.pix_key ?? '',
    pix_key_type: preacher?.pix_key_type ?? 'email',
    photo_url: preacher?.photo_url ?? '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const slug = generateSlug(form.name)

    if (preacher) {
      const { error: updateError } = await supabase
        .from('preachers')
        .update({ ...form, slug })
        .eq('id', preacher.id)
      if (updateError) { setError(updateError.message); setLoading(false); return }
    } else {
      const { error: insertError } = await supabase
        .from('preachers')
        .insert({ ...form, slug, profile_id: userId, status: 'pending' })
      if (insertError) { setError(insertError.message); setLoading(false); return }
    }

    setSuccess(true)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
    setLoading(false)
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2860] placeholder-[#8A8797]'

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">{label}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
      {success && (
        <p className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm font-medium">
          Perfil atualizado com sucesso!
        </p>
      )}
      {error && (
        <p className="bg-red-50 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</p>
      )}

      <F label="Foto URL">
        <input value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)}
          className={inputCls} placeholder="https://exemplo.com/foto.jpg" />
      </F>

      <F label="Nome completo *">
        <input required value={form.name} onChange={(e) => set('name', e.target.value)}
          className={inputCls} placeholder="Pr. João da Silva" />
      </F>

      <F label="Bio">
        <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)}
          rows={3} className={inputCls} placeholder="Breve apresentação sobre você e seu ministério..." />
      </F>

      <div className="grid grid-cols-2 gap-4">
        <F label="Igreja">
          <input value={form.church} onChange={(e) => set('church', e.target.value)}
            className={inputCls} placeholder="Igreja Batista Central" />
        </F>
        <F label="Cidade">
          <input value={form.city} onChange={(e) => set('city', e.target.value)}
            className={inputCls} placeholder="São Paulo" />
        </F>
      </div>

      <F label="Estado (sigla)">
        <input value={form.state} onChange={(e) => set('state', e.target.value)}
          className={inputCls} placeholder="SP" maxLength={2} />
      </F>

      <F label="Instagram">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8797] text-sm">@</span>
          <input value={form.instagram_handle} onChange={(e) => set('instagram_handle', e.target.value)}
            className={inputCls + ' pl-8'} placeholder="joaosilva" />
        </div>
      </F>

      <F label="WhatsApp (com DDD e código do país)">
        <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
          className={inputCls} placeholder="5511999999999" />
      </F>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Chave PIX</label>
        <div className="flex gap-2">
          <select value={form.pix_key_type} onChange={(e) => set('pix_key_type', e.target.value)}
            className={inputCls + ' w-36 shrink-0'}>
            <option value="email">Email</option>
            <option value="phone">Telefone</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="random">Aleatória</option>
          </select>
          <input value={form.pix_key} onChange={(e) => set('pix_key', e.target.value)}
            className={inputCls} placeholder="sua@chave.pix" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors mt-2"
      >
        {loading ? 'Salvando...' : preacher ? 'Atualizar Perfil' : 'Criar Perfil'}
      </button>
    </form>
  )
}

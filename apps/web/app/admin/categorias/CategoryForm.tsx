'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CategoryForm() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    type: 'theme' as 'theme' | 'occasion' | 'book',
    sort_order: 0,
    active: true,
  })

  const set = (key: string, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setForm((f) => ({ ...f, name, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('categories').insert(form)
    router.refresh()
    setForm({ name: '', slug: '', description: '', icon: '', type: 'theme', sort_order: 0, active: true })
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#2E2860]'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome</label>
        <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="Ex: Casamento" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Slug</label>
        <input required value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} placeholder="casamento" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Ícone (emoji)</label>
        <input value={form.icon} onChange={(e) => set('icon', e.target.value)} className={inputCls} placeholder="💍" maxLength={4} />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Tipo</label>
        <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
          <option value="theme">Tema</option>
          <option value="occasion">Ocasião</option>
          <option value="book">Livro Bíblico</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Ordem</label>
        <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} className={inputCls} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50">
        {loading ? 'Salvando...' : 'Criar Categoria'}
      </button>
    </form>
  )
}

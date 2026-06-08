'use client'

import { useState } from 'react'
import { createCategory } from './actions'

const emptyForm = { name: '', slug: '', kind: 'tema', sort_order: 0 }

export function CategoryForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (key: string, value: string | number) =>
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
    setError(null)
    try {
      await createCategory(form)
      setForm(emptyForm)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-sm text-[#1E1B2E] focus:outline-none focus:border-[#2E2860]'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
      {success && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">Categoria criada!</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Nome</label>
        <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)}
          className={inputCls} placeholder="Ex: Casamento" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Slug</label>
        <input required value={form.slug} onChange={(e) => set('slug', e.target.value)}
          className={inputCls} placeholder="casamento" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Tipo</label>
        <select value={form.kind} onChange={(e) => set('kind', e.target.value)} className={inputCls}>
          <option value="tema">Tema</option>
          <option value="ocasiao">Ocasião</option>
          <option value="livro">Livro Bíblico</option>
        </select>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50">
        {loading ? 'Salvando...' : 'Criar Categoria'}
      </button>
    </form>
  )
}

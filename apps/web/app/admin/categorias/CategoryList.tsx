'use client'

import { useState, useRef } from 'react'
import { reorderCategories, updateCategory, deleteCategory } from './actions'

interface Category {
  id: string
  name: string
  slug: string
  kind: string
  sort_order: number
}

const kindLabel: Record<string, string> = { tema: 'Tema', livro: 'Livro', ocasiao: 'Ocasião' }
const kindColor: Record<string, string> = {
  tema: 'bg-[#2E2860]/10 text-[#2E2860]',
  livro: 'bg-[#8A8797]/10 text-[#8A8797]',
  ocasiao: 'bg-[#E0A943]/15 text-[#9a6f1a]',
}

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', kind: 'tema' })
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const dragIndex = useRef<number | null>(null)

  const inputCls = 'w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-sm text-[#1E1B2E] focus:outline-none focus:border-[#2E2860]'

  const onDragStart = (index: number) => { dragIndex.current = index }
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === index) return
    const updated = [...categories]
    const [moved] = updated.splice(from, 1)
    updated.splice(index, 0, moved)
    dragIndex.current = index
    setCategories(updated)
  }
  const onDragEnd = async () => {
    dragIndex.current = null
    setSaving(true)
    await reorderCategories(categories.map((c) => c.id))
    setSaving(false)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, slug: cat.slug, kind: cat.kind })
    setEditError(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setEditError(null)
    try {
      await updateCategory(editingId, editForm)
      setCategories((cats) => cats.map((c) => c.id === editingId ? { ...c, ...editForm } : c))
      setEditingId(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id: string) => {
    setSaving(true)
    try {
      await deleteCategory(id)
      setCategories((cats) => cats.filter((c) => c.id !== id))
    } finally {
      setSaving(false)
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1E1B2E]">Categorias ({categories.length})</h2>
        {saving && <span className="text-xs text-[#8A8797]">Salvando...</span>}
        {!saving && categories.length > 0 && (
          <span className="text-xs text-[#8A8797]">Arraste para reordenar</span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
        {categories.length === 0 && (
          <p className="px-4 py-6 text-sm text-[#8A8797] text-center">Nenhuma categoria ainda</p>
        )}

        {categories.map((cat, index) => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              <div className="px-4 py-3 flex flex-col gap-2 bg-[#FAF7F1]">
                {editError && <p className="text-xs text-red-700">{editError}</p>}
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  className={inputCls}
                  placeholder="Nome"
                />
                <input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  className={inputCls}
                  placeholder="slug"
                />
                <select
                  value={editForm.kind}
                  onChange={(e) => setEditForm((f) => ({ ...f, kind: e.target.value }))}
                  className={inputCls}
                >
                  <option value="tema">Tema</option>
                  <option value="ocasiao">Ocasião</option>
                  <option value="livro">Livro Bíblico</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="flex-1 py-2 bg-[#2E2860] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                    Salvar
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : deletingId === cat.id ? (
              <div className="px-4 py-3 flex flex-col gap-2 bg-red-50">
                <p className="text-sm text-red-700">
                  Excluir <strong>{cat.name}</strong>? Os estudos desta categoria ficarão sem categoria.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => confirmDelete(cat.id)} disabled={saving}
                    className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                    Confirmar exclusão
                  </button>
                  <button onClick={() => setDeletingId(null)}
                    className="px-4 py-2 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className="px-4 py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-[#FAF7F1] transition-colors select-none"
              >
                <svg className="w-4 h-4 text-[#8A8797] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1E1B2E]">{cat.name}</p>
                  <p className="text-xs text-[#8A8797]">/{cat.slug}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kindColor[cat.kind] ?? 'bg-gray-100 text-gray-600'}`}>
                  {kindLabel[cat.kind] ?? cat.kind}
                </span>
                <div className="flex gap-1 ml-1 shrink-0">
                  <button onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-lg text-[#8A8797] hover:bg-[#2E2860]/10 hover:text-[#2E2860] transition-colors"
                    title="Editar">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 2.828L11.828 13.828a4 4 0 01-1.414.828L7 16l1.344-3.414a4 4 0 01.828-1.414z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeletingId(cat.id)}
                    className="p-1.5 rounded-lg text-[#8A8797] hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Excluir">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0h8" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

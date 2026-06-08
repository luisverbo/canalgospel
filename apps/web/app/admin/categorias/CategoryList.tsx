'use client'

import { useState, useRef } from 'react'
import { reorderCategories } from './actions'

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

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [saving, setSaving] = useState(false)
  const dragIndex = useRef<number | null>(null)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1E1B2E]">
          Categorias ({categories.length})
        </h2>
        {saving && <span className="text-xs text-[#8A8797]">Salvando ordem...</span>}
        {!saving && categories.length > 0 && (
          <span className="text-xs text-[#8A8797]">Arraste para reordenar</span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
        {categories.length === 0 && (
          <p className="px-4 py-6 text-sm text-[#8A8797] text-center">Nenhuma categoria ainda</p>
        )}
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className="px-4 py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-[#FAF7F1] transition-colors select-none"
          >
            {/* drag handle */}
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
          </div>
        ))}
      </div>
    </div>
  )
}

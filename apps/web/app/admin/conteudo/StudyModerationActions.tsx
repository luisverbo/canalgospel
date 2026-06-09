'use client'

import { useState } from 'react'
import { approveStudy, rejectStudy, setCategoryAction } from './actions'

interface Category { id: string; name: string }

export function StudyModerationActions({
  studyId,
  categoryId,
  categories,
}: {
  studyId: string
  categoryId: string | null
  categories: Category[]
}) {
  const [loading, setLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categoryId ?? '')

  const handleApprove = async () => {
    setLoading(true)
    await approveStudy(studyId)
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    await rejectStudy(studyId)
    setRejecting(false)
    setLoading(false)
  }

  const handleCategoryChange = async (catId: string) => {
    setSelectedCategory(catId)
    await setCategoryAction(studyId, catId)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Category selector for uncategorized */}
      {!categoryId && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-700 font-medium shrink-0">Categoria:</span>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]"
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      {rejecting ? (
        <div className="flex gap-2">
          <button onClick={handleReject} disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Rejeitando...' : 'Confirmar Rejeição'}
          </button>
          <button onClick={() => setRejecting(false)}
            className="px-4 py-2 bg-[#1E1B2E]/5 text-[#8A8797] rounded-lg text-sm">
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={handleApprove} disabled={loading}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {loading ? '...' : '✓ Aprovar'}
          </button>
          <button onClick={() => setRejecting(true)} disabled={loading}
            className="px-5 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
            ✗ Rejeitar
          </button>
        </div>
      )}
    </div>
  )
}

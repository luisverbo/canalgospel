'use client'

import { useState } from 'react'
import { approveStudy, rejectStudy, unpublishStudy, setCategoryAction, setFeatured, unsetFeatured } from './actions'

interface Category { id: string; name: string }

export function StudyModerationActions({
  studyId,
  categoryId,
  categories,
  currentStatus,
  isFeatured = false,
  featuredUntil = null,
}: {
  studyId: string
  categoryId: string | null
  categories: Category[]
  currentStatus: string
  isFeatured?: boolean
  featuredUntil?: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categoryId ?? '')
  const [featured, setFeaturedState] = useState(isFeatured)
  const [featuringOpen, setFeaturingOpen] = useState(false)
  const [until, setUntil] = useState(featuredUntil ? featuredUntil.slice(0, 10) : '')

  const run = async (fn: () => Promise<void>) => {
    setLoading(true)
    await fn()
    setLoading(false)
  }

  const handleCategoryChange = async (catId: string) => {
    setSelectedCategory(catId)
    await setCategoryAction(studyId, catId)
  }

  const applyFeature = async () => {
    setLoading(true)
    const iso = until ? new Date(`${until}T23:59:59`).toISOString() : null
    await setFeatured(studyId, iso)
    setFeaturedState(true)
    setFeaturingOpen(false)
    setLoading(false)
  }

  const removeFeature = async () => {
    setLoading(true)
    await unsetFeatured(studyId)
    setFeaturedState(false)
    setUntil('')
    setLoading(false)
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

      {currentStatus === 'pending' && (
        rejecting ? (
          <div className="flex gap-2">
            <button onClick={() => run(() => rejectStudy(studyId))} disabled={loading}
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
            <button onClick={() => run(() => approveStudy(studyId))} disabled={loading}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {loading ? '...' : '✓ Aprovar'}
            </button>
            <button onClick={() => setRejecting(true)} disabled={loading}
              className="px-5 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
              ✗ Rejeitar
            </button>
          </div>
        )
      )}

      {currentStatus === 'published' && (
        <div className="flex gap-3">
          <button onClick={() => run(() => unpublishStudy(studyId))} disabled={loading}
            className="px-5 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50">
            {loading ? '...' : '↩ Despublicar'}
          </button>
        </div>
      )}

      {currentStatus === 'rejected' && (
        <div className="flex gap-3">
          <button onClick={() => run(() => approveStudy(studyId))} disabled={loading}
            className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50">
            {loading ? '...' : '✓ Aprovar mesmo assim'}
          </button>
        </div>
      )}

      {currentStatus === 'draft' && (
        <span className="text-xs text-[#8A8797] py-2">Rascunho</span>
      )}

      {/* Destaque na Home — apenas para estudos publicados */}
      {currentStatus === 'published' && (
        <div className="border-t border-[#1E1B2E]/8 pt-3 mt-1">
          {featured ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#9a6f1a] bg-[#E0A943]/15 px-2.5 py-1 rounded-full">
                ★ Em destaque{featuredUntil ? ` até ${new Date(featuredUntil).toLocaleDateString('pt-BR')}` : ''}
              </span>
              <button onClick={removeFeature} disabled={loading}
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
                Remover destaque
              </button>
            </div>
          ) : featuringOpen ? (
            <div className="flex items-end gap-2 flex-wrap">
              <div>
                <label className="block text-[11px] text-[#8A8797] mb-1">Expira em (opcional)</label>
                <input type="date" value={until} onChange={(e) => setUntil(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
              </div>
              <button onClick={applyFeature} disabled={loading}
                className="px-4 py-1.5 bg-[#E0A943] text-[#1E1B2E] rounded-lg text-sm font-semibold hover:bg-[#EFC06A] disabled:opacity-50">
                {loading ? '...' : 'Destacar'}
              </button>
              <button onClick={() => setFeaturingOpen(false)}
                className="px-3 py-1.5 text-[#8A8797] text-sm">Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setFeaturingOpen(true)}
              className="text-xs font-semibold text-[#9a6f1a] hover:underline">
              ★ Destacar na Home
            </button>
          )}
        </div>
      )}
    </div>
  )
}

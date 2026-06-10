'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudy } from './actions'

interface Category { id: string; name: string; type?: string }

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  category_id: string | null
  content_type: string | null
}

export function EditStudyForm({ study, categories }: { study: Study; categories: Category[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isVideo = !!study.youtube_url || study.content_type === 'video'
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-white text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await updateStudy(study.id, fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const cleanBody = study.body && study.body.trim() !== '' && study.body.trim() !== ' ' ? study.body : ''

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Título *</label>
        <input name="title" required defaultValue={study.title} className={inputCls} />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Categoria / Ocasião</label>
        <select name="category_id" defaultValue={study.category_id ?? ''} className={inputCls}>
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.type === 'occasion' ? ' (ocasião)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* YouTube URL (vídeos) */}
      {isVideo && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">URL do YouTube</label>
          <input name="youtube_url" defaultValue={study.youtube_url ?? ''}
            placeholder="https://youtube.com/watch?v=..." className={inputCls} />
        </div>
      )}

      {/* Descrição / Corpo */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          {isVideo ? 'Descrição' : 'Conteúdo'}
        </label>
        <textarea name="body" rows={isVideo ? 5 : 12} defaultValue={cleanBody}
          placeholder={isVideo ? 'Descrição do vídeo...' : 'Escreva o estudo aqui...'}
          className={`${inputCls} resize-y`} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl font-semibold text-sm hover:text-[#1E1B2E] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

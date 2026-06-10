'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudy } from './actions'
import { RichTextEditor } from '../../RichTextEditor'
import { uploadStudyImage } from '../../upload-actions'

interface Category { id: string; name: string; kind?: string }

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  category_id: string | null
  content_type: string | null
  cover_url?: string | null
}

const kindLabel: Record<string, string> = { tema: 'Temas', livro: 'Livros Bíblicos', ocasiao: 'Ocasiões' }

function groupByKind(cats: { id: string; name: string; kind?: string }[]) {
  const groups: Record<string, typeof cats> = {}
  for (const c of cats) {
    const k = c.kind ?? 'tema'
    if (!groups[k]) groups[k] = []
    groups[k].push(c)
  }
  return groups
}

export function EditStudyForm({ study, categories }: { study: Study; categories: Category[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState(study.cover_url ?? '')
  const [coverPreview, setCoverPreview] = useState(study.cover_url ?? '')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isVideo = !!study.youtube_url || study.content_type === 'video'
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-white text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'
  const categoryGroups = groupByKind(categories)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadStudyImage(fd)
      if (result.error || !result.url) throw new Error(result.error ?? 'Falha no upload')
      setCoverUrl(result.url)
      setCoverPreview(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload da capa')
    } finally {
      setCoverUploading(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

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
          {Object.entries(categoryGroups).map(([kind, cats]) => (
            <optgroup key={kind} label={kindLabel[kind] ?? kind}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
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

      {/* Capa (só para estudos de texto) */}
      {!isVideo && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Imagem de capa <span className="text-[#8A8797] font-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <img src={coverPreview} alt="Capa" className="h-16 w-24 rounded-xl object-cover border border-[#1E1B2E]/10" />
            )}
            <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
              className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
              {coverUploading ? 'Enviando…' : coverPreview ? 'Trocar imagem' : 'Escolher imagem'}
            </button>
            {coverPreview && (
              <button type="button" onClick={() => { setCoverUrl(''); setCoverPreview('') }}
                className="text-xs text-red-500 hover:underline">Remover</button>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          <input type="hidden" name="cover_url" value={coverUrl} />
        </div>
      )}

      {/* Descrição / Corpo */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          {isVideo ? 'Descrição' : 'Conteúdo'}
        </label>
        {isVideo ? (
          <textarea name="body" rows={5} defaultValue={cleanBody}
            placeholder="Descrição do vídeo..." className={`${inputCls} resize-y`} />
        ) : (
          <RichTextEditor name="body" initialHTML={cleanBody} />
        )}
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

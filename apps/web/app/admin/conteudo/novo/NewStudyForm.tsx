'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createStudy } from './actions'
import { RichTextEditor } from '../RichTextEditor'
import { uploadStudyImage } from '../upload-actions'

interface Category { id: string; name: string; kind: string }

const kindLabel: Record<string, string> = { tema: 'Temas', livro: 'Livros Bíblicos', ocasiao: 'Ocasiões' }

function groupByKind(cats: Category[]) {
  const groups: Record<string, Category[]> = {}
  for (const c of cats) {
    const k = c.kind ?? 'tema'
    if (!groups[k]) groups[k] = []
    groups[k].push(c)
  }
  return groups
}

export function NewStudyForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [contentType, setContentType] = useState<'video' | 'text'>('video')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

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

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-white text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('content_type', contentType)
    const btn = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    fd.set('submit_action', btn?.value ?? 'draft')
    const result = await createStudy(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">

      {/* Tipo de conteúdo */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-2">Tipo de conteúdo</label>
        <div className="flex gap-3">
          {(['video', 'text'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setContentType(t)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                contentType === t
                  ? 'border-[#2E2860] bg-[#2E2860] text-white'
                  : 'border-[#1E1B2E]/15 text-[#8A8797] hover:border-[#2E2860]/40'
              }`}
            >
              {t === 'video' ? '▶ Vídeo do YouTube' : '📝 Estudo de Texto'}
            </button>
          ))}
        </div>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Título *</label>
        <input name="title" required placeholder="Ex: A Fé que Move Montanhas" className={inputCls} />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Categoria</label>
        <select name="category_id" className={inputCls}>
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

      {/* YouTube URL (só para vídeo) */}
      {contentType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">URL do YouTube *</label>
          <input
            name="youtube_url"
            placeholder="https://youtube.com/watch?v=..."
            className={inputCls}
          />
          <p className="text-xs text-[#8A8797] mt-1">Cole o link completo do vídeo</p>
        </div>
      )}

      {/* Capa (só para texto) */}
      {contentType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Imagem de capa <span className="text-[#8A8797] font-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <img src={coverPreview} alt="Capa" className="h-16 w-24 rounded-xl object-cover border border-[#1E1B2E]/10" />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50"
            >
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

      {/* Body (só para texto) — editor rich text */}
      {contentType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Conteúdo *</label>
          <RichTextEditor name="body" />
        </div>
      )}

      {/* Descrição opcional para vídeo */}
      {contentType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Descrição <span className="text-[#8A8797] font-normal">(opcional)</span>
          </label>
          <textarea
            name="body"
            rows={4}
            placeholder="Breve descrição do vídeo..."
            className={`${inputCls} resize-y`}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          name="submit_action"
          value="draft"
          disabled={loading}
          className="flex-1 py-2.5 border-2 border-[#2E2860] text-[#2E2860] rounded-xl font-semibold text-sm hover:bg-[#2E2860]/5 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Salvar como Rascunho'}
        </button>
        <button
          type="submit"
          name="submit_action"
          value="publish"
          disabled={loading}
          className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Enviar para Aprovação'}
        </button>
      </div>

      <button type="button" onClick={() => router.back()} className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
        ← Cancelar
      </button>
    </form>
  )
}

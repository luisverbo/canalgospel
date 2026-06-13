'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '../../admin/conteudo/RichTextEditor'
import { uploadPartnerImage, uploadPartnerAudio } from '../upload-actions'
import { createPartnerStudy, updatePartnerStudy } from './actions'

interface Category { id: string; name: string; kind?: string }

interface ExistingStudy {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  category_id: string | null
  content_type: string | null
  cover_url: string | null
  audio_url: string | null
  status: string
}

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

type ContentType = 'video' | 'audio' | 'text'

const TYPES: { value: ContentType; label: string }[] = [
  { value: 'video', label: '▶ Vídeo do YouTube' },
  { value: 'audio', label: '🎧 Áudio' },
  { value: 'text', label: '📖 Estudo de Texto' },
]

function detectInitialType(study?: ExistingStudy): ContentType {
  if (!study) return 'text'
  if (study.content_type === 'audio') return 'audio'
  if (study.content_type === 'video' || study.youtube_url) return 'video'
  return 'text'
}

export function PartnerStudyForm({
  categories,
  study,
}: {
  categories: Category[]
  study?: ExistingStudy
}) {
  const router = useRouter()
  const editing = !!study

  const [contentType, setContentType] = useState<ContentType>(detectInitialType(study))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState(study?.cover_url ?? '')
  const [coverPreview, setCoverPreview] = useState(study?.cover_url ?? '')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverRef = useRef<HTMLInputElement>(null)
  const [audioUrl, setAudioUrl] = useState(study?.audio_url ?? '')
  const [audioName, setAudioName] = useState(study?.audio_url ? study.audio_url.split('/').pop() ?? '' : '')
  const [audioUploading, setAudioUploading] = useState(false)
  const audioRef = useRef<HTMLInputElement>(null)

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-white text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'
  const categoryGroups = groupByKind(categories)
  const cleanBody = study?.body && study.body.trim() !== '' && study.body.trim() !== ' ' ? study.body : ''

  const handleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadPartnerAudio(fd)
      if (result.error || !result.url) throw new Error(result.error ?? 'Falha no upload')
      setAudioUrl(result.url)
      setAudioName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload do áudio')
    } finally {
      setAudioUploading(false)
      if (audioRef.current) audioRef.current.value = ''
    }
  }

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const result = await uploadPartnerImage(fd)
      if (result.error || !result.url) throw new Error(result.error ?? 'Falha no upload')
      setCoverUrl(result.url)
      setCoverPreview(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload da capa')
    } finally {
      setCoverUploading(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('content_type', contentType)
    fd.set('cover_url', coverUrl)
    fd.set('audio_url', audioUrl)
    const btn = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    fd.set('submit_action', btn?.value ?? 'draft')
    const result = editing ? await updatePartnerStudy(study!.id, fd) : await createPartnerStudy(fd)
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
        <div className="flex gap-2">
          {TYPES.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => setContentType(value)}
              className={`flex-1 py-3 rounded-xl border-2 text-xs font-semibold transition-colors ${
                contentType === value ? 'border-[#2E2860] bg-[#2E2860] text-white' : 'border-[#1E1B2E]/15 text-[#8A8797] hover:border-[#2E2860]/40'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Título *</label>
        <input name="title" required defaultValue={study?.title ?? ''}
          placeholder="Ex: A Fé que Move Montanhas" className={inputCls} />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Categoria</label>
        <select name="category_id" defaultValue={study?.category_id ?? ''} className={inputCls}>
          <option value="">Sem categoria</option>
          {Object.entries(categoryGroups).map(([kind, cats]) => (
            <optgroup key={kind} label={kindLabel[kind] ?? kind}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* YouTube URL (só para vídeo) */}
      {contentType === 'video' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">URL do YouTube *</label>
          <input name="youtube_url" defaultValue={study?.youtube_url ?? ''}
            placeholder="https://youtube.com/watch?v=..." className={inputCls} />
          <div className="mt-3">
            <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
              Descrição <span className="text-[#8A8797] font-normal">(opcional)</span>
            </label>
            <textarea name="body" rows={4} defaultValue={cleanBody}
              placeholder="Breve descrição do vídeo..." className={`${inputCls} resize-y`} />
          </div>
        </div>
      )}

      {/* Áudio: obrigatório para tipo áudio, opcional para outros */}
      {contentType === 'audio' ? (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Arquivo de áudio * <span className="text-[#8A8797] font-normal">(.mp3 ou .m4a · máx. 100MB)</span>
          </label>
          <div className="flex items-center gap-3">
            {audioName && (
              <span className="text-xs text-[#2E2860] bg-[#2E2860]/8 px-3 py-1.5 rounded-lg truncate max-w-[200px]">🎧 {audioName}</span>
            )}
            <button type="button" onClick={() => audioRef.current?.click()} disabled={audioUploading}
              className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
              {audioUploading ? 'Enviando…' : audioName ? 'Trocar áudio' : 'Escolher arquivo'}
            </button>
            {audioUrl && (
              <button type="button" onClick={() => { setAudioUrl(''); setAudioName('') }}
                className="text-xs text-red-500 hover:underline">Remover</button>
            )}
          </div>
          <input ref={audioRef} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a" className="hidden" onChange={handleAudio} />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Áudio da pregação <span className="text-[#8A8797] font-normal">(opcional · .mp3 ou .m4a · máx. 100MB)</span>
          </label>
          <div className="flex items-center gap-3">
            {audioName && (
              <span className="text-xs text-[#2E2860] bg-[#2E2860]/8 px-3 py-1.5 rounded-lg truncate max-w-[200px]">🎧 {audioName}</span>
            )}
            <button type="button" onClick={() => audioRef.current?.click()} disabled={audioUploading}
              className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
              {audioUploading ? 'Enviando…' : audioName ? 'Trocar áudio' : 'Escolher arquivo'}
            </button>
            {audioUrl && (
              <button type="button" onClick={() => { setAudioUrl(''); setAudioName('') }}
                className="text-xs text-red-500 hover:underline">Remover</button>
            )}
          </div>
          <input ref={audioRef} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a" className="hidden" onChange={handleAudio} />
        </div>
      )}

      {/* Capa: para texto e áudio */}
      {(contentType === 'text' || contentType === 'audio') && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Imagem de capa <span className="text-[#8A8797] font-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-3">
            {coverPreview && (
              <img src={coverPreview} alt="Capa" className="h-16 w-24 rounded-xl object-cover border border-[#1E1B2E]/10" />
            )}
            <button type="button" onClick={() => coverRef.current?.click()} disabled={coverUploading}
              className="px-4 py-2 border border-[#1E1B2E]/15 text-sm text-[#2E2860] rounded-xl hover:bg-[#2E2860]/5 disabled:opacity-50">
              {coverUploading ? 'Enviando…' : coverPreview ? 'Trocar imagem' : 'Escolher imagem'}
            </button>
            {coverPreview && (
              <button type="button" onClick={() => { setCoverUrl(''); setCoverPreview('') }}
                className="text-xs text-red-500 hover:underline">Remover</button>
            )}
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </div>
      )}

      {/* Body: obrigatório para texto, oculto para áudio */}
      {contentType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Conteúdo *</label>
          <RichTextEditor name="body" initialHTML={cleanBody} uploadAction={uploadPartnerImage} />
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="flex gap-3 pt-1">
        <button type="submit" name="submit_action" value="draft" disabled={loading}
          className="flex-1 py-2.5 border-2 border-[#2E2860] text-[#2E2860] rounded-xl font-semibold text-sm hover:bg-[#2E2860]/5 disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Salvar Rascunho'}
        </button>
        <button type="submit" name="submit_action" value="publish" disabled={loading}
          className="flex-1 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Publicar'}
        </button>
      </div>

      <button type="button" onClick={() => router.back()} className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
        ← Cancelar
      </button>
    </form>
  )
}

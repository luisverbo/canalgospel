'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  type: string
}

export function StudyEditorForm({
  preacherId,
  categories,
}: {
  preacherId: string
  categories: Category[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    body: '',
    youtube_url: '',
    category_id: '',
    is_premium: false,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const estimateReadTime = (text: string) => {
    const words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending_review') => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setError('Título e corpo do estudo são obrigatórios.')
      return
    }
    setLoading(true)
    setError(null)

    const slug = generateSlug(form.title)
    const { error: insertError } = await supabase.from('studies').insert({
      preacher_id: preacherId,
      category_id: form.category_id || null,
      title: form.title.trim(),
      slug,
      summary: form.summary.trim() || null,
      body: form.body,
      youtube_url: form.youtube_url.trim() || null,
      is_premium: form.is_premium,
      status,
      read_time_minutes: estimateReadTime(form.body),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/parceiro/estudos')
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2860] placeholder-[#8A8797]'

  return (
    <form className="flex flex-col gap-5 bg-white rounded-2xl border border-[#1E1B2E]/8 p-6">
      {error && (
        <p className="bg-red-50 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className={inputCls}
          placeholder="Ex: O Poder da Fé em Tempos de Crise"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Resumo</label>
        <textarea
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Breve descrição do estudo (aparece na listagem)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Conteúdo <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          rows={16}
          className={inputCls + ' resize-y font-mono text-xs leading-relaxed'}
          placeholder="Escreva o estudo completo aqui. Você pode usar HTML básico para formatação: <p>, <h2>, <strong>, <em>, <blockquote>..."
        />
        <p className="text-xs text-[#8A8797] mt-1">
          Tempo estimado de leitura: {estimateReadTime(form.body)} min
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">URL do Vídeo YouTube (opcional)</label>
        <input
          type="url"
          value={form.youtube_url}
          onChange={(e) => set('youtube_url', e.target.value)}
          className={inputCls}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Categoria</label>
        <select
          value={form.category_id}
          onChange={(e) => set('category_id', e.target.value)}
          className={inputCls}
        >
          <option value="">Selecionar categoria...</option>
          {(['theme', 'occasion', 'book'] as const).map((type) => {
            const cats = categories.filter((c) => c.type === type)
            if (!cats.length) return null
            const label = { theme: 'Temas', occasion: 'Ocasiões', book: 'Livros Bíblicos' }[type]
            return (
              <optgroup key={type} label={label}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_premium}
          onChange={(e) => set('is_premium', e.target.checked)}
          className="h-4 w-4 rounded accent-[#2E2860]"
        />
        <span className="text-sm text-[#1E1B2E]">Conteúdo premium (apenas para assinantes)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'draft')}
          disabled={loading}
          className="flex-1 py-3 bg-[#1E1B2E]/5 text-[#1E1B2E] rounded-xl font-semibold text-sm hover:bg-[#1E1B2E]/10 disabled:opacity-50 transition-colors"
        >
          Salvar Rascunho
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'pending_review')}
          disabled={loading}
          className="flex-1 py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar para Revisão'}
        </button>
      </div>
    </form>
  )
}

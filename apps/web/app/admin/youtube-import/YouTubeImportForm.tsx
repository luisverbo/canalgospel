'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@canal-gospel/supabase'

interface Preacher { id: string; display_name: string }
interface Category { id: string; name: string; slug: string }

interface Props {
  preachers: Preacher[]
  categories: Category[]
}

interface ImportResult {
  imported: number
  uncategorized: number
  errors: string[]
}

export function YouTubeImportForm({ preachers, categories }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [channelInput, setChannelInput] = useState('')
  const [preacherId, setPreacherId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Manual category assignment for uncategorized studies
  const [uncategorizedStudies, setUncategorizedStudies] = useState<
    Array<{ id: string; title: string; youtube_url: string; selectedCategory: string }>
  >([])
  const [savingCategories, setSavingCategories] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setApiError(null)
    setUncategorizedStudies([])

    try {
      const res = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          channelId: channelInput.trim(),
          preacherId: preacherId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error ?? 'Erro desconhecido')
      } else {
        setResult(data as ImportResult)
        // Load uncategorized studies for manual assignment
        if (data.uncategorized > 0) {
          const { data: pending } = await supabase
            .from('studies')
            .select('id, title, youtube_url')
            .eq('status', 'pending')
            .is('category_id', null)
            .order('created_at', { ascending: false })
            .limit(data.uncategorized)
          if (pending) {
            setUncategorizedStudies(
              pending.map((s) => ({ ...s, selectedCategory: '' }))
            )
          }
        }
      }
    } catch (err) {
      setApiError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const saveCategories = async () => {
    setSavingCategories(true)
    for (const s of uncategorizedStudies) {
      if (!s.selectedCategory) continue
      await supabase
        .from('studies')
        .update({ category_id: s.selectedCategory })
        .eq('id', s.id)
    }
    setSavingCategories(false)
    setUncategorizedStudies([])
    router.push('/admin/conteudo')
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">

        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Canal do YouTube *</label>
          <input
            required
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            placeholder="@PregadorFulano ou UCxxxxxxxxxxxxxxxx"
            className={inputCls}
          />
          <p className="text-xs text-[#8A8797] mt-1">Cole o @handle ou o Channel ID (UCxxx...)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Pregador <span className="text-[#8A8797] font-normal">(opcional — pode vincular depois)</span>
          </label>
          <select value={preacherId} onChange={(e) => setPreacherId(e.target.value)} className={inputCls}>
            <option value="">Nenhum / Vincular depois</option>
            {preachers.map((p) => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {apiError.includes('YOUTUBE_API_KEY')
              ? <>Configure <code className="font-mono bg-red-100 px-1 rounded">YOUTUBE_API_KEY</code> nas variáveis de ambiente da Vercel.</>
              : apiError}
          </div>
        )}

        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm space-y-1">
            <p className="font-semibold text-emerald-800">
              ✓ {result.imported} vídeo{result.imported !== 1 ? 's' : ''} importado{result.imported !== 1 ? 's' : ''} — aguardando sua aprovação
            </p>
            {result.uncategorized > 0 && (
              <p className="text-amber-700">
                ⚠ {result.uncategorized} vídeo{result.uncategorized !== 1 ? 's' : ''} sem categoria — selecione abaixo
              </p>
            )}
            {result.errors.length > 0 && (
              <p className="text-red-600">{result.errors.length} erro(s) na importação</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Importando e categorizando com IA...' : 'Importar Vídeos do Canal'}
        </button>
      </form>

      {/* Manual category assignment */}
      {uncategorizedStudies.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-[#1E1B2E]">Categorizar manualmente</h3>
            <p className="text-sm text-[#8A8797] mt-0.5">A IA não conseguiu identificar a categoria destes vídeos. Selecione abaixo:</p>
          </div>

          <div className="flex flex-col gap-3">
            {uncategorizedStudies.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1E1B2E] truncate font-medium">{s.title}</p>
                  <a href={s.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#2E2860] underline">ver vídeo</a>
                </div>
                <select
                  value={s.selectedCategory}
                  onChange={(e) => {
                    const updated = [...uncategorizedStudies]
                    updated[i].selectedCategory = e.target.value
                    setUncategorizedStudies(updated)
                  }}
                  className="px-3 py-2 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860] shrink-0"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={saveCategories}
            disabled={savingCategories}
            className="w-full py-3 bg-[#E0A943] text-white rounded-xl font-semibold text-sm hover:bg-[#c8932a] disabled:opacity-50 transition-colors"
          >
            {savingCategories ? 'Salvando...' : 'Salvar e ir para Moderação →'}
          </button>
        </div>
      )}

      <div className="bg-[#FAF7F1] rounded-2xl border border-[#1E1B2E]/8 p-4 text-sm text-[#8A8797]">
        <p className="font-medium text-[#1E1B2E] mb-1">Como funciona</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>O sistema busca até 50 vídeos mais recentes do canal</li>
          <li>A IA lê o título e descrição de cada vídeo e escolhe a categoria</li>
          <li>O que a IA não identificar, você categoriza manualmente aqui</li>
          <li>Todos os vídeos ficam com status <strong>Pendente</strong> — você aprova em Conteúdo antes de ir para o app</li>
        </ul>
      </div>
    </div>
  )
}

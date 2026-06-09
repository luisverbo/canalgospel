'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export function YouTubeImportForm({ preachers, categories: _categories }: Props) {
  const router = useRouter()
  const [channelInput, setChannelInput] = useState('')
  const [preacherId, setPreacherId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setApiError(null)

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
      if (!res.ok) setApiError(data.error ?? 'Erro desconhecido')
      else setResult(data as ImportResult)
    } catch (err) {
      setApiError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5">

        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Canal do YouTube *</label>
          <input required value={channelInput} onChange={(e) => setChannelInput(e.target.value)}
            placeholder="@PregadorFulano ou UCxxxxxxxxxxxxxxxx" className={inputCls} />
          <p className="text-xs text-[#8A8797] mt-1">Cole o @handle ou o Channel ID (UCxxx...)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
            Pregador <span className="text-[#8A8797] font-normal">(opcional)</span>
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex flex-col gap-3">
            <div>
              <p className="font-semibold text-emerald-800">
                ✓ {result.imported} vídeo{result.imported !== 1 ? 's' : ''} importado{result.imported !== 1 ? 's' : ''} com sucesso!
              </p>
              {result.uncategorized > 0 && (
                <p className="text-amber-700 text-sm mt-0.5">
                  ⚠ {result.uncategorized} sem categoria — você pode definir na tela de Conteúdo
                </p>
              )}
              {result.errors.length > 0 && (
                <p className="text-red-600 text-sm mt-0.5">{result.errors.length} erro(s) na importação</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/conteudo')}
              className="w-full py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] transition-colors"
            >
              Ver e aprovar os vídeos importados →
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors">
          {loading ? 'Importando e categorizando com IA...' : 'Importar Vídeos do Canal'}
        </button>
      </form>

      <div className="bg-[#FAF7F1] rounded-2xl border border-[#1E1B2E]/8 p-4 text-sm text-[#8A8797]">
        <p className="font-medium text-[#1E1B2E] mb-2">Como funciona</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Busca até 50 vídeos mais recentes do canal</li>
          <li>A IA lê título e descrição de cada vídeo e escolhe a categoria</li>
          <li>Todos ficam com status <strong>Pendente</strong> — você aprova em Conteúdo</li>
          <li>Vídeos sem categoria podem ser categorizados na tela de Conteúdo</li>
        </ul>
      </div>
    </div>
  )
}

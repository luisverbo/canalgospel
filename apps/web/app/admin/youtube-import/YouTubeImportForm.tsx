'use client'

import { useState } from 'react'

interface Preacher {
  id: string
  display_name: string
}

interface ImportResult {
  imported: number
  errors: string[]
}

export function YouTubeImportForm({ preachers }: { preachers: Preacher[] }) {
  const [channelInput, setChannelInput] = useState('')
  const [preacherId, setPreacherId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelInput.trim() || !preacherId) return

    setLoading(true)
    setResult(null)
    setApiError(null)

    try {
      const res = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          channelId: channelInput.trim(),
          preacherId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error ?? 'Erro desconhecido')
      } else {
        setResult(data as ImportResult)
      }
    } catch (err) {
      setApiError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-6 flex flex-col gap-5 max-w-xl"
    >
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Canal do YouTube
        </label>
        <input
          required
          value={channelInput}
          onChange={(e) => setChannelInput(e.target.value)}
          placeholder="@PregadorFulano ou UCxxxxxxxxxxxxxxxx"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]"
        />
        <p className="text-xs text-[#8A8797] mt-1">
          Aceita handle (@canal) ou Channel ID (UCxxx...)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Pregador
        </label>
        <select
          required
          value={preacherId}
          onChange={(e) => setPreacherId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] text-sm outline-none focus:border-[#2E2860]"
        >
          <option value="">Selecione um pregador...</option>
          {preachers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </select>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {apiError.includes('YOUTUBE_API_KEY') ? (
            <span>Configure <code className="font-mono bg-red-100 px-1 rounded">YOUTUBE_API_KEY</code> nas variáveis de ambiente da Vercel.</span>
          ) : (
            apiError
          )}
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-emerald-800">
            {result.imported} vídeo{result.imported !== 1 ? 's' : ''} importado{result.imported !== 1 ? 's' : ''} com sucesso!
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-700">Erros ({result.errors.length}):</p>
              <ul className="mt-1 space-y-0.5">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-red-600 text-xs">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors"
      >
        {loading ? 'Importando...' : 'Importar Vídeos'}
      </button>
    </form>
  )
}

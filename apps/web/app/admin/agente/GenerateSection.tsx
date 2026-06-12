'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateDevotional } from './actions'

export function GenerateSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    const res = await generateDevotional()
    setLoading(false)
    if (res.error) {
      setResult({ ok: false, msg: res.error })
    } else {
      setResult({ ok: true, msg: `Devocional gerado com o tema "${res.theme}" e enviado para a fila de aprovação.` })
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E0A943] text-[#1E1B2E] rounded-xl font-bold text-sm hover:bg-[#c99338] disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-[#1E1B2E]/30 border-t-[#1E1B2E] rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            <>✨ Gerar devocional agora</>
          )}
        </button>
        <p className="text-xs text-[#8A8797]">
          Usa o tema do dia · salva como pendente para você aprovar abaixo
        </p>
      </div>

      {result && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${
          result.ok
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {result.ok ? '✓ ' : '✗ '}{result.msg}
        </div>
      )}
    </div>
  )
}

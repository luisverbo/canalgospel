'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateDevotional, generateWeekDevotionals } from './actions'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function GenerateSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [weekLoading, setWeekLoading] = useState(false)
  const [weekProgress, setWeekProgress] = useState(0)
  const [startDate, setStartDate] = useState(todayISO)
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

  async function handleGenerateWeek() {
    setWeekLoading(true)
    setWeekProgress(0)
    setResult(null)
    const res = await generateWeekDevotionals(startDate)
    setWeekLoading(false)
    setWeekProgress(0)
    if (res.errors.length > 0 && res.generated === 0) {
      setResult({ ok: false, msg: res.errors[0] })
    } else {
      const errNote = res.errors.length > 0 ? ` (${res.errors.length} erro(s): ${res.errors[0]})` : ''
      setResult({ ok: true, msg: `${res.generated} devocionais gerados e enviados para a fila de aprovação.${errNote}` })
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Single day */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={loading || weekLoading}
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

      {/* Full week */}
      <div className="flex items-center gap-3 flex-wrap border-t border-[#1E1B2E]/6 pt-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#8A8797]">Data inicial da semana</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={weekLoading || loading}
            className="px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]"
          />
        </div>
        <button
          onClick={handleGenerateWeek}
          disabled={loading || weekLoading || !startDate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2E2860] text-white rounded-xl font-bold text-sm hover:bg-[#231f4e] disabled:opacity-60 transition-colors self-end"
        >
          {weekLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando semana...
            </>
          ) : (
            <>📅 Gerar semana (7 dias)</>
          )}
        </button>
        <p className="text-xs text-[#8A8797] self-end pb-0.5">
          Gera 7 devocionais, um por dia, usando os temas da agenda
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

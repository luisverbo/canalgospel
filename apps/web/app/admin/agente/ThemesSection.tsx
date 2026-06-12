'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTheme, updateTheme, deleteTheme, toggleThemeActive } from './actions'

interface Theme {
  id: string
  day_label: string
  theme: string
  sort_order: number
  active: boolean
}

export function ThemesSection({ themes: initial }: { themes: Theme[] }) {
  const router = useRouter()
  const [themes, setThemes] = useState<Theme[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const run = async (fn: () => Promise<{ error?: string } | void | undefined>) => {
    setPending(true)
    setError('')
    const res = await fn()
    setPending(false)
    if (res && 'error' in res && res.error) { setError(res.error); return false }
    router.refresh()
    return true
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex flex-col divide-y divide-[#1E1B2E]/6">
        {themes.map((t) => (
          <div key={t.id} className="py-3">
            {editingId === t.id ? (
              <form onSubmit={async (e) => {
                e.preventDefault()
                const ok = await run(() => updateTheme(t.id, new FormData(e.currentTarget)))
                if (ok) setEditingId(null)
              }} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input name="day_label" defaultValue={t.day_label} placeholder="Ex.: segunda"
                    className="w-28 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
                  <input name="theme" defaultValue={t.theme} placeholder="Tema"
                    className="flex-1 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
                  <input name="sort_order" type="number" defaultValue={t.sort_order}
                    className="w-14 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditingId(null)}
                    className="px-3 py-1 rounded-lg border border-[#1E1B2E]/15 text-xs text-[#8A8797]">Cancelar</button>
                  <button type="submit" disabled={pending}
                    className="px-3 py-1 rounded-lg bg-[#2E2860] text-white text-xs font-semibold disabled:opacity-50">Salvar</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.active ? 'bg-emerald-500' : 'bg-[#1E1B2E]/20'}`} />
                <span className="text-xs font-semibold text-[#8A8797] w-20 shrink-0 capitalize">{t.day_label}</span>
                <span className="flex-1 text-sm text-[#1E1B2E] truncate">{t.theme}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => run(() => toggleThemeActive(t.id, !t.active))} disabled={pending}
                    className="px-2 py-1 rounded-lg text-xs border border-[#1E1B2E]/10 text-[#8A8797] hover:border-[#2E2860]/30">
                    {t.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => setEditingId(t.id)} disabled={pending}
                    className="px-2 py-1 rounded-lg text-xs border border-[#1E1B2E]/10 text-[#2E2860] hover:bg-[#2E2860]/5">Editar</button>
                  <button onClick={() => run(() => deleteTheme(t.id))} disabled={pending}
                    className="px-2 py-1 rounded-lg text-xs text-red-600 border border-red-100 hover:bg-red-50">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={async (e) => {
          e.preventDefault()
          const ok = await run(() => createTheme(new FormData(e.currentTarget)))
          if (ok) { setAdding(false); (e.target as HTMLFormElement).reset() }
        }} className="border border-dashed border-[#2E2860]/30 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input name="day_label" required placeholder="Dia (ex.: segunda)"
              className="w-32 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
            <input name="theme" required placeholder="Tema do dia"
              className="flex-1 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
            <input name="sort_order" type="number" defaultValue={themes.length}
              className="w-14 px-2 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)}
              className="px-3 py-1 rounded-lg border border-[#1E1B2E]/15 text-xs text-[#8A8797]">Cancelar</button>
            <button type="submit" disabled={pending}
              className="px-3 py-1 rounded-lg bg-[#2E2860] text-white text-xs font-semibold disabled:opacity-50">Adicionar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="self-start px-3 py-1.5 rounded-xl border border-dashed border-[#2E2860]/30 text-sm text-[#2E2860] hover:bg-[#2E2860]/5">
          + Adicionar tema
        </button>
      )}
      <p className="text-xs text-[#8A8797]">
        O agente usa o tema cujo <strong>Dia</strong> bate com o dia da semana atual (segunda, terca, quarta…).
        Se não encontrar correspondência, usa o primeiro tema ativo da lista.
      </p>
    </div>
  )
}

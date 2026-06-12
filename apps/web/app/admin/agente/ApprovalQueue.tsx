'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveDevotional, discardDevotional, updatePendingDevotional } from './actions'

interface Devotional {
  id: string
  date: string
  verse_ref: string
  verse_text: string
  reflection: string
  theme: string | null
  created_at: string
}

export function ApprovalQueue({ devotionals: initial }: { devotionals: Devotional[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Devotional[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState('')

  const run = async (id: string, fn: () => Promise<{ error?: string } | undefined>) => {
    setPending(id)
    setError('')
    const res = await fn()
    setPending(null)
    if (res?.error) { setError(res.error); return false }
    router.refresh()
    return true
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-[#8A8797] text-sm">
        Nenhum devocional aguardando aprovação.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {items.map((d) => (
        <div key={d.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAF7F1] border-b border-[#1E1B2E]/6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                ⏳ Pendente
              </span>
              <span className="text-xs text-[#8A8797]">
                {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              {d.theme && (
                <span className="text-xs text-[#2E2860] bg-[#2E2860]/8 px-2 py-0.5 rounded-full">{d.theme}</span>
              )}
            </div>
            <span className="text-xs text-[#8A8797]">
              {new Date(d.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Content — view or edit */}
          <div className="p-4">
            {editingId === d.id ? (
              <form onSubmit={async (e) => {
                e.preventDefault()
                const ok = await run(d.id, () => updatePendingDevotional(d.id, new FormData(e.currentTarget)))
                if (ok) setEditingId(null)
              }} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1 block">Referência</label>
                  <input name="verse_ref" defaultValue={d.verse_ref} required
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1 block">Texto do versículo</label>
                  <textarea name="verse_text" defaultValue={d.verse_text} rows={3} required
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1 block">Reflexão</label>
                  <textarea name="reflection" defaultValue={d.reflection} rows={8} required
                    className="w-full px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] resize-none" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-xs text-[#8A8797]">Cancelar</button>
                  <button type="submit" disabled={pending === d.id}
                    className="px-4 py-1.5 rounded-lg bg-[#2E2860] text-white text-xs font-semibold disabled:opacity-50">Salvar edição</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-[#2E2860]/5 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-[#2E2860] uppercase tracking-wide mb-1">{d.verse_ref}</p>
                  <p className="text-sm text-[#1E1B2E] italic leading-relaxed">"{d.verse_text}"</p>
                </div>
                <p className="text-sm text-[#1E1B2E] leading-relaxed whitespace-pre-line">{d.reflection}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {editingId !== d.id && (
            <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1E1B2E]/6 bg-[#FAF7F1]">
              <button
                onClick={() => run(d.id, () => approveDevotional(d.id))}
                disabled={!!pending}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {pending === d.id ? 'Publicando…' : '✓ Aprovar e publicar'}
              </button>
              <button
                onClick={() => setEditingId(d.id)}
                disabled={!!pending}
                className="px-4 py-2 border border-[#1E1B2E]/15 text-[#2E2860] rounded-xl text-sm font-semibold hover:bg-[#2E2860]/5 disabled:opacity-50"
              >
                ✎ Editar
              </button>
              <button
                onClick={() => run(d.id, () => discardDevotional(d.id))}
                disabled={!!pending}
                className="ml-auto px-3 py-2 border border-red-100 text-red-600 rounded-xl text-sm hover:bg-red-50 disabled:opacity-50"
              >
                Descartar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

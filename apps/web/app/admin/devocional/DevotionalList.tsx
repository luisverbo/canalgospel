'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDevotional } from './actions'

interface Devotional {
  id: string
  date: string
  verse_ref: string
  verse_text: string
  youtube_url: string | null
}

export function DevotionalList({ devotionals }: { devotionals: Devotional[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(d: Devotional) {
    if (!confirm(`Excluir o devocional de ${new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR')} (${d.verse_ref})?`)) return
    setDeleting(d.id)
    await deleteDevotional(d.id, d.date)
    setDeleting(null)
    router.refresh()
  }

  if (!devotionals.length) {
    return <p className="text-sm text-[#8A8797]">Nenhum devocional cadastrado.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {devotionals.map((d) => (
        <div key={d.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1E1B2E] text-sm">{d.verse_ref}</p>
              <p className="text-xs text-[#8A8797] mt-0.5 line-clamp-2">{d.verse_text}</p>
              {d.youtube_url && (
                <a
                  href={d.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2E2860] underline mt-0.5 block truncate"
                >
                  YouTube
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#8A8797]">
                {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
              <button
                onClick={() => handleDelete(d)}
                disabled={deleting === d.id}
                className="px-2 py-1 rounded-lg text-xs text-red-600 border border-red-100 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {deleting === d.id ? '…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

interface Category { id: string; name: string }
interface Preacher { id: string; display_name: string }

export function ConteudoFilters({
  aba,
  categories,
  preachers,
  busca,
  categoria,
  pregador,
}: {
  aba: string
  categories: Category[]
  preachers: Preacher[]
  busca: string
  categoria: string
  pregador: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const navigate = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({ aba, busca, categoria, pregador, ...overrides })
    // remove empty params
    for (const [k, v] of [...p.entries()]) { if (!v) p.delete(k) }
    startTransition(() => router.push(`/admin/conteudo?${p.toString()}`))
  }

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <input
        type="search"
        placeholder="Buscar por título..."
        defaultValue={busca}
        onChange={(e) => navigate({ busca: e.target.value, categoria, pregador })}
        className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-[#1E1B2E]/15 bg-white text-sm text-[#1E1B2E] placeholder:text-[#8A8797] outline-none focus:border-[#2E2860] transition-colors"
      />
      <select
        value={categoria}
        onChange={(e) => navigate({ categoria: e.target.value })}
        className="px-3 py-2 rounded-xl border border-[#1E1B2E]/15 bg-white text-sm text-[#1E1B2E] outline-none focus:border-[#2E2860] transition-colors"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select
        value={pregador}
        onChange={(e) => navigate({ pregador: e.target.value })}
        className="px-3 py-2 rounded-xl border border-[#1E1B2E]/15 bg-white text-sm text-[#1E1B2E] outline-none focus:border-[#2E2860] transition-colors"
      >
        <option value="">Todos os pregadores</option>
        <option value="__sistema__">Sistema / sem pregador</option>
        {preachers.map((p) => (
          <option key={p.id} value={p.id}>{p.display_name}</option>
        ))}
      </select>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }}
    >
      <div className="relative">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8797]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título, tema, versículo..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#1E1B2E]/10 dark:border-white/10 bg-white dark:bg-[#211E2D] text-[#1E1B2E] dark:text-[#D8D5E4] placeholder-[#8A8797] focus:outline-none focus:ring-2 focus:ring-[#2E2860] dark:focus:ring-[#E0A943]"
        />
      </div>
    </form>
  )
}

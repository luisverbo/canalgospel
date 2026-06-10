'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import { SearchForm } from './SearchForm'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const [studies, setStudies] = useState<StudyCardType[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setStudies(null)
      return
    }
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('studies')
      .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setStudies((data as StudyCardType[] | null) ?? [])
        setLoading(false)
      })
  }, [query])

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860] dark:text-[#F3F1FA]">Buscar</h1>
      <SearchForm initialQuery={query} />

      {query && studies !== null && !loading && (
        <p className="text-sm text-[#8A8797]">
          {studies.length} resultado{studies.length !== 1 ? 's' : ''} para &quot;{query}&quot;
        </p>
      )}

      {loading && <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />)}</div>}

      {!loading && (
        <div className="flex flex-col gap-3">
          {studies?.map((study) => (
            <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
          ))}
        </div>
      )}

      {query && studies?.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#8A8797]">Nenhum estudo encontrado para &quot;{query}&quot;.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-[#8A8797]">Busque por título, tema ou versículo.</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6"><div className="h-8 w-32 rounded bg-[#2E2860]/10 animate-pulse" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

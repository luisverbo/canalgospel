'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import Link from 'next/link'
import { Suspense } from 'react'

interface Category { id: string; name: string; slug: string }

function StudiesContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<Category[]>([])
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('categories').select('id, name, slug').order('sort_order'),
      supabase
        .from('studies')
        .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50),
    ]).then(([catResult, studyResult]) => {
      setCategories((catResult.data as Category[] | null) ?? [])
      setStudies((studyResult.data as StudyCardType[] | null) ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = categoryFilter
    ? studies.filter((s) => s.categories?.slug === categoryFilter)
    : studies

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Estudos Bíblicos</h1>

      {!loading && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link href="/studies">
            <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categoryFilter ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 text-[#2E2860]'
            }`}>Todos</span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/studies?category=${cat.slug}`}>
              <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === cat.slug ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 text-[#2E2860]'
              }`}>{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-center text-[#8A8797] py-12">Nenhum estudo encontrado.</p>
          )}
          {filtered.map((study) => (
            <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StudiesPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-6"><div className="h-8 w-48 rounded bg-[#2E2860]/10 animate-pulse mb-4" /></div>}>
      <StudiesContent />
    </Suspense>
  )
}

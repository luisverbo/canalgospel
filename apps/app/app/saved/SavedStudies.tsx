'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { getFavoriteIds } from '@/lib/favorites'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import { Bookmark } from 'lucide-react'

export function SavedStudies() {
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSaved() {
    const ids = getFavoriteIds()
    if (ids.length === 0) {
      setStudies([])
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('studies')
      .select('id, title, slug, body, youtube_url, cover_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
      .in('id', ids)
      .eq('status', 'published')
    setStudies((data as StudyCardType[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadSaved()

    const handler = () => loadSaved()
    window.addEventListener('favorites-changed', handler)
    return () => window.removeEventListener('favorites-changed', handler)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />)}
      </div>
    )
  }

  if (studies.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark size={40} strokeWidth={1.5} className="mx-auto mb-3 text-[#2E2860]/20 dark:text-white/10" />
        <p className="text-[#8A8797]">Nenhum estudo salvo ainda.</p>
        <p className="text-sm text-[#8A8797] mt-1">Toque no ícone 🔖 em qualquer estudo para salvar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
      ))}
    </div>
  )
}

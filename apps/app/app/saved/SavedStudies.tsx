'use client'

import { useEffect, useState } from 'react'
import { cacheGet } from '@/lib/cache'
import { StudyCard } from '@/components/StudyCard'

interface SavedStudy {
  id: string
  title: string
  slug: string
  summary: string | null
  read_time_minutes: number
  published_at: string | null
  preacher: { name: string; slug: string; photo_url: string | null } | null
  category: { name: string; slug: string } | null
}

export function SavedStudies() {
  const [studies, setStudies] = useState<SavedStudy[]>([])

  useEffect(() => {
    const saved = cacheGet<SavedStudy[]>('saved_studies') ?? []
    setStudies(saved)
  }, [])

  if (studies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔖</p>
        <p className="text-[#8A8797]">Nenhum estudo salvo ainda.</p>
        <p className="text-sm text-[#8A8797] mt-1">
          Salve estudos para ler offline.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          preacher={study.preacher}
          category={study.category}
        />
      ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { cacheGet } from '@/lib/cache'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'

export function SavedStudies() {
  const [studies, setStudies] = useState<StudyCardType[]>([])

  useEffect(() => {
    const saved = cacheGet<StudyCardType[]>('saved_studies') ?? []
    setStudies(saved)
  }, [])

  if (studies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔖</p>
        <p className="text-[#8A8797]">Nenhum estudo salvo ainda.</p>
        <p className="text-sm text-[#8A8797] mt-1">Salve estudos para ler offline.</p>
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

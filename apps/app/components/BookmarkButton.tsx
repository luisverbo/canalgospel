'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { isFavorited, toggleFavorite } from '@/lib/favorites'

export function BookmarkButton({ studyId, className = '' }: { studyId: string; className?: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isFavorited(studyId))
  }, [studyId])

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleFavorite(studyId)
    setSaved(next)
    // Dispatch a custom event so SavedStudies page can react
    window.dispatchEvent(new CustomEvent('favorites-changed'))
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Remover dos salvos' : 'Salvar estudo'}
      className={`p-1 active:scale-90 transition-transform ${className}`}
    >
      <Bookmark
        size={20}
        strokeWidth={1.5}
        className={saved ? 'fill-[#E0A943] text-[#E0A943]' : 'text-[#8A8797] dark:text-white/40'}
      />
    </button>
  )
}

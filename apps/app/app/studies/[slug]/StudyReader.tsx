'use client'

import { useState } from 'react'
import { Badge } from '@canal-gospel/ui'
import Link from 'next/link'

interface Study {
  id: string
  title: string
  body: string
  summary: string | null
  youtube_url: string | null
  read_time_minutes: number
  published_at: string | null
}

interface Preacher {
  name: string
  slug: string
  photo_url: string | null
  church: string | null
  city: string | null
}

interface Category {
  name: string
  slug: string
}

export function StudyReader({
  study,
  preacher,
  category,
}: {
  study: Study
  preacher: Preacher | null
  category: Category | null
}) {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base')

  const fontSizeClass = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' }[fontSize]

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: study.title,
        text: study.summary ?? '',
        url: window.location.href,
      })
    }
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-[#17141F] text-white' : 'bg-[#FAF7F1] text-[#1E1B2E]'}`}
    >
      {/* Top bar */}
      <div
        className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? 'bg-[#17141F] border-white/10' : 'bg-[#FAF7F1] border-[#1E1B2E]/10'
        }`}
      >
        <Link href="/studies" className={darkMode ? 'text-white' : 'text-[#2E2860]'}>
          ← Voltar
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setFontSize((f) => (f === 'sm' ? 'base' : f === 'base' ? 'lg' : 'sm'))
            }
            className={`text-sm font-semibold ${darkMode ? 'text-white/70' : 'text-[#8A8797]'}`}
          >
            A{fontSize === 'lg' ? '+' : fontSize === 'sm' ? '-' : ''}
          </button>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className={`text-lg ${darkMode ? 'text-[#E0A943]' : 'text-[#2E2860]'}`}
          >
            {darkMode ? '☀' : '🌙'}
          </button>
          <button onClick={handleShare} className={darkMode ? 'text-white' : 'text-[#2E2860]'}>
            ↗
          </button>
        </div>
      </div>

      <article className="px-5 py-6 max-w-2xl mx-auto">
        {category && (
          <Badge variant="indigo" className="mb-3">
            {category.name}
          </Badge>
        )}

        <h1 className="text-2xl font-bold leading-snug mb-2">{study.title}</h1>

        {preacher && (
          <Link href={`/profile/${preacher.slug}`} className="flex items-center gap-3 mb-4">
            {preacher.photo_url ? (
              <img
                src={preacher.photo_url}
                alt={preacher.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#2E2860]/20 flex items-center justify-center text-sm font-bold text-[#2E2860]">
                {preacher.name[0]}
              </div>
            )}
            <div>
              <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-[#1E1B2E]'}`}>
                {preacher.name}
              </p>
              {preacher.church && (
                <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-[#8A8797]'}`}>
                  {preacher.church}
                </p>
              )}
            </div>
          </Link>
        )}

        <p className={`text-xs mb-6 ${darkMode ? 'text-white/40' : 'text-[#8A8797]'}`}>
          {study.read_time_minutes} min de leitura
          {study.published_at && ` · ${new Date(study.published_at).toLocaleDateString('pt-BR')}`}
        </p>

        {study.youtube_url && (
          <div className="mb-6 aspect-video rounded-xl overflow-hidden">
            <iframe
              src={study.youtube_url.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        <div
          className={`prose prose-p:leading-relaxed max-w-none ${fontSizeClass} ${
            darkMode ? 'prose-invert' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: study.body }}
        />
      </article>
    </div>
  )
}

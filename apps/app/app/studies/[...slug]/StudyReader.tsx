'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sun, Moon, Type, Share2 } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
import { youTubeEmbedUrl } from '@/lib/youtube'

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  read_time_min: number | null
  published_at: string | null
}

interface Preacher {
  display_name: string
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
  const cycleFontSize = () => setFontSize((f) => (f === 'sm' ? 'base' : f === 'base' ? 'lg' : 'sm'))

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: decodeHtml(study.title), url: window.location.href })
  }

  const bg = darkMode ? 'bg-[#17141F]' : 'bg-[#FAF7F1]'
  const text = darkMode ? 'text-[#D8D5E4]' : 'text-[#1E1B2E]'
  const border = darkMode ? 'border-white/8' : 'border-[#1E1B2E]/8'

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top bar */}
      <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b ${border} ${bg}`}>
        <Link href="/studies" className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? 'text-white/70' : 'text-[#2E2860]'}`}>
          <ArrowLeft size={18} strokeWidth={1.5} />
          Voltar
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={cycleFontSize} className={`text-xs font-bold ${darkMode ? 'text-white/50' : 'text-[#8A8797]'}`}>
            {fontSize === 'sm' ? 'Aa' : fontSize === 'base' ? 'AA' : 'AA+'}
          </button>
          <button onClick={() => setDarkMode((d) => !d)} className={darkMode ? 'text-[#E0A943]' : 'text-[#2E2860]'}>
            {darkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <button onClick={handleShare} className={darkMode ? 'text-white/70' : 'text-[#2E2860]'}>
            <Share2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <article className="px-5 py-6 max-w-2xl mx-auto">
        {category && (
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${
            darkMode ? 'bg-[#2E2860]/60 text-[#B5B0D8]' : 'bg-[#2E2860]/8 text-[#2E2860]'
          }`}>
            {decodeHtml(category.name)}
          </span>
        )}

        <h1 className={`text-2xl font-bold leading-snug mb-3 ${darkMode ? 'text-[#F3F1FA]' : 'text-[#1E1B2E]'}`}>
          {decodeHtml(study.title)}
        </h1>

        {preacher && (
          <Link href={`/profile/${preacher.slug}`} className="flex items-center gap-2.5 mb-4">
            {preacher.photo_url ? (
              <img src={preacher.photo_url} alt={preacher.display_name}
                className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#2E2860]/20 flex items-center justify-center text-xs font-bold text-[#2E2860]">
                {preacher.display_name[0]}
              </div>
            )}
            <div>
              <p className={`font-medium text-sm ${darkMode ? 'text-[#D8D5E4]' : 'text-[#1E1B2E]'}`}>
                {decodeHtml(preacher.display_name)}
              </p>
              {preacher.church && (
                <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-[#8A8797]'}`}>{preacher.church}</p>
              )}
            </div>
          </Link>
        )}

        {study.read_time_min && (
          <p className={`text-xs mb-6 flex items-center gap-1.5 ${darkMode ? 'text-white/30' : 'text-[#8A8797]'}`}>
            <Type size={12} strokeWidth={1.5} />
            {study.read_time_min} min de leitura
            {study.published_at && ` · ${new Date(study.published_at).toLocaleDateString('pt-BR')}`}
          </p>
        )}

        {study.youtube_url && youTubeEmbedUrl(study.youtube_url) && (
          <div className="mb-6 aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={youTubeEmbedUrl(study.youtube_url)}
              title={decodeHtml(study.title)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full" allowFullScreen />
          </div>
        )}

        {study.body && study.body.trim() && study.body.trim() !== ' ' && (
          <div
            className={`prose max-w-none ${fontSizeClass} leading-relaxed ${
              darkMode
                ? 'prose-invert prose-p:text-[#D8D5E4] prose-headings:text-[#F3F1FA]'
                : 'prose-p:text-[#1E1B2E]'
            }`}
            dangerouslySetInnerHTML={{ __html: decodeHtml(study.body) }}
          />
        )}
      </article>
    </div>
  )
}

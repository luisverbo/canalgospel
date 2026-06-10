'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sun, Moon, Share2 } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
import { youTubeEmbedUrl } from '@/lib/youtube'
import { linkifyPlainText, looksLikeHtml } from '@/lib/linkify'

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

        {/* Título — peso 500, tamanho contido */}
        <h1 className={`text-2xl font-medium leading-snug mb-2 ${darkMode ? 'text-[#F3F1FA]' : 'text-[#1E1B2E]'}`}>
          {decodeHtml(study.title)}
        </h1>

        {/* Linha de metadados: pregador · data */}
        {(preacher || study.published_at || study.read_time_min) && (
          <div className={`flex flex-wrap items-center gap-x-1.5 text-sm mb-6 ${darkMode ? 'text-white/40' : 'text-[#8A8797]'}`}>
            {preacher && (
              <Link href={`/profile/${preacher.slug}`} className="font-medium hover:underline">
                {decodeHtml(preacher.display_name)}
              </Link>
            )}
            {preacher && (study.published_at || study.read_time_min) && <span>·</span>}
            {study.published_at && (
              <span>{new Date(study.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            )}
            {study.read_time_min && (
              <>
                {(preacher || study.published_at) && <span>·</span>}
                <span>{study.read_time_min} min de leitura</span>
              </>
            )}
          </div>
        )}

        {study.youtube_url && youTubeEmbedUrl(study.youtube_url) && (
          <div className="my-6 aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={youTubeEmbedUrl(study.youtube_url)}
              title={decodeHtml(study.title)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full" allowFullScreen />
          </div>
        )}

        {study.body && study.body.trim() && study.body.trim() !== ' ' && (
          looksLikeHtml(study.body) ? (
            <div
              className={`prose max-w-none ${fontSizeClass} leading-relaxed ${
                darkMode
                  ? 'prose-invert prose-p:text-[#D8D5E4] prose-headings:text-[#F3F1FA] prose-a:text-[#E0A943]'
                  : 'prose-p:text-[#1E1B2E] prose-a:text-[#2E2860]'
              }`}
              dangerouslySetInnerHTML={{ __html: decodeHtml(study.body) }}
            />
          ) : (
            <div className={`${fontSizeClass} leading-relaxed ${darkMode ? 'text-[#D8D5E4]' : 'text-[#1E1B2E]'}`}>
              {linkifyPlainText(
                study.body,
                darkMode
                  ? 'text-[#E0A943] underline break-words'
                  : 'text-[#2E2860] underline break-words'
              )}
            </div>
          )
        )}
      </article>
    </div>
  )
}

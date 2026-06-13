'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sun, Moon, Share2 } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
import { youTubeEmbedUrl } from '@/lib/youtube'
import { linkifyPlainText, looksLikeHtml } from '@/lib/linkify'
import { useTheme } from '@/lib/theme'
import { BookmarkButton } from '@/components/BookmarkButton'

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  audio_url?: string | null
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
  const { theme, setTheme } = useTheme()
  const darkMode = theme === 'dark'
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base')

  const fontSizeClass = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' }[fontSize]
  const cycleFontSize = () => setFontSize((f) => (f === 'sm' ? 'base' : f === 'base' ? 'lg' : 'sm'))
  const toggleDark = () => setTheme(darkMode ? 'light' : 'dark')

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: decodeHtml(study.title), url: window.location.href })
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] dark:bg-[#17141F] text-[#1E1B2E] dark:text-[#D8D5E4]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-[#1E1B2E]/8 dark:border-white/8 bg-[#FAF7F1] dark:bg-[#17141F]">
        <Link href="/studies" className="flex items-center gap-1.5 text-sm font-medium text-[#2E2860] dark:text-white/70">
          <ArrowLeft size={18} strokeWidth={1.5} />
          Voltar
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={cycleFontSize} className="text-xs font-bold text-[#8A8797] dark:text-white/50">
            {fontSize === 'sm' ? 'Aa' : fontSize === 'base' ? 'AA' : 'AA+'}
          </button>
          <button onClick={toggleDark} className={darkMode ? 'text-[#E0A943]' : 'text-[#2E2860]'}>
            {darkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <BookmarkButton studyId={study.id} />
          <button onClick={handleShare} className="text-[#2E2860] dark:text-white/70">
            <Share2 size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <article className="px-5 py-6 max-w-2xl mx-auto">
        {category && (
          <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 bg-[#2E2860]/8 dark:bg-[#2E2860]/60 text-[#2E2860] dark:text-[#B5B0D8]">
            {decodeHtml(category.name)}
          </span>
        )}

        <h1 className="text-2xl font-medium leading-snug mb-2 text-[#1E1B2E] dark:text-[#F3F1FA]">
          {decodeHtml(study.title)}
        </h1>

        {(preacher || study.published_at || study.read_time_min) && (
          <div className="flex flex-wrap items-center gap-x-2 text-sm mb-6">
            {preacher && (
              <Link
                href={`/profile?slug=${preacher.slug}`}
                className="flex items-center gap-1.5 font-semibold text-[#2E2860] dark:text-[#E0A943] hover:underline"
              >
                {preacher.photo_url ? (
                  <img src={preacher.photo_url} alt={decodeHtml(preacher.display_name)}
                    className="h-8 w-8 rounded-full object-cover border border-[#2E2860]/20 dark:border-[#E0A943]/40 shrink-0" />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-[#2E2860]/10 dark:bg-[#E0A943]/20 flex items-center justify-center text-xs font-bold text-[#2E2860] dark:text-[#E0A943] shrink-0">
                    {preacher.display_name[0]}
                  </span>
                )}
                <span className="text-base">{decodeHtml(preacher.display_name)}</span>
              </Link>
            )}
            {preacher && (study.published_at || study.read_time_min) && (
              <span className="text-[#8A8797] dark:text-white/30">·</span>
            )}
            {study.published_at && (
              <span className="text-[#8A8797] dark:text-white/40">
                {new Date(study.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            )}
            {study.read_time_min && (
              <>
                {(preacher || study.published_at) && <span className="text-[#8A8797] dark:text-white/30">·</span>}
                <span className="text-[#8A8797] dark:text-white/40">{study.read_time_min} min de leitura</span>
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

        {study.audio_url && (
          <div className="my-6 bg-[#2E2860]/6 dark:bg-[#2E2860]/30 rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#2E2860] dark:text-[#B5B0D8] mb-2">🎧 Áudio da pregação</p>
            <audio
              controls
              src={study.audio_url}
              className="w-full"
              style={{ colorScheme: darkMode ? 'dark' : 'light' }}
            />
          </div>
        )}

        {study.body && study.body.trim() && study.body.trim() !== ' ' && (
          looksLikeHtml(study.body) ? (
            <div
              className={`prose max-w-none ${fontSizeClass} leading-relaxed prose-a:underline ${
                darkMode
                  ? 'prose-invert prose-p:text-[#D8D5E4] prose-headings:text-[#F3F1FA] prose-a:text-[#B5B0D8]'
                  : 'prose-p:text-[#1E1B2E] prose-a:text-[#2E2860]'
              }`}
              dangerouslySetInnerHTML={{ __html: decodeHtml(study.body) }}
            />
          ) : (
            <div className={`${fontSizeClass} leading-relaxed text-[#1E1B2E] dark:text-[#D8D5E4]`}>
              {linkifyPlainText(
                study.body,
                'text-[#2E2860] dark:text-[#E0A943] underline break-words'
              )}
            </div>
          )
        )}
      </article>
    </div>
  )
}

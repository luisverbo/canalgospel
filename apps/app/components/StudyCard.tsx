import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
import { youTubeThumb } from '@/lib/youtube'
import { BookmarkButton } from './BookmarkButton'
import type { Preacher, Category } from '@/lib/types'

interface StudyCardProps {
  study: {
    id: string
    title: string
    slug: string
    body?: string | null
    youtube_url?: string | null
    audio_url?: string | null
    cover_url?: string | null
    content_type?: string | null
    read_time_min?: number | null
    published_at?: string | null
  }
  preacher: Preacher | null
  category: Category | null
}

function extractFirstImage(html: string | null | undefined): string {
  if (!html) return ''
  const match = html.match(/<img[^>]+src="([^"]+)"/)
  return match?.[1] ?? ''
}

export function StudyCard({ study, preacher, category }: StudyCardProps) {
  const thumb =
    study.cover_url ||
    (study.youtube_url ? youTubeThumb(study.youtube_url) : '') ||
    extractFirstImage(study.body)

  return (
    <div className="relative flex items-center gap-3 bg-white dark:bg-[#211E2D] rounded-2xl p-3 border border-[#1E1B2E]/7 dark:border-white/7 active:scale-[0.98] transition-transform">
      {/* Link "esticado" cobre todo o card — clicar em qualquer área leva ao estudo */}
      <Link
        href={`/studies?slug=${study.slug}`}
        aria-label={decodeHtml(study.title)}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      <div className="h-16 w-24 shrink-0 rounded-xl overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={decodeHtml(study.title)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#2E2860] dark:bg-[#2E2860]/80 flex items-center justify-center">
            <BookOpen size={22} className="text-white/70" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {category && (
            <span className="inline-block text-[10px] font-semibold text-[#2E2860] dark:text-[#B5B0D8] bg-[#EDEAF6] dark:bg-[#2E2860]/40 px-2 py-0.5 rounded-full">
              {decodeHtml(category.name)}
            </span>
          )}
          {(study.content_type === 'video' || !!study.youtube_url) ? (
            <span className="inline-block text-[10px] font-semibold text-[#1E1B2E] bg-[#E0A943] px-2 py-0.5 rounded-full">▶ Vídeo</span>
          ) : (study.content_type === 'audio' || (!!study.audio_url && !study.youtube_url)) ? (
            <span className="inline-block text-[10px] font-semibold text-white bg-[#2E2860] px-2 py-0.5 rounded-full">🎧 Áudio</span>
          ) : (
            <span className="inline-block text-[10px] font-semibold text-[#8A8797] bg-[#1E1B2E]/8 dark:bg-white/10 dark:text-white/50 px-2 py-0.5 rounded-full">📖 Texto</span>
          )}
        </div>
        <h3 className="font-medium text-sm text-[#1E1B2E] dark:text-[#F3F1FA] leading-snug line-clamp-2">
          {decodeHtml(study.title)}
        </h3>
        <div className="flex items-center gap-1 mt-1 min-w-0">
          {preacher ? (
            <Link
              href={`/profile?slug=${preacher.slug}`}
              className="relative z-10 flex items-center gap-1 min-w-0 hover:underline"
            >
              {preacher.photo_url ? (
                <img src={preacher.photo_url} alt={decodeHtml(preacher.display_name)}
                  className="h-4 w-4 rounded-full object-cover shrink-0 border border-[#2E2860]/15 dark:border-white/15" />
              ) : (
                <span className="h-4 w-4 rounded-full bg-[#2E2860]/10 dark:bg-[#E0A943]/20 flex items-center justify-center text-[8px] font-bold text-[#2E2860] dark:text-[#E0A943] shrink-0">
                  {preacher.display_name[0]}
                </span>
              )}
              <span className="text-[11px] font-semibold text-[#2E2860] dark:text-[#E0A943] truncate">
                {decodeHtml(preacher.display_name)}
              </span>
            </Link>
          ) : null}
          {preacher && study.read_time_min ? (
            <span className="text-[11px] text-[#8A8797] dark:text-white/40 shrink-0"> · {study.read_time_min} min</span>
          ) : study.read_time_min ? (
            <span className="text-[11px] text-[#8A8797] dark:text-white/40">{study.read_time_min} min</span>
          ) : null}
        </div>
      </div>

      {/* Acima do link esticado para permanecer clicável */}
      <span className="relative z-10">
        <BookmarkButton studyId={study.id} />
      </span>
    </div>
  )
}

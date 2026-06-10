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
    cover_url?: string | null
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
    <div className="flex items-center gap-3 bg-white dark:bg-[#211E2D] rounded-2xl p-3 border border-[#1E1B2E]/7 dark:border-white/7">
      <Link href={`/studies/${study.slug}`} className="h-16 w-24 shrink-0 rounded-xl overflow-hidden active:scale-[0.98] transition-transform">
        {thumb ? (
          <img src={thumb} alt={decodeHtml(study.title)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#2E2860] dark:bg-[#2E2860]/80 flex items-center justify-center">
            <BookOpen size={22} className="text-white/70" strokeWidth={1.5} />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {category && (
          <span className="inline-block text-[10px] font-semibold text-[#2E2860] dark:text-[#B5B0D8] bg-[#EDEAF6] dark:bg-[#2E2860]/40 px-2 py-0.5 rounded-full mb-1">
            {decodeHtml(category.name)}
          </span>
        )}
        <Link href={`/studies/${study.slug}`}>
          <h3 className="font-medium text-sm text-[#1E1B2E] dark:text-[#F3F1FA] leading-snug line-clamp-2">
            {decodeHtml(study.title)}
          </h3>
        </Link>
        <p className="text-[11px] text-[#8A8797] dark:text-white/40 mt-1 truncate">
          {preacher ? (
            <Link href={`/profile/${preacher.slug}`} className="hover:underline font-medium text-[#2E2860] dark:text-[#B5B0D8]">
              {decodeHtml(preacher.display_name)}
            </Link>
          ) : null}
          {preacher && study.read_time_min ? ' · ' : ''}
          {study.read_time_min ? `${study.read_time_min} min` : ''}
        </p>
      </div>

      <BookmarkButton studyId={study.id} />
    </div>
  )
}

import Link from 'next/link'
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
    read_time_min?: number | null
    published_at?: string | null
  }
  preacher: Preacher | null
  category: Category | null
}

export function StudyCard({ study, preacher, category }: StudyCardProps) {
  const thumb = study.youtube_url ? youTubeThumb(study.youtube_url) : ''

  const metaParts = [
    preacher ? decodeHtml(preacher.display_name) : null,
    study.read_time_min ? `${study.read_time_min} min` : null,
  ].filter(Boolean)

  return (
    <Link href={`/studies/${study.slug}`}>
      <div className="flex items-center gap-3 bg-white dark:bg-[#211E2D] rounded-2xl p-3 border border-[#1E1B2E]/7 dark:border-white/7 active:scale-[0.98] transition-transform">
        {thumb && (
          <div className="h-16 w-24 shrink-0 rounded-xl bg-[#EDEAF6] dark:bg-[#2E2860]/30 overflow-hidden">
            <img src={thumb} alt={decodeHtml(study.title)} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {category && (
            <span className="inline-block text-[10px] font-semibold text-[#2E2860] dark:text-[#B5B0D8] bg-[#EDEAF6] dark:bg-[#2E2860]/40 px-2 py-0.5 rounded-full mb-1">
              {decodeHtml(category.name)}
            </span>
          )}
          <h3 className="font-medium text-sm text-[#1E1B2E] dark:text-[#F3F1FA] leading-snug line-clamp-2">
            {decodeHtml(study.title)}
          </h3>
          {metaParts.length > 0 && (
            <p className="text-[11px] text-[#8A8797] dark:text-white/40 mt-1 truncate">{metaParts.join(' · ')}</p>
          )}
        </div>

        <BookmarkButton studyId={study.id} />
      </div>
    </Link>
  )
}

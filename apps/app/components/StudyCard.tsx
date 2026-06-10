import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import { decodeHtml } from '@/lib/html'
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

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match?.[1] ?? ''
}

export function StudyCard({ study, preacher, category }: StudyCardProps) {
  const isVideo = !!study.youtube_url
  const thumb = isVideo ? `https://img.youtube.com/vi/${extractYouTubeId(study.youtube_url!)}/mqdefault.jpg` : null

  return (
    <Link href={`/studies/${study.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-[#1E1B2E]/7 active:scale-[0.98] transition-transform">
        <div className="flex gap-0">
          {/* Thumbnail or colored swatch */}
          <div className="w-20 h-20 shrink-0 bg-[#2E2860]/8 flex items-center justify-center overflow-hidden">
            {thumb ? (
              <img src={thumb} alt={study.title} className="w-full h-full object-cover" />
            ) : (
              <BookIcon />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 p-3">
            {category && (
              <span className="inline-block text-[10px] font-semibold text-[#2E2860] bg-[#2E2860]/8 px-2 py-0.5 rounded-full mb-1">
                {decodeHtml(category.name)}
              </span>
            )}
            <h3 className="font-medium text-sm text-[#1E1B2E] leading-snug line-clamp-2 mb-1.5">
              {decodeHtml(study.title)}
            </h3>
            <div className="flex items-center gap-2.5 text-[11px] text-[#8A8797]">
              {preacher && (
                <span className="flex items-center gap-1 min-w-0">
                  {preacher.photo_url ? (
                    <img src={preacher.photo_url} alt={preacher.display_name}
                      className="h-3.5 w-3.5 rounded-full object-cover shrink-0" />
                  ) : (
                    <User size={12} strokeWidth={1.5} className="shrink-0" />
                  )}
                  <span className="truncate">{decodeHtml(preacher.display_name)}</span>
                </span>
              )}
              {study.read_time_min && (
                <span className="flex items-center gap-0.5 shrink-0">
                  <Clock size={11} strokeWidth={1.5} />
                  {study.read_time_min} min
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E2860" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

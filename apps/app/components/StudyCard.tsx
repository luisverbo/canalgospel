import { Badge } from '@canal-gospel/ui'
import Link from 'next/link'
import type { Preacher, Category } from '@/lib/types'

interface StudyCardProps {
  study: {
    id: string
    title: string
    slug: string
    body?: string | null
    read_time_min?: number | null
    published_at?: string | null
  }
  preacher: Preacher | null
  category: Category | null
}

export function StudyCard({ study, preacher, category }: StudyCardProps) {
  return (
    <Link href={`/studies/${study.slug}`}>
      <div className="bg-white rounded-2xl p-4 border border-[#1E1B2E]/8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {category && (
              <Badge variant="indigo" className="mb-2">{category.name}</Badge>
            )}
            <h3 className="font-semibold text-[#1E1B2E] leading-snug line-clamp-2 mb-1">
              {study.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-[#8A8797]">
              {preacher && (
                <span className="flex items-center gap-1.5">
                  {preacher.photo_url ? (
                    <img src={preacher.photo_url} alt={preacher.display_name}
                      className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-[#2E2860]/10 inline-flex items-center justify-center text-[8px] font-bold text-[#2E2860]">
                      {preacher.display_name[0]}
                    </span>
                  )}
                  {preacher.display_name}
                </span>
              )}
              {study.read_time_min && (
                <>
                  <span>·</span>
                  <span>{study.read_time_min} min</span>
                </>
              )}
              {study.published_at && (
                <>
                  <span>·</span>
                  <span>{new Date(study.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-[#2E2860] text-lg shrink-0 mt-1">→</span>
        </div>
      </div>
    </Link>
  )
}

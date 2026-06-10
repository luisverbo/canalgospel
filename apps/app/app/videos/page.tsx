'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { decodeHtml } from '@/lib/html'
import Link from 'next/link'
import { Play, User } from 'lucide-react'

interface VideoStudy {
  id: string
  title: string
  slug: string
  youtube_url: string | null
  preachers: { display_name: string; slug: string; photo_url: string | null } | null
}

interface PreacherGroup {
  preacher: { display_name: string; slug: string; photo_url: string | null } | null
  studies: VideoStudy[]
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match?.[1] ?? ''
}

export default function VideosPage() {
  const [groups, setGroups] = useState<PreacherGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('studies')
      .select('id, title, slug, youtube_url, preachers(display_name, slug, photo_url)')
      .eq('status', 'published')
      .not('youtube_url', 'is', null)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        const studies = (data as VideoStudy[] | null) ?? []

        const map = new Map<string, PreacherGroup>()

        studies.forEach((study) => {
          const key = study.preachers?.slug ?? '__none__'
          if (!map.has(key)) {
            map.set(key, { preacher: study.preachers ?? null, studies: [] })
          }
          map.get(key)!.studies.push(study)
        })

        setGroups(Array.from(map.values()))
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-4">
        <div className="h-8 w-32 rounded-lg bg-[#2E2860]/10 animate-pulse" />
        {[1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-white/60 animate-pulse" />)}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <Play size={40} className="text-[#2E2860]/20 mb-3" />
        <p className="text-[#8A8797] text-center">Nenhum vídeo disponível.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-[#2E2860]">Vídeos</h1>

      {groups.map(({ preacher, studies }) => (
        <section key={preacher?.slug ?? '__none__'}>
          {/* Preacher header */}
          {preacher ? (
            <Link href={`/profile/${preacher.slug}`} className="flex items-center gap-3 mb-3">
              {preacher.photo_url ? (
                <img src={preacher.photo_url} alt={preacher.display_name}
                  className="h-10 w-10 rounded-full object-cover border border-[#1E1B2E]/8" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#2E2860]/10 flex items-center justify-center">
                  <User size={18} className="text-[#2E2860]" strokeWidth={1.5} />
                </div>
              )}
              <span className="font-semibold text-[#1E1B2E]">{decodeHtml(preacher.display_name)}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#2E2860]/10 flex items-center justify-center">
                <User size={18} className="text-[#2E2860]" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-[#1E1B2E]">Canal Gospel</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {studies.map((study) => (
              <Link key={study.id} href={`/studies/${study.slug}`}>
                <div className="flex gap-3 bg-white rounded-2xl overflow-hidden border border-[#1E1B2E]/7 active:scale-[0.98] transition-transform">
                  <div className="h-20 w-28 shrink-0 bg-[#2E2860]/8 overflow-hidden">
                    {study.youtube_url ? (
                      <img
                        src={`https://img.youtube.com/vi/${extractYouTubeId(study.youtube_url)}/mqdefault.jpg`}
                        alt={study.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} className="text-[#2E2860]/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-center">
                    <p className="font-medium text-sm text-[#1E1B2E] line-clamp-2 leading-snug">
                      {decodeHtml(study.title)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

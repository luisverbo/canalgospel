'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import Link from 'next/link'

interface VideoStudy {
  id: string
  title: string
  slug: string
  youtube_url: string | null
  read_time_min: number | null
  preachers: { display_name: string; slug: string; photo_url: string | null } | null
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match?.[1] ?? ''
}

export default function VideosPage() {
  const [byPreacher, setByPreacher] = useState<Map<string, {
    preacher: { display_name: string; slug: string; photo_url: string | null }
    studies: VideoStudy[]
  }>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('studies')
      .select('id, title, slug, youtube_url, read_time_min, preachers(display_name, slug, photo_url)')
      .eq('status', 'published')
      .not('youtube_url', 'is', null)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        const studies = (data as VideoStudy[] | null) ?? []
        const map = new Map<string, { preacher: { display_name: string; slug: string; photo_url: string | null }; studies: VideoStudy[] }>()
        studies.forEach((study) => {
          const p = study.preachers
          if (!p) return
          if (!map.has(p.slug)) map.set(p.slug, { preacher: p, studies: [] })
          map.get(p.slug)!.studies.push(study)
        })
        setByPreacher(map)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-4">
        <div className="h-8 w-32 rounded bg-[#2E2860]/10 animate-pulse" />
        {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Vídeos</h1>

      {Array.from(byPreacher.values()).map(({ preacher, studies }) => (
        <section key={preacher.slug}>
          <Link href={`/profile/${preacher.slug}`} className="flex items-center gap-3 mb-3">
            {preacher.photo_url ? (
              <img src={preacher.photo_url} alt={preacher.display_name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#2E2860]/20 flex items-center justify-center font-bold text-[#2E2860]">
                {preacher.display_name[0]}
              </div>
            )}
            <span className="font-semibold text-[#1E1B2E]">{preacher.display_name}</span>
          </Link>

          <div className="flex flex-col gap-3">
            {studies.map((study) => (
              <Link key={study.id} href={`/studies/${study.slug}`}>
                <div className="flex gap-3 bg-white rounded-2xl p-3 border border-[#1E1B2E]/8 shadow-sm">
                  <div className="h-16 w-24 rounded-xl bg-[#2E2860]/10 shrink-0 overflow-hidden">
                    {study.youtube_url ? (
                      <img src={`https://img.youtube.com/vi/${extractYouTubeId(study.youtube_url)}/mqdefault.jpg`}
                        alt={study.title} className="w-full h-full object-cover" />
                    ) : <span className="text-2xl flex items-center justify-center h-full">▶</span>}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <p className="font-medium text-sm text-[#1E1B2E] line-clamp-2">{study.title}</p>
                    {study.read_time_min && <p className="text-xs text-[#8A8797]">{study.read_time_min} min</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {byPreacher.size === 0 && (
        <p className="text-center text-[#8A8797] py-16">Nenhum vídeo disponível.</p>
      )}
    </div>
  )
}

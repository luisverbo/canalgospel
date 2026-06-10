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

export default async function VideosPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('studies')
    .select('id, title, slug, youtube_url, read_time_min, preachers(display_name, slug, photo_url)')
    .eq('status', 'published')
    .not('youtube_url', 'is', null)
    .order('published_at', { ascending: false })

  const studies = data as VideoStudy[] | null

  const byPreacher = new Map<string, {
    preacher: { display_name: string; slug: string; photo_url: string | null }
    studies: VideoStudy[]
  }>()

  studies?.forEach((study) => {
    const p = study.preachers
    if (!p) return
    const key = p.slug
    if (!byPreacher.has(key)) byPreacher.set(key, { preacher: p, studies: [] })
    byPreacher.get(key)!.studies.push(study)
  })

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Vídeos</h1>

      {Array.from(byPreacher.values()).map(({ preacher, studies: ps }) => (
        <section key={preacher.slug}>
          <Link href={`/profile/${preacher.slug}`} className="flex items-center gap-3 mb-3">
            {preacher.photo_url ? (
              <img src={preacher.photo_url} alt={preacher.display_name}
                className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#2E2860]/20 flex items-center justify-center font-bold text-[#2E2860]">
                {preacher.display_name[0]}
              </div>
            )}
            <span className="font-semibold text-[#1E1B2E]">{preacher.display_name}</span>
          </Link>

          <div className="flex flex-col gap-3">
            {ps.map((study) => (
              <Link key={study.id} href={`/studies/${study.slug}`}>
                <div className="flex gap-3 bg-white rounded-2xl p-3 border border-[#1E1B2E]/8 shadow-sm">
                  <div className="h-16 w-24 rounded-xl bg-[#2E2860]/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {study.youtube_url ? (
                      <img
                        src={`https://img.youtube.com/vi/${extractYouTubeId(study.youtube_url)}/mqdefault.jpg`}
                        alt={study.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">▶</span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <p className="font-medium text-sm text-[#1E1B2E] line-clamp-2">{study.title}</p>
                    {study.read_time_min && (
                      <p className="text-xs text-[#8A8797]">{study.read_time_min} min</p>
                    )}
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

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match?.[1] ?? ''
}

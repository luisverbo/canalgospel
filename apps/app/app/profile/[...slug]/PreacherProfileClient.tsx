'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { useSlug } from '@/lib/useSlug'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import Link from 'next/link'
import { PixButton } from './PixButton'

interface PreacherRow {
  id: string
  display_name: string
  slug: string
  bio: string | null
  church: string | null
  city: string | null
  photo_url: string | null
  instagram: string | null
  whatsapp: string | null
  pix_key: string | null
}

export function PreacherProfileClient() {
  const { slug, resolved } = useSlug('profile')

  const [preacher, setPreacher] = useState<PreacherRow | null>(null)
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!resolved) return
    if (!slug) { setNotFound(true); setLoading(false); return }
    const supabase = createClient()
    Promise.all([
      supabase
        .from('preachers')
        .select('id, display_name, slug, bio, church, city, photo_url, instagram, whatsapp, pix_key')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle(),
      supabase
        .from('studies')
        .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20),
    ]).then(([preacherResult, studiesResult]) => {
      if (!preacherResult.data) { setNotFound(true); setLoading(false); return }
      setPreacher(preacherResult.data as PreacherRow)
      const all = (studiesResult.data as StudyCardType[] | null) ?? []
      setStudies(all.filter((s) => s.preachers?.slug === slug))
      setLoading(false)
    })
  }, [slug, resolved])

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="bg-[#2E2860] h-48 animate-pulse" />
        <div className="px-5 py-5 flex flex-col gap-4">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (notFound || !preacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[#8A8797]">Pregador não encontrado.</p>
        <Link href="/" className="mt-4 text-[#2E2860] font-medium">← Voltar</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#2E2860] px-5 pt-10 pb-8 text-white">
        <Link href="/" className="text-white/70 text-sm mb-4 block">← Voltar</Link>
        <div className="flex items-center gap-4">
          {preacher.photo_url ? (
            <img src={preacher.photo_url} alt={preacher.display_name}
              className="h-20 w-20 rounded-full object-cover border-2 border-[#E0A943]" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-[#E0A943]/30 flex items-center justify-center text-3xl font-bold text-[#E0A943]">
              {preacher.display_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{preacher.display_name}</h1>
            {preacher.church && <p className="text-white/70 text-sm">{preacher.church}</p>}
            {preacher.city && <p className="text-white/50 text-xs">{preacher.city}</p>}
          </div>
        </div>
        <div className="mt-5">
          <div className="text-center inline-block">
            <p className="text-xl font-bold text-[#E0A943]">{studies.length}</p>
            <p className="text-xs text-white/60">Estudos</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">
        {preacher.bio && (
          <section>
            <h2 className="text-base font-semibold text-[#1E1B2E] mb-2">Sobre</h2>
            <p className="text-sm text-[#8A8797] leading-relaxed">{preacher.bio}</p>
          </section>
        )}

        <div className="flex gap-3 flex-wrap">
          {preacher.instagram && (
            <a href={`https://instagram.com/${preacher.instagram}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E2860]/10 text-[#2E2860] text-sm font-medium">
              📸 Instagram
            </a>
          )}
          {preacher.whatsapp && (
            <a href={`https://wa.me/${preacher.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
              💬 WhatsApp
            </a>
          )}
        </div>

        {preacher.pix_key && (
          <PixButton pixKey={preacher.pix_key} preacherName={preacher.display_name} />
        )}

        <section>
          <h2 className="text-base font-semibold text-[#1E1B2E] mb-3">Estudos ({studies.length})</h2>
          <div className="flex flex-col gap-3">
            {studies.map((study) => (
              <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

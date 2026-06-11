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

export function PreacherProfileClient({ slugOverride }: { slugOverride?: string }) {
  const { slug: slugFromPath, resolved } = useSlug('profile')
  const slug = slugOverride !== undefined ? slugOverride : slugFromPath

  const [preacher, setPreacher] = useState<PreacherRow | null>(null)
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // When slug comes from query param (slugOverride), skip waiting for path resolution
    if (slugOverride === undefined && !resolved) return
    if (!slug) { setNotFound(true); setLoading(false); return }
    const supabase = createClient()
    supabase
      .from('preachers')
      .select('id, display_name, slug, bio, church, city, photo_url, instagram, whatsapp, pix_key')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()
      .then(async ({ data: preacherData }) => {
        if (!preacherData) { setNotFound(true); setLoading(false); return }
        setPreacher(preacherData as PreacherRow)
        const { data: studiesData } = await supabase
          .from('studies')
          .select('id, title, slug, body, youtube_url, cover_url, view_count, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
          .eq('status', 'published')
          .eq('preacher_id', (preacherData as PreacherRow).id)
          .order('published_at', { ascending: false })
          .limit(50)
        const list = (studiesData as (StudyCardType & { view_count?: number })[] | null) ?? []
        setStudies(list)
        setTotalViews(list.reduce((sum, s) => sum + (s.view_count ?? 0), 0))
        setLoading(false)
      })
  }, [slug, resolved])

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="bg-[#2E2860] h-64 animate-pulse" />
        <div className="px-5 py-5 flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />)}
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

  const whatsappClean = preacher.whatsapp?.replace(/\D/g, '') ?? ''
  const inviteUrl = preacher.whatsapp
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        `Olá! Conheci seu perfil no Canal Gospel. ${typeof window !== 'undefined' ? window.location.href : ''}`,
      )}`
    : null

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F1] dark:bg-[#12101C]">
      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <div className="bg-[#2E2860] px-5 pt-10 pb-8 text-white relative">
        <Link href="/" className="text-white/60 text-sm mb-6 block">← Voltar</Link>

        {/* Avatar centrado */}
        <div className="flex flex-col items-center text-center gap-3">
          {preacher.photo_url ? (
            <img
              src={preacher.photo_url}
              alt={preacher.display_name}
              className="h-24 w-24 rounded-full object-cover border-[3px] border-[#E0A943] shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-[#E0A943]/20 border-[3px] border-[#E0A943] flex items-center justify-center text-4xl font-bold text-[#E0A943] shadow-lg">
              {preacher.display_name[0]}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold tracking-tight">{preacher.display_name}</h1>
            {preacher.church && (
              <p className="text-white/75 text-sm mt-0.5">{preacher.church}</p>
            )}
            {preacher.city && (
              <p className="text-white/50 text-xs mt-0.5">{preacher.city}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E0A943]">{studies.length}</p>
              <p className="text-xs text-white/55 mt-0.5">Estudos</p>
            </div>
            <div className="w-px bg-white/15 self-stretch" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E0A943]">{totalViews.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-white/55 mt-0.5">Leituras</p>
            </div>
          </div>

          {/* Bio inline no header */}
          {preacher.bio && (
            <p className="text-sm text-white/70 leading-relaxed max-w-sm mt-1">{preacher.bio}</p>
          )}
        </div>
      </div>

      {/* ── AÇÕES ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 flex flex-col gap-3">

        {/* PIX — botão dourado em destaque */}
        {preacher.pix_key && (
          <PixButton pixKey={preacher.pix_key} preacherName={preacher.display_name} />
        )}

        {/* Redes sociais */}
        {(inviteUrl || preacher.instagram) && (
          <div className="flex gap-3 flex-wrap">
            {inviteUrl && (
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-200 dark:border-emerald-800"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.054 23.447a.5.5 0 0 0 .607.607l5.585-1.479A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.628-.5-5.148-1.37l-.368-.215-3.815 1.01 1.01-3.815-.215-.368A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Convidar
              </a>
            )}
            {preacher.instagram && (
              <a
                href={`https://instagram.com/${preacher.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E2860]/8 dark:bg-white/10 text-[#2E2860] dark:text-[#B5B0D8] text-sm font-semibold border border-[#2E2860]/15 dark:border-white/15"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                @{preacher.instagram}
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── CONTEÚDOS ───────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-24">
        <h2 className="text-base font-semibold text-[#1E1B2E] dark:text-[#F3F1FA] mb-3">
          Estudos e Vídeos
          <span className="ml-2 text-xs font-normal text-[#8A8797]">({studies.length})</span>
        </h2>
        {studies.length > 0 ? (
          <div className="flex flex-col gap-3">
            {studies.map((study) => (
              <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📖</p>
            <p className="text-sm text-[#8A8797]">Nenhum conteúdo publicado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

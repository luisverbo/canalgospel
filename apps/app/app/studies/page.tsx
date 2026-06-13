'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import { NativeAdCard } from '@/components/NativeAdCard'
import { StudyReader } from './[...slug]/StudyReader'
import { canShowInterstitial, markInterstitialShown, shouldShowAds } from '@/lib/ads'
import type { StudyCard as StudyCardType } from '@/lib/types'
import Link from 'next/link'

interface Category { id: string; name: string; slug: string }

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  audio_url: string | null
  read_time_min: number | null
  published_at: string | null
  preachers: { display_name: string; slug: string; photo_url: string | null; church: string | null; city: string | null } | null
  categories: { name: string; slug: string } | null
}

// ─── Study detail view (loaded when ?slug= is present) ────────────────────────

function StudyDetail({ slug }: { slug: string }) {
  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return }
    const supabase = createClient()
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, audio_url, read_time_min, published_at, preachers(display_name, slug, photo_url, church, city), categories(name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return }
        setStudy(data as Study)
        // Increment view count (best-effort)
        supabase.rpc('increment_study_view', { p_study_id: (data as Study).id }).then(() => {}, () => {})
        // AdMob interstitial (frequency-limited, native only)
        if (shouldShowAds() && canShowInterstitial()) {
          markInterstitialShown()
          ;(async () => {
            try {
              const { Capacitor } = await import('@capacitor/core')
              if (!Capacitor.isNativePlatform()) return
              console.log('[interstitial] attempting to show…')
              const { AdMob } = await import('@capacitor-community/admob')
              const adId = process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID ?? 'ca-app-pub-3940256099942544/1033173712'
              await AdMob.prepareInterstitial({ adId, isTesting: true })
              await AdMob.showInterstitial()
              console.log('[interstitial] shown ✓')
            } catch (e) {
              console.warn('[interstitial] failed:', e)
            }
          })()
        }
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="px-5 py-6 flex flex-col gap-4">
        <div className="h-6 w-32 rounded bg-[#2E2860]/10 animate-pulse" />
        <div className="h-8 w-full rounded bg-[#2E2860]/10 animate-pulse" />
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 rounded bg-[#1E1B2E]/5 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (notFound || !study) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[#8A8797] text-center">Estudo não encontrado.</p>
        <Link href="/studies" className="mt-4 text-[#2E2860] dark:text-[#B5B0D8] font-medium text-sm">
          ← Ver todos os estudos
        </Link>
      </div>
    )
  }

  return <StudyReader study={study} preacher={study.preachers} category={study.categories} />
}

// ─── Studies list (loaded when no ?slug=) ─────────────────────────────────────

function StudiesContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<Category[]>([])
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('categories').select('id, name, slug').order('sort_order'),
      supabase
        .from('studies')
        .select('id, title, slug, body, youtube_url, audio_url, cover_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50),
    ]).then(([catResult, studyResult]) => {
      setCategories((catResult.data as Category[] | null) ?? [])
      setStudies((studyResult.data as StudyCardType[] | null) ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = categoryFilter
    ? studies.filter((s) => s.categories?.slug === categoryFilter)
    : studies

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860] dark:text-[#F3F1FA]">Estudos Bíblicos</h1>

      {!loading && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link href="/studies">
            <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categoryFilter ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 dark:bg-white/10 text-[#2E2860] dark:text-[#B5B0D8]'
            }`}>Todos</span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/studies?category=${cat.slug}`}>
              <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === cat.slug ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 dark:bg-white/10 text-[#2E2860] dark:text-[#B5B0D8]'
              }`}>{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-center text-[#8A8797] py-12">Nenhum estudo encontrado.</p>
          )}
          {filtered.map((study, idx) => (
            <div key={study.id}>
              {idx > 0 && idx % 5 === 0 && <NativeAdCard />}
              <StudyCard study={study} preacher={study.preachers} category={study.categories} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Router: list or detail based on ?slug= ───────────────────────────────────

function StudiesRouter() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')

  if (slug) return <StudyDetail slug={slug} />
  return <StudiesContent />
}

export default function StudiesPage() {
  return (
    <Suspense fallback={
      <div className="px-4 pt-6 flex flex-col gap-3">
        <div className="h-8 w-48 rounded bg-[#2E2860]/10 animate-pulse mb-1" />
        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />)}
      </div>
    }>
      <StudiesRouter />
    </Suspense>
  )
}

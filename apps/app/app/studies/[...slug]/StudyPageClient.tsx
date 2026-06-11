'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { useSlug } from '@/lib/useSlug'
import { StudyReader } from './StudyReader'
import { canShowInterstitial, markInterstitialShown, shouldShowAds } from '@/lib/ads'

interface Study {
  id: string
  title: string
  body: string | null
  youtube_url: string | null
  read_time_min: number | null
  published_at: string | null
  preachers: { display_name: string; slug: string; photo_url: string | null; church: string | null; city: string | null } | null
  categories: { name: string; slug: string } | null
}

export function StudyPageClient() {
  const { slug, resolved } = useSlug('studies')

  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound404, setNotFound404] = useState(false)

  useEffect(() => {
    if (!resolved) return
    if (!slug) { setNotFound404(true); setLoading(false); return }
    const supabase = createClient()
    supabase
      .from('studies')
      .select('id, title, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url, church, city), categories(name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound404(true)
        else {
          setStudy(data as Study)
          supabase.rpc('increment_study_view', { p_study_id: (data as Study).id }).then(
            () => {},
            () => {},
          )
          // AdMob interstitial after study opens (frequency-limited, never during read)
          if (shouldShowAds() && canShowInterstitial()) {
            markInterstitialShown()
            import('@capacitor/core').then(({ Capacitor }) => {
              if (!Capacitor.isNativePlatform()) return
              import('@capacitor-community/admob').then(({ AdMob }) => {
                const adId = process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID
                  ?? 'ca-app-pub-3940256099942544/1033173712'
                AdMob.prepareInterstitial({ adId, isTesting: process.env.NODE_ENV !== 'production' })
                  .then(() => AdMob.showInterstitial())
                  .catch(() => {})
              }).catch(() => {})
            })
          }
        }
        setLoading(false)
      })
  }, [slug, resolved])

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

  if (notFound404 || !study) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[#8A8797] text-center">Estudo não encontrado.</p>
      </div>
    )
  }

  return <StudyReader study={study} preacher={study.preachers} category={study.categories} />
}

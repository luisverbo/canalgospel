'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { fetchActiveCampaigns, pickCampaign, recordImpression, recordClick, shouldShowAds } from '@/lib/ads'
import type { AdCampaign } from '@/lib/ads'

// Anúncios de teste apenas quando NEXT_PUBLIC_ADMOB_TESTING === 'true'.
// Em produção (flag ausente/false) exibe anúncios reais.
const AD_TESTING = process.env.NEXT_PUBLIC_ADMOB_TESTING === 'true'

let admobInitialized = false

async function initAdMob() {
  if (admobInitialized) return
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.initialize({ initializeForTesting: AD_TESTING })
    admobInitialized = true
  } catch { /* plugin unavailable — safe to ignore */ }
}

async function showAdMobBanner() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await initAdMob()
    const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob')
    await AdMob.showBanner({
      adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID ?? 'ca-app-pub-3940256099942544/6300978111',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 56,
      isTesting: AD_TESTING,
    })
  } catch { /* AdMob unavailable or no fill — not fatal */ }
}

async function hideAdMobBanner() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.removeBanner()
  } catch { /* ignore */ }
}

export function AdBanner() {
  const [ownAd, setOwnAd] = useState<AdCampaign | null | undefined>(undefined)

  useEffect(() => {
    if (!shouldShowAds()) {
      setOwnAd(null)
      hideAdMobBanner().catch(() => {})
      return
    }

    let cancelled = false

    fetchActiveCampaigns('banner')
      .then((campaigns) => {
        if (cancelled) return
        const picked = pickCampaign(campaigns)
        setOwnAd(picked ?? null)

        if (picked) {
          recordImpression(picked.id).catch(() => {})
          hideAdMobBanner().catch(() => {})
        } else {
          showAdMobBanner().catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) setOwnAd(null)
      })

    return () => {
      cancelled = true
      hideAdMobBanner().catch(() => {})
    }
  }, [])

  if (!shouldShowAds()) return null
  if (ownAd === undefined) return null

  if (ownAd) {
    const handleClick = () => {
      recordClick(ownAd.id).catch(() => {})
      try { window.open(ownAd.target_url, '_blank', 'noopener,noreferrer') } catch { /* ignore */ }
    }
    return (
      <button
        onClick={handleClick}
        className="fixed left-0 right-0 z-40 flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#211E2D] border-t border-[#E0A943]/30 active:scale-[0.99] transition-transform"
        style={{ bottom: 56, minHeight: 56 }}
      >
        {ownAd.image_url && (
          <img src={ownAd.image_url} alt={ownAd.advertiser_name} className="h-9 w-14 shrink-0 rounded-lg object-cover" />
        )}
        <div className="flex-1 min-w-0 text-left">
          <span className="text-[9px] font-bold text-[#9a6f1a] uppercase tracking-wide">Anúncio</span>
          <p className="text-xs font-medium text-[#1E1B2E] dark:text-[#F3F1FA] truncate">{ownAd.advertiser_name}</p>
        </div>
      </button>
    )
  }

  return null
}

'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { fetchActiveCampaigns, pickCampaign, recordImpression, recordClick, shouldShowAds } from '@/lib/ads'
import type { AdCampaign } from '@/lib/ads'

async function showAdMobBanner() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob')
    await AdMob.initialize({ initializeForTesting: process.env.NODE_ENV !== 'production' })
    await AdMob.showBanner({
      adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID ?? 'ca-app-pub-3940256099942544/6300978111',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 56,
      isTesting: process.env.NODE_ENV !== 'production',
    })
  } catch { /* not on native or AdMob unavailable */ }
}

async function hideAdMobBanner() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    await AdMob.removeBanner()
  } catch { /* ignore */ }
}

export function AdBanner({ isSubscriber = false }: { isSubscriber?: boolean }) {
  const [ownAd, setOwnAd] = useState<AdCampaign | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    if (!shouldShowAds(isSubscriber)) {
      setOwnAd(null)
      hideAdMobBanner()
      return
    }

    fetchActiveCampaigns('banner').then((campaigns) => {
      const picked = pickCampaign(campaigns)
      setOwnAd(picked ?? null)

      if (picked) {
        recordImpression(picked.id)
        hideAdMobBanner() // own ad takes the slot — never show both
      } else {
        showAdMobBanner() // fallback to AdMob (native only)
      }
    })

    return () => { hideAdMobBanner() }
  }, [isSubscriber])

  if (!shouldShowAds(isSubscriber)) return null
  if (ownAd === undefined) return null // still loading

  // Own campaign takes the slot
  if (ownAd) {
    const handleClick = () => {
      recordClick(ownAd.id)
      window.open(ownAd.target_url, '_blank', 'noopener,noreferrer')
    }
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#211E2D] border-t border-[#E0A943]/30 active:scale-[0.99] transition-transform"
        style={{ minHeight: 56 }}
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

  // No own campaign. AdMob banner renders natively — nothing to show in React tree.
  if (Capacitor.isNativePlatform()) return null

  // Web browser placeholder (dev preview)
  return (
    <div
      className="w-full flex items-center justify-center border-t border-[#1E1B2E]/8 dark:border-white/8 bg-[#FAF7F1] dark:bg-[#17141F]"
      style={{ minHeight: 56 }}
    >
      <p className="text-[10px] text-[#8A8797]/50">Publicidade</p>
    </div>
  )
}

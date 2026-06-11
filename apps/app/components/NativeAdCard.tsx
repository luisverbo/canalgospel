'use client'

import { useEffect, useState } from 'react'
import { fetchActiveCampaigns, pickCampaign, recordImpression, recordClick, shouldShowAds } from '@/lib/ads'
import type { AdCampaign } from '@/lib/ads'

export function NativeAdCard({ isSubscriber = false }: { isSubscriber?: boolean }) {
  const [ad, setAd] = useState<AdCampaign | null>(null)

  useEffect(() => {
    if (!shouldShowAds(isSubscriber)) return
    fetchActiveCampaigns('feed_native')
      .then((campaigns) => {
        const picked = pickCampaign(campaigns)
        if (picked) {
          setAd(picked)
          recordImpression(picked.id).catch(() => {})
        }
      })
      .catch(() => {})
  }, [isSubscriber])

  if (!ad) return null

  const handleClick = () => {
    recordClick(ad.id).catch(() => {})
    try {
      window.open(ad.target_url, '_blank', 'noopener,noreferrer')
    } catch { /* ignore */ }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-center gap-3 bg-white dark:bg-[#211E2D] rounded-2xl p-3 border border-[#E0A943]/30 dark:border-[#E0A943]/20 active:scale-[0.98] transition-transform"
    >
      {ad.image_url ? (
        <div className="h-16 w-24 shrink-0 rounded-xl overflow-hidden">
          <img src={ad.image_url} alt={ad.advertiser_name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-16 w-24 shrink-0 rounded-xl bg-[#E0A943]/10 flex items-center justify-center text-2xl">
          📢
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[9px] font-bold text-[#9a6f1a] bg-[#E0A943]/15 px-1.5 py-0.5 rounded-full mb-1 uppercase tracking-wide">
          Anúncio
        </span>
        <p className="text-sm font-medium text-[#1E1B2E] dark:text-[#F3F1FA] line-clamp-2">{ad.advertiser_name}</p>
      </div>
    </button>
  )
}

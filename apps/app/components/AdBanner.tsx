'use client'

import { useEffect, useState } from 'react'

interface AdBannerProps {
  isSubscriber?: boolean
}

export function AdBanner({ isSubscriber = false }: AdBannerProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isSubscriber) return

    // On native Capacitor, initialize AdMob banner
    const initAdMob = async () => {
      try {
        const { AdMob, BannerAdSize, BannerAdPosition } = await import(
          '@capacitor-community/admob'
        )
        await AdMob.initialize()
        await AdMob.showBanner({
          adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID ?? 'ca-app-pub-3940256099942544/6300978111',
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 56, // above bottom nav
        })
        setLoaded(true)
      } catch {
        // Not on native platform or AdMob unavailable
      }
    }

    initAdMob()

    return () => {
      import('@capacitor-community/admob')
        .then(({ AdMob }) => AdMob.removeBanner())
        .catch(() => {})
    }
  }, [isSubscriber])

  // On web, show a placeholder
  if (isSubscriber) return null

  return (
    <div className="h-14 bg-[#1E1B2E]/5 flex items-center justify-center rounded-xl border border-dashed border-[#1E1B2E]/20">
      <span className="text-xs text-[#8A8797]">Publicidade</span>
    </div>
  )
}

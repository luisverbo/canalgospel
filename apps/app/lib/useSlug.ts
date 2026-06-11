'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/**
 * Extracts the real slug for catch-all routes in a Next.js static export
 * running inside Capacitor's WebView.
 *
 * Resolution order:
 *  1. useParams() — works when Next.js router handles the navigation client-side
 *  2. sessionStorage.__cap_nav — saved by /_fallback.html when Capacitor's
 *     errorPath kicks in (the WebView did a full load of a non-existent path,
 *     the fallback saved the original URL and redirected to the static shell)
 *  3. window.location.pathname — last resort for any other edge case
 */
export function useSlug(basePath: string): { slug: string; resolved: boolean } {
  const params = useParams()
  const [slug, setSlug] = useState('')
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const raw = params?.slug
    const fromParams = Array.isArray(raw) ? raw[0] : (raw as string | undefined)

    let value = fromParams && fromParams !== '_' ? fromParams : ''

    if (!value && typeof window !== 'undefined') {
      // Recover from Capacitor errorPath redirect
      try {
        const saved = sessionStorage.getItem('__cap_nav')
        if (saved) {
          sessionStorage.removeItem('__cap_nav')
          const parts = saved.split('/').filter(Boolean)
          const idx = parts.indexOf(basePath)
          const candidate = idx >= 0 ? parts[idx + 1] ?? '' : ''
          if (candidate && candidate !== '_') value = candidate
        }
      } catch { /* sessionStorage unavailable */ }

      // Fallback: read from the current URL path
      if (!value) {
        const parts = window.location.pathname.split('/').filter(Boolean)
        const idx = parts.indexOf(basePath)
        const candidate = idx >= 0 ? parts[idx + 1] ?? '' : ''
        if (candidate && candidate !== '_') value = candidate
      }
    }

    setSlug(value ? decodeURIComponent(value) : '')
    setResolved(true)
  }, [params, basePath])

  return { slug, resolved }
}

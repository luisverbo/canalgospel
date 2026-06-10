'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/**
 * Extrai o slug real da URL em rotas catch-all servidas pelo shell estático.
 * Com `output: 'export'` + rewrites, a página é pré-renderizada como `/_/`,
 * então useParams() pode hidratar com '_' em vez do slug da URL — por isso
 * window.location.pathname é a fonte de verdade.
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
      const parts = window.location.pathname.split('/').filter(Boolean)
      const idx = parts.indexOf(basePath)
      const candidate = idx >= 0 ? parts[idx + 1] ?? '' : ''
      if (candidate && candidate !== '_') value = candidate
    }

    setSlug(value ? decodeURIComponent(value) : '')
    setResolved(true)
  }, [params, basePath])

  return { slug, resolved }
}

import { StudyPageClient } from './StudyPageClient'

// generateStaticParams must be in a server component (cannot be in 'use client')
// Returns [] — no files pre-generated; Next.js client router handles slugs at runtime
// Gera um shell estático mínimo; slugs reais são resolvidos client-side pelo router
export function generateStaticParams() {
  return [{ slug: ['_'] }]
}

export default function StudyPage() {
  return <StudyPageClient />
}

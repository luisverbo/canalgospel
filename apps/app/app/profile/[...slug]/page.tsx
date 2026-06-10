import { PreacherProfileClient } from './PreacherProfileClient'

// Gera um shell estático mínimo; slugs reais são resolvidos client-side pelo router
export function generateStaticParams() {
  return [{ slug: ['_'] }]
}

export default function PreacherProfilePage() {
  return <PreacherProfileClient />
}

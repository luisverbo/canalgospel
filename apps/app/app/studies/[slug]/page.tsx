import { createClient } from '@canal-gospel/supabase'
import { Badge } from '@canal-gospel/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudyReader } from './StudyReader'

export default async function StudyPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()

  const { data: study } = await supabase
    .from('studies')
    .select('*, preachers(name, slug, photo_url, church, city), categories(name, slug)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!study) notFound()

  const preacher = study.preachers as {
    name: string
    slug: string
    photo_url: string | null
    church: string | null
    city: string | null
  } | null

  const category = study.categories as { name: string; slug: string } | null

  return (
    <StudyReader study={study} preacher={preacher} category={category} />
  )
}

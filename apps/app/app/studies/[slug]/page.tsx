import { createClient } from '@canal-gospel/supabase'
import { notFound } from 'next/navigation'
import { StudyReader } from './StudyReader'

interface Study {
  id: string
  title: string
  slug: string
  body: string | null
  youtube_url: string | null
  read_time_min: number | null
  published_at: string | null
  preachers: { display_name: string; slug: string; photo_url: string | null; church: string | null; city: string | null } | null
  categories: { name: string; slug: string } | null
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createClient()

  const { data } = await supabase
    .from('studies')
    .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url, church, city), categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  const study = data as Study | null
  if (!study) notFound()

  return <StudyReader study={study} preacher={study.preachers} category={study.categories} />
}

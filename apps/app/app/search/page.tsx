import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import { SearchForm } from './SearchForm'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const query = params.q?.trim() ?? ''

  let studies: StudyCardType[] | null = null
  if (query.length > 1) {
    const { data } = await supabase
      .from('studies')
      .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(30)
    studies = data as StudyCardType[] | null
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Buscar</h1>
      <SearchForm initialQuery={query} />

      {query && studies !== null && (
        <p className="text-sm text-[#8A8797]">
          {studies.length} resultado{studies.length !== 1 ? 's' : ''} para &quot;{query}&quot;
        </p>
      )}

      <div className="flex flex-col gap-3">
        {studies?.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            preacher={study.preachers}
            category={study.categories}
          />
        ))}
      </div>

      {query && studies?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#8A8797]">Nenhum estudo encontrado para &quot;{query}&quot;.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-[#8A8797]">Busque por título, tema ou versículo.</p>
        </div>
      )}
    </div>
  )
}

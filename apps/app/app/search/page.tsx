import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import { SearchForm } from './SearchForm'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const query = searchParams.q?.trim() ?? ''

  let studies = null
  if (query.length > 1) {
    const { data } = await supabase
      .from('studies')
      .select('*, preachers(name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%,body.ilike.%${query}%`)
      .order('view_count', { ascending: false })
      .limit(30)
    studies = data
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Buscar</h1>

      <SearchForm initialQuery={query} />

      {query && studies !== null && (
        <p className="text-sm text-[#8A8797]">
          {studies.length} resultado{studies.length !== 1 ? 's' : ''} para "{query}"
        </p>
      )}

      <div className="flex flex-col gap-3">
        {studies?.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            preacher={(study.preachers as { name: string; slug: string; photo_url: string | null }) ?? null}
            category={(study.categories as { name: string; slug: string }) ?? null}
          />
        ))}
      </div>

      {query && studies?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#8A8797]">Nenhum estudo encontrado para "{query}".</p>
          <p className="text-sm text-[#8A8797] mt-1">Tente outro título, tema ou versículo.</p>
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

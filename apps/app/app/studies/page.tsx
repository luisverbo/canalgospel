import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType } from '@/lib/types'
import Link from 'next/link'

interface Category { id: string; name: string; slug: string; kind: string; sort_order: number }

export default async function StudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()

  const [categoriesResult, studiesResult] = await Promise.all([
    supabase.from('categories').select('id, name, slug, kind, sort_order').order('sort_order'),
    supabase
      .from('studies')
      .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50),
  ])

  const categories = categoriesResult.data as Category[] | null
  const studies = studiesResult.data as StudyCardType[] | null

  const filtered = params.category
    ? studies?.filter((s) => s.categories?.slug === params.category)
    : studies

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Estudos Bíblicos</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link href="/studies">
          <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !params.category ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 text-[#2E2860]'
          }`}>
            Todos
          </span>
        </Link>
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/studies?category=${cat.slug}`}>
            <span className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              params.category === cat.slug ? 'bg-[#2E2860] text-white' : 'bg-[#2E2860]/10 text-[#2E2860]'
            }`}>
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered?.length === 0 && (
          <p className="text-center text-[#8A8797] py-12">Nenhum estudo encontrado.</p>
        )}
        {filtered?.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            preacher={study.preachers}
            category={study.categories}
          />
        ))}
      </div>
    </div>
  )
}

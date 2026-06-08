import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import { Badge } from '@canal-gospel/ui'
import Link from 'next/link'

export default async function StudiesPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = createClient()

  const [{ data: categories }, { data: studies }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('studies')
      .select('*, preachers(name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50),
  ])

  const filtered = searchParams.category
    ? studies?.filter(
        (s) =>
          (s.categories as { slug: string } | null)?.slug === searchParams.category
      )
    : studies

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Estudos Bíblicos</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link href="/studies">
          <span
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !searchParams.category
                ? 'bg-[#2E2860] text-white'
                : 'bg-[#2E2860]/10 text-[#2E2860]'
            }`}
          >
            Todos
          </span>
        </Link>
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/studies?category=${cat.slug}`}>
            <span
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchParams.category === cat.slug
                  ? 'bg-[#2E2860] text-white'
                  : 'bg-[#2E2860]/10 text-[#2E2860]'
              }`}
            >
              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
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
            preacher={(study.preachers as { name: string; slug: string; photo_url: string | null }) ?? null}
            category={(study.categories as { name: string; slug: string }) ?? null}
          />
        ))}
      </div>
    </div>
  )
}

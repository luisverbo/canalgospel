import { createClient } from '@canal-gospel/supabase'
import { DevotionalCard } from '@/components/DevotionalCard'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType, Devotional } from '@/lib/types'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  const [devotionalResult, studiesResult] = await Promise.all([
    supabase
      .from('daily_devotionals')
      .select('id, date, verse_ref, verse_text, reflection')
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('studies')
      .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10),
  ])

  const devotional = devotionalResult.data as Devotional | null
  const studies = studiesResult.data as StudyCardType[] | null

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8A8797]">Bem-vindo</p>
          <h1 className="text-2xl font-bold text-[#2E2860]">Canal Gospel</h1>
        </div>
        <Link href="/settings">
          <div className="h-10 w-10 rounded-full bg-[#2E2860]/10 flex items-center justify-center">
            <span className="text-[#2E2860] text-lg">⚙</span>
          </div>
        </Link>
      </header>

      {devotional && <DevotionalCard devotional={devotional} />}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1E1B2E]">Estudos Recentes</h2>
          <Link href="/studies" className="text-sm font-medium text-[#2E2860]">
            Ver todos
          </Link>
        </div>
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
      </section>
    </div>
  )
}

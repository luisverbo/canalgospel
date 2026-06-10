'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { DevotionalCard } from '@/components/DevotionalCard'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType, Devotional } from '@/lib/types'
import Link from 'next/link'
import { Settings, WandSparkles, ChevronRight } from 'lucide-react'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
}

export default function HomePage() {
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      supabase
        .from('daily_devotionals')
        .select('id, date, verse_ref, verse_text, reflection')
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('studies')
        .select('id, title, slug, body, youtube_url, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10),
    ]).then(([devotionalResult, studiesResult]) => {
      setDevotional(devotionalResult.data as Devotional | null)
      setStudies((studiesResult.data as StudyCardType[] | null) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8A8797]">{greeting()}</p>
          <h1 className="text-2xl font-medium text-[#2E2860] dark:text-[#F3F1FA]">Canal Gospel</h1>
        </div>
        <Link href="/settings">
          <div className="h-10 w-10 rounded-full bg-[#2E2860]/10 dark:bg-white/10 flex items-center justify-center">
            <Settings size={18} strokeWidth={1.5} className="text-[#2E2860] dark:text-[#D8D5E4]" />
          </div>
        </Link>
      </header>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-40 rounded-[20px] bg-[#2E2860]/10 animate-pulse" />
          <div className="h-24 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />
          <div className="h-24 rounded-2xl bg-white/60 dark:bg-white/5 animate-pulse" />
        </div>
      ) : (
        <>
          {devotional && <DevotionalCard devotional={devotional} />}

          {/* Card IA — Plano Pregador */}
          <div className="flex items-center gap-4 bg-[#1E1B2E] dark:bg-[#2E2860]/40 rounded-2xl p-4">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-[#E0A943] flex items-center justify-center">
              <WandSparkles size={20} strokeWidth={1.8} className="text-[#1E1B2E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">Monte seu sermão com IA</p>
              <p className="text-[#A9A4C4] text-xs mt-0.5">Plano Pregador · sem anúncios</p>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="shrink-0 text-[#E0A943]" />
          </div>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#1E1B2E] dark:text-[#F3F1FA]">Estudos Recentes</h2>
              <Link href="/studies" className="text-sm font-semibold text-[#E0A943]">Ver todos</Link>
            </div>
            <div className="flex flex-col gap-3">
              {studies.map((study) => (
                <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
              ))}
              {studies.length === 0 && (
                <p className="text-center text-[#8A8797] py-8">Nenhum estudo publicado ainda.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

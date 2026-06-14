'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import { DevotionalCard } from '@/components/DevotionalCard'
import { StudyCard } from '@/components/StudyCard'
import type { StudyCard as StudyCardType, Devotional } from '@/lib/types'
import Link from 'next/link'
import { Settings, WandSparkles, ChevronRight, Star } from 'lucide-react'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
}

export default function HomePage() {
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [featured, setFeatured] = useState<StudyCardType[]>([])
  const [system, setSystem] = useState<StudyCardType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const nowIso = new Date().toISOString()
    const studyCols = 'id, title, slug, body, youtube_url, audio_url, cover_url, content_type, read_time_min, published_at, preachers(display_name, slug, photo_url), categories(name, slug)'

    Promise.all([
      supabase
        .from('daily_devotionals')
        .select('id, date, verse_ref, verse_text, reflection')
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Destaques ativos (sistema + parceiro com is_featured)
      supabase
        .from('studies')
        .select(studyCols)
        .eq('status', 'published')
        .eq('is_featured', true)
        .or(`featured_until.is.null,featured_until.gt.${nowIso}`)
        .order('published_at', { ascending: false })
        .limit(10),
      // Conteúdo do sistema não destacado (preacher_id IS NULL)
      supabase
        .from('studies')
        .select(studyCols)
        .eq('status', 'published')
        .eq('is_featured', false)
        .is('preacher_id', null)
        .order('published_at', { ascending: false })
        .limit(20),
    ]).then(([devotionalResult, featuredResult, systemResult]) => {
      setDevotional(devotionalResult.data as Devotional | null)
      setFeatured((featuredResult.data as StudyCardType[] | null) ?? [])
      setSystem((systemResult.data as StudyCardType[] | null) ?? [])
      setLoading(false)
    })
  }, [])

  const allHome = [...featured, ...system]

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
          <Link href="/sermon-assistant">
            <div className="flex items-center gap-4 bg-[#1E1B2E] dark:bg-[#2E2860]/40 rounded-2xl p-4 active:scale-[0.98] transition-transform">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-[#E0A943] flex items-center justify-center">
                <WandSparkles size={20} strokeWidth={1.8} className="text-[#1E1B2E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">Monte seu sermão com IA</p>
                <p className="text-[#A9A4C4] text-xs mt-0.5">Plano Pregador · sem anúncios</p>
              </div>
              <ChevronRight size={20} strokeWidth={2} className="shrink-0 text-[#E0A943]" />
            </div>
          </Link>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={18} strokeWidth={2} className="text-[#E0A943] fill-[#E0A943]" />
                <h2 className="text-lg font-bold text-[#1E1B2E] dark:text-[#F3F1FA]">Em destaque</h2>
              </div>
              <Link href="/studies" className="text-sm font-semibold text-[#E0A943]">Ver todos</Link>
            </div>
            {allHome.length > 0 ? (
              <div className="flex flex-col gap-3">
                {allHome.map((study) => (
                  <StudyCard key={study.id} study={study} preacher={study.preachers} category={study.categories} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-3xl mb-2">✨</p>
                <p className="text-sm text-[#8A8797]">Nenhum conteúdo publicado ainda.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

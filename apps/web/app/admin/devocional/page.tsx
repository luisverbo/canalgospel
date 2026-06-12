import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DevotionalForm } from './DevotionalForm'
import { DevotionalList } from './DevotionalList'

export default async function DevocionalPage() {
  const supabase = await createServerSupabaseClient()

  const { data: devotionals } = await supabase
    .from('daily_devotionals')
    .select('id, date, verse_ref, verse_text, reflection, youtube_url')
    .order('date', { ascending: false })
    .limit(30)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Devocionais Diários</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Novo Devocional</h2>
          <DevotionalForm />
        </div>

        <div>
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Devocionais</h2>
          <DevotionalList devotionals={devotionals ?? []} />
        </div>
      </div>
    </div>
  )
}

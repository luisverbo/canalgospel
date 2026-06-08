import { createServerSupabaseClient } from '@/lib/supabase/server'
import { YouTubeImportForm } from './YouTubeImportForm'

export default async function YouTubeImportPage() {
  const supabase = await createServerSupabaseClient()

  const [{ data: preachers }, { data: categories }] = await Promise.all([
    supabase.from('preachers').select('id, display_name').eq('status', 'active').order('display_name'),
    supabase.from('categories').select('id, name, slug').order('name'),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2860]">Importar Canal do YouTube</h1>
        <p className="text-[#8A8797] text-sm mt-1">
          Cole o canal de um pregador — a IA categoriza os vídeos automaticamente. Você aprova tudo antes de ir para o app.
        </p>
      </div>

      <YouTubeImportForm preachers={preachers ?? []} categories={categories ?? []} />
    </div>
  )
}

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { YouTubeImportForm } from './YouTubeImportForm'

export default async function YouTubeImportPage() {
  const supabase = await createServerSupabaseClient()

  const { data: preachers } = await supabase
    .from('preachers')
    .select('id, display_name')
    .eq('status', 'active')
    .order('display_name')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2860]">Importar do YouTube</h1>
        <p className="text-sm text-[#8A8797] mt-1">
          Importe vídeos de um canal do YouTube como estudos com status &quot;pendente&quot; para revisão.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 max-w-xl">
        <strong>Requisitos:</strong> Configure{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">YOUTUBE_API_KEY</code> e{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code>{' '}
        nas variáveis de ambiente da Vercel para usar a categorização automática.
      </div>

      <YouTubeImportForm preachers={preachers ?? []} />
    </div>
  )
}

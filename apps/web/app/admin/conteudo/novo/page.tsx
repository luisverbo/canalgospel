import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NewStudyForm } from './NewStudyForm'

export default async function NovoConteudoPage() {
  const supabase = await createAdminSupabaseClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, kind')
    .order('name')

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2E2860]">Novo Conteúdo</h1>
        <p className="text-[#8A8797] mt-1">Adicione um estudo de texto ou vídeo do YouTube</p>
      </div>
      <NewStudyForm categories={categories ?? []} />
    </div>
  )
}

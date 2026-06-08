import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CategoryForm } from './CategoryForm'
import { CategoryList } from './CategoryList'

export default async function CategoriasPage() {
  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, kind, sort_order')
    .order('sort_order')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-[#2E2860]">Categorias e Ocasiões</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-[#1E1B2E] mb-4">Nova Categoria</h2>
          <CategoryForm />
        </div>

        <div>
          <CategoryList initialCategories={categories ?? []} />
        </div>
      </div>
    </div>
  )
}

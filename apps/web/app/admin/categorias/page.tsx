import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { CategoryForm } from './CategoryForm'

const kindLabel: Record<string, string> = {
  tema: 'Tema',
  livro: 'Livro',
  ocasiao: 'Ocasião',
}

const kindVariant: Record<string, string> = {
  tema: 'indigo',
  livro: 'neutral',
  ocasiao: 'gold',
}

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
          <h2 className="font-semibold text-[#1E1B2E] mb-4">
            Categorias ({categories?.length ?? 0})
          </h2>
          <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
            {categories?.map((cat) => (
              <div key={cat.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-[#1E1B2E]">{cat.name}</p>
                  <p className="text-xs text-[#8A8797]">/{cat.slug}</p>
                </div>
                <Badge variant={(kindVariant[cat.kind] ?? 'neutral') as Parameters<typeof Badge>[0]['variant']}>
                  {kindLabel[cat.kind] ?? cat.kind}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

export async function createCategory(data: {
  name: string
  slug: string
  kind: string
  sort_order: number
}) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('categories').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function updateCategory(id: string, data: {
  name: string
  slug: string
  kind: string
}) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('categories').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdminClient()
  await supabase.from('studies').update({ category_id: null }).eq('category_id', id)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function reorderCategories(ids: string[]) {
  const supabase = await requireAdminClient()
  await Promise.all(
    ids.map((id, index) =>
      supabase.from('categories').update({ sort_order: index }).eq('id', id)
    )
  )
  revalidatePath('/admin/categorias')
}

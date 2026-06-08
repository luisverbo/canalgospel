'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(data: {
  name: string
  slug: string
  kind: string
  sort_order: number
}) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from('categories').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categorias')
}

export async function reorderCategories(ids: string[]) {
  const supabase = await createAdminSupabaseClient()
  await Promise.all(
    ids.map((id, index) =>
      supabase.from('categories').update({ sort_order: index }).eq('id', id)
    )
  )
  revalidatePath('/admin/categorias')
}

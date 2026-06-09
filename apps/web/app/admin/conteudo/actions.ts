'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveStudy(studyId: string) {
  const supabase = await createAdminSupabaseClient()
  await supabase
    .from('studies')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function rejectStudy(studyId: string) {
  const supabase = await createAdminSupabaseClient()
  await supabase.from('studies').update({ status: 'draft' }).eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function setCategoryAction(studyId: string, categoryId: string) {
  const supabase = await createAdminSupabaseClient()
  await supabase.from('studies').update({ category_id: categoryId }).eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

export async function approveStudy(studyId: string) {
  const supabase = await requireAdminClient()
  await supabase
    .from('studies')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function rejectStudy(studyId: string) {
  const supabase = await requireAdminClient()
  await supabase.from('studies').update({ status: 'rejected' }).eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function unpublishStudy(studyId: string) {
  const supabase = await requireAdminClient()
  await supabase
    .from('studies')
    .update({ status: 'draft', published_at: null })
    .eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function setCategoryAction(studyId: string, categoryId: string) {
  const supabase = await requireAdminClient()
  await supabase.from('studies').update({ category_id: categoryId }).eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

/**
 * Destaque na Home (monetização) — controlado SOMENTE pelo admin.
 * featuredUntil opcional (ISO date); null = destaque sem expiração.
 */
export async function setFeatured(studyId: string, featuredUntil: string | null) {
  const supabase = await requireAdminClient()
  await supabase
    .from('studies')
    .update({ is_featured: true, featured_until: featuredUntil })
    .eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

export async function unsetFeatured(studyId: string) {
  const supabase = await requireAdminClient()
  await supabase
    .from('studies')
    .update({ is_featured: false, featured_until: null })
    .eq('id', studyId)
  revalidatePath('/admin/conteudo')
}

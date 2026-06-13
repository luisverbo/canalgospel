'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

const STORAGE_BUCKET = 'content'

/** Extracts the storage path from a Supabase public URL, or null if it's external. */
function storagePathFromUrl(url: string | null | undefined, supabaseUrl: string): string | null {
  if (!url) return null
  try {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch { return null }
}

export async function deleteStudy(studyId: string) {
  const supabase = await requireAdminClient()

  // Fetch cover_url before deleting
  const { data: study } = await supabase
    .from('studies')
    .select('cover_url')
    .eq('id', studyId)
    .single()

  // Remove storage file if it lives in our bucket
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const storagePath = storagePathFromUrl(study?.cover_url, supabaseUrl)
  if (storagePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
  }

  const { error } = await supabase.from('studies').delete().eq('id', studyId)
  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  return {}
}

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

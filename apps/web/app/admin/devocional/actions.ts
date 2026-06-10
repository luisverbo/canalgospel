'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

export async function createDevotional(formData: FormData) {
  const supabase = await requireAdminClient()

  const date = (formData.get('date') as string)?.trim()
  const verseRef = (formData.get('verse_ref') as string)?.trim()
  const verseText = (formData.get('verse_text') as string)?.trim()
  const reflection = (formData.get('reflection') as string)?.trim()
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()

  if (!date || !verseRef || !verseText) {
    return { error: 'Data, referência e texto do versículo são obrigatórios' }
  }

  const payload: Record<string, string | null> = {
    date,
    verse_ref: verseRef,
    verse_text: verseText,
    reflection: reflection || null,
    youtube_url: youtubeUrl || null,
  }

  // Se já existe um devocional para a data, atualiza; senão, insere.
  const { data: existing } = await supabase
    .from('daily_devotionals')
    .select('id')
    .eq('date', date)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from('daily_devotionals').update(payload).eq('id', existing.id)
    : await supabase.from('daily_devotionals').insert(payload)

  if (error) return { error: error.message }

  revalidatePath('/admin/devocional')
  return { success: true }
}

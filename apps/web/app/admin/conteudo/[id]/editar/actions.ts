'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateStudy(studyId: string, formData: FormData) {
  const supabase = await createAdminSupabaseClient()

  const title = (formData.get('title') as string)?.trim()
  const body = (formData.get('body') as string) ?? ''
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()
  const categoryId = formData.get('category_id') as string

  if (!title) return { error: 'Título é obrigatório' }

  const { error } = await supabase
    .from('studies')
    .update({
      title,
      body: body.trim() || ' ',
      youtube_url: youtubeUrl || null,
      category_id: categoryId || null,
    })
    .eq('id', studyId)

  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  redirect('/admin/conteudo')
}

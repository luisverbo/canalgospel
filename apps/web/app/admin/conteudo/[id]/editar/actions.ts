'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function htmlIsEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
}

export async function updateStudy(studyId: string, formData: FormData) {
  const supabase = await requireAdminClient()

  const title = (formData.get('title') as string)?.trim()
  const body = (formData.get('body') as string) ?? ''
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()
  const categoryId = formData.get('category_id') as string

  if (!title) return { error: 'Título é obrigatório' }

  const coverUrl = (formData.get('cover_url') as string | null)?.trim() || null

  const { error } = await supabase
    .from('studies')
    .update({
      title,
      body: htmlIsEmpty(body) ? ' ' : body.trim(),
      youtube_url: youtubeUrl || null,
      category_id: categoryId || null,
      cover_url: coverUrl,
    })
    .eq('id', studyId)

  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  redirect('/admin/conteudo')
}

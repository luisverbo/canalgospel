'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function htmlIsEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
}

export async function updateStudy(studyId: string, formData: FormData) {
  const supabase = await requireAdminClient()

  const contentType = formData.get('content_type') as string
  const title = (formData.get('title') as string)?.trim()
  const body = (formData.get('body') as string) ?? ''
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const coverUrl = (formData.get('cover_url') as string | null)?.trim() || null
  const audioUrl = (formData.get('audio_url') as string | null)?.trim() || null

  if (!title) return { error: 'Título é obrigatório' }
  if (contentType === 'video' && !youtubeUrl) return { error: 'URL do YouTube é obrigatória para vídeos' }
  if (contentType === 'text' && htmlIsEmpty(body)) return { error: 'Conteúdo é obrigatório para estudos de texto' }
  if (contentType === 'audio' && !audioUrl) return { error: 'Arquivo de áudio é obrigatório' }

  const { error } = await supabase
    .from('studies')
    .update({
      content_type: contentType,
      title,
      body: contentType === 'audio' ? ' ' : (htmlIsEmpty(body) ? ' ' : body.trim()),
      youtube_url: contentType === 'video' ? youtubeUrl || null : null,
      category_id: categoryId || null,
      cover_url: contentType === 'video' ? null : coverUrl,
      audio_url: audioUrl,
    })
    .eq('id', studyId)

  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  redirect('/admin/conteudo')
}

'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function htmlIsEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function createStudy(formData: FormData) {
  const supabase = await requireAdminClient()

  const contentType = formData.get('content_type') as string
  const title = formData.get('title') as string
  const categoryId = formData.get('category_id') as string
  const youtubeUrl = formData.get('youtube_url') as string
  const body = (formData.get('body') as string) ?? ''
  const submitAction = formData.get('submit_action') as string
  const coverUrl = (formData.get('cover_url') as string | null)?.trim() || null
  const audioUrl = (formData.get('audio_url') as string | null)?.trim() || null

  if (!title?.trim()) return { error: 'Título é obrigatório' }
  if (contentType === 'video' && !youtubeUrl?.trim()) return { error: 'URL do YouTube é obrigatória para vídeos' }
  if (contentType === 'text' && htmlIsEmpty(body)) return { error: 'Conteúdo é obrigatório para estudos de texto' }
  if (contentType === 'audio' && !audioUrl) return { error: 'Arquivo de áudio é obrigatório' }

  const status = submitAction === 'publish' ? 'pending' : 'draft'
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`

  const { error } = await supabase.from('studies').insert({
    title: title.trim(),
    slug,
    content_type: contentType,
    youtube_url: contentType === 'video' ? youtubeUrl?.trim() || null : null,
    body: contentType === 'audio' ? ' ' : (htmlIsEmpty(body) ? ' ' : body.trim()),
    category_id: categoryId || null,
    cover_url: contentType === 'video' ? null : coverUrl,
    audio_url: audioUrl,
    status,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  redirect('/admin/conteudo')
}

'use server'

import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  const supabase = await createAdminSupabaseClient()

  const contentType = formData.get('content_type') as string
  const title = formData.get('title') as string
  const categoryId = formData.get('category_id') as string
  const youtubeUrl = formData.get('youtube_url') as string
  const body = formData.get('body') as string
  const submitAction = formData.get('submit_action') as string

  if (!title?.trim()) return { error: 'Título é obrigatório' }
  if (contentType === 'video' && !youtubeUrl?.trim()) return { error: 'URL do YouTube é obrigatória para vídeos' }
  if (contentType === 'text' && !body?.trim()) return { error: 'Conteúdo é obrigatório para estudos de texto' }

  const status = submitAction === 'publish' ? 'pending_review' : 'draft'
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`

  const { error } = await supabase.from('studies').insert({
    title: title.trim(),
    slug,
    content_type: contentType,
    youtube_url: contentType === 'video' ? youtubeUrl.trim() : null,
    body: body?.trim() || ' ',
    category_id: categoryId || null,
    status,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/conteudo')
  redirect('/admin/conteudo')
}

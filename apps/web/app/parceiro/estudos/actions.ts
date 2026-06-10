'use server'

import { requirePartner } from '@/lib/supabase/partner-guard'
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

export async function createPartnerStudy(formData: FormData) {
  const { supabase, preacher } = await requirePartner()

  const contentType = (formData.get('content_type') as string) ?? 'text'
  const title = (formData.get('title') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()
  const body = (formData.get('body') as string) ?? ''
  const coverUrl = (formData.get('cover_url') as string | null)?.trim() || null
  const submitAction = formData.get('submit_action') as string

  if (!title) return { error: 'Título é obrigatório' }
  if (contentType === 'video' && !youtubeUrl) return { error: 'URL do YouTube é obrigatória para vídeos' }
  if (contentType === 'text' && htmlIsEmpty(body)) return { error: 'Conteúdo é obrigatório para estudos de texto' }

  // Decisão de publicação feita no servidor
  let status: 'draft' | 'pending' | 'published' = 'draft'
  let publishedAt: string | null = null
  if (submitAction === 'publish') {
    if (preacher.auto_publish && preacher.status === 'active') {
      status = 'published'
      publishedAt = new Date().toISOString()
    } else {
      status = 'pending'
    }
  }

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`

  const { error } = await supabase.from('studies').insert({
    preacher_id: preacher.id,
    category_id: categoryId || null,
    title,
    slug,
    content_type: contentType,
    youtube_url: contentType === 'video' ? youtubeUrl : null,
    body: htmlIsEmpty(body) ? ' ' : body.trim(),
    cover_url: contentType === 'text' ? coverUrl : null,
    status,
    published_at: publishedAt,
  })

  if (error) return { error: error.message }

  revalidatePath('/parceiro/estudos')
  redirect('/parceiro/estudos')
}

export async function updatePartnerStudy(studyId: string, formData: FormData) {
  const { supabase, preacher } = await requirePartner()

  // Ownership: só pode editar o próprio estudo
  const { data: existing } = await supabase
    .from('studies')
    .select('id, preacher_id, status')
    .eq('id', studyId)
    .single()

  if (!existing || existing.preacher_id !== preacher.id) {
    return { error: 'Estudo não encontrado ou sem permissão' }
  }

  const contentType = (formData.get('content_type') as string) ?? 'text'
  const title = (formData.get('title') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const youtubeUrl = (formData.get('youtube_url') as string)?.trim()
  const body = (formData.get('body') as string) ?? ''
  const coverUrl = (formData.get('cover_url') as string | null)?.trim() || null
  const submitAction = formData.get('submit_action') as string

  if (!title) return { error: 'Título é obrigatório' }

  // Status: parceiro pode manter rascunho ou (re)enviar.
  // Se reenviar: confiável → published; senão → pending.
  let status = existing.status as 'draft' | 'pending' | 'published' | 'rejected'
  let publishedAt: string | null | undefined = undefined
  if (submitAction === 'publish') {
    if (preacher.auto_publish && preacher.status === 'active') {
      status = 'published'
      publishedAt = new Date().toISOString()
    } else {
      status = 'pending'
    }
  } else if (submitAction === 'draft') {
    status = 'draft'
  }

  const update: Record<string, unknown> = {
    title,
    category_id: categoryId || null,
    content_type: contentType,
    youtube_url: contentType === 'video' ? youtubeUrl || null : null,
    body: htmlIsEmpty(body) ? ' ' : body.trim(),
    cover_url: contentType === 'text' ? coverUrl : null,
    status,
  }
  if (publishedAt !== undefined) update.published_at = publishedAt

  const { error } = await supabase.from('studies').update(update).eq('id', studyId)
  if (error) return { error: error.message }

  revalidatePath('/parceiro/estudos')
  redirect('/parceiro/estudos')
}

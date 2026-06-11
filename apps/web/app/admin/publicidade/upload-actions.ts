'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'

const BUCKET = 'content'

export async function uploadAdImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await requireAdminClient()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Nenhum arquivo enviado' }
  if (!file.type.startsWith('image/')) return { error: 'O arquivo precisa ser uma imagem' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Imagem muito grande (máx. 5MB)' }

  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const path = `ads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(arrayBuffer), { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}

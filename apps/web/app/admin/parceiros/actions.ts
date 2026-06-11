'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function randomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdminClient>>,
  base: string,
): Promise<string> {
  const root = slugify(base) || 'pregador'
  let slug = root
  let n = 1
  // tenta até achar um slug livre
  for (;;) {
    const { data } = await supabase.from('preachers').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
    n += 1
    slug = `${root}-${n}`
  }
}

export interface CreatePartnerResult {
  error?: string
  credentials?: { email: string; password: string }
}

export async function createPartner(formData: FormData): Promise<CreatePartnerResult> {
  const supabase = await requireAdminClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const church = (formData.get('church') as string)?.trim() || null
  const city = (formData.get('city') as string)?.trim() || null
  const bio = (formData.get('bio') as string)?.trim() || null
  const whatsapp = (formData.get('whatsapp') as string)?.trim() || null
  const instagram = (formData.get('instagram') as string)?.trim().replace(/^@/, '') || null
  const pixKey = (formData.get('pix_key') as string)?.trim() || null
  const photoUrl = (formData.get('photo_url') as string)?.trim() || null
  const autoPublish = formData.get('auto_publish') === 'on' || formData.get('auto_publish') === 'true'

  if (!displayName) return { error: 'Nome é obrigatório' }
  if (!email) return { error: 'E-mail é obrigatório' }

  const password = randomPassword()

  // 1) cria usuário no Auth (service role)
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  })
  if (authError || !created?.user) {
    return { error: `Falha ao criar usuário: ${authError?.message ?? 'desconhecido'}` }
  }

  const userId = created.user.id

  // 2) cria/atualiza profile com role 'partner'
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: displayName, role: 'partner' })
  if (profileError) {
    // rollback do auth para não deixar usuário órfão
    await supabase.auth.admin.deleteUser(userId)
    return { error: `Falha ao criar perfil: ${profileError.message}` }
  }

  // 3) cria preacher vinculado (id = userId), status active
  const slug = await uniqueSlug(supabase, displayName)
  const { error: preacherError } = await supabase.from('preachers').insert({
    id: userId,
    slug,
    display_name: displayName,
    bio,
    church,
    city,
    photo_url: photoUrl,
    instagram,
    whatsapp,
    pix_key: pixKey,
    status: 'active',
    auto_publish: autoPublish,
  })
  if (preacherError) {
    await supabase.auth.admin.deleteUser(userId)
    return { error: `Falha ao criar pregador: ${preacherError.message}` }
  }

  revalidatePath('/admin/parceiros')
  return { credentials: { email, password } }
}

export async function updatePartner(preacherId: string, formData: FormData) {
  const supabase = await requireAdminClient()

  const displayName = (formData.get('display_name') as string)?.trim()
  if (!displayName) return { error: 'Nome é obrigatório' }

  const { error } = await supabase
    .from('preachers')
    .update({
      display_name: displayName,
      church: (formData.get('church') as string)?.trim() || null,
      city: (formData.get('city') as string)?.trim() || null,
      bio: (formData.get('bio') as string)?.trim() || null,
      whatsapp: (formData.get('whatsapp') as string)?.trim() || null,
      instagram: (formData.get('instagram') as string)?.trim().replace(/^@/, '') || null,
      pix_key: (formData.get('pix_key') as string)?.trim() || null,
      photo_url: (formData.get('photo_url') as string)?.trim() || null,
    })
    .eq('id', preacherId)

  if (error) return { error: error.message }
  revalidatePath('/admin/parceiros')
  return {}
}

export async function setPartnerStatus(preacherId: string, status: 'active' | 'disabled') {
  const supabase = await requireAdminClient()
  await supabase.from('preachers').update({ status }).eq('id', preacherId)
  revalidatePath('/admin/parceiros')
}

export async function setPartnerAutoPublish(preacherId: string, autoPublish: boolean) {
  const supabase = await requireAdminClient()
  await supabase.from('preachers').update({ auto_publish: autoPublish }).eq('id', preacherId)
  revalidatePath('/admin/parceiros')
}

export async function deletePartner(preacherId: string): Promise<{ error?: string }> {
  const supabase = await requireAdminClient()

  // 1) Disassociate studies (preserve content, remove FK)
  await supabase.from('studies').update({ preacher_id: null }).eq('preacher_id', preacherId)

  // 2) Delete preacher profile
  await supabase.from('preachers').delete().eq('id', preacherId)

  // 3) Delete app profile
  await supabase.from('profiles').delete().eq('id', preacherId)

  // 4) Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(preacherId)
  if (error) return { error: error.message }

  revalidatePath('/admin/parceiros')
  return {}
}

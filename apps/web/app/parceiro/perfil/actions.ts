'use server'

import { requirePartner } from '@/lib/supabase/partner-guard'
import { revalidatePath } from 'next/cache'

export async function updateMyProfile(formData: FormData) {
  const { supabase, preacher } = await requirePartner()

  const displayName = (formData.get('display_name') as string)?.trim()
  if (!displayName) return { error: 'Nome é obrigatório' }

  const { error } = await supabase
    .from('preachers')
    .update({
      display_name: displayName,
      bio: (formData.get('bio') as string)?.trim() || null,
      church: (formData.get('church') as string)?.trim() || null,
      city: (formData.get('city') as string)?.trim() || null,
      instagram: (formData.get('instagram') as string)?.trim().replace(/^@/, '') || null,
      whatsapp: (formData.get('whatsapp') as string)?.trim() || null,
      pix_key: (formData.get('pix_key') as string)?.trim() || null,
      photo_url: (formData.get('photo_url') as string)?.trim() || null,
    })
    // só o próprio registro (id = preacher.id, validado pelo guard)
    .eq('id', preacher.id)

  if (error) return { error: error.message }
  revalidatePath('/parceiro/perfil')
  return {}
}

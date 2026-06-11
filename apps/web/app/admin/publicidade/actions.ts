'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData: FormData) {
  const supabase = await requireAdminClient()

  const advertiser_name = (formData.get('advertiser_name') as string)?.trim()
  const target_url = (formData.get('target_url') as string)?.trim()
  const slot = formData.get('slot') as string
  const image_url = (formData.get('image_url') as string)?.trim() || null
  const starts_at = (formData.get('starts_at') as string) || null
  const ends_at = (formData.get('ends_at') as string) || null
  const weight = formData.get('weight') ? Number(formData.get('weight')) : 1

  if (!advertiser_name) return { error: 'Anunciante é obrigatório' }
  if (!target_url) return { error: 'URL de destino é obrigatória' }
  if (!slot) return { error: 'Slot é obrigatório' }

  const { error } = await supabase.from('ad_campaigns').insert({
    advertiser_name,
    target_url,
    slot,
    image_url,
    starts_at,
    ends_at,
    weight,
    is_active: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await requireAdminClient()

  const advertiser_name = (formData.get('advertiser_name') as string)?.trim()
  const target_url = (formData.get('target_url') as string)?.trim()
  const slot = formData.get('slot') as string
  const image_url = (formData.get('image_url') as string)?.trim() || null
  const starts_at = (formData.get('starts_at') as string) || null
  const ends_at = (formData.get('ends_at') as string) || null
  const weight = formData.get('weight') ? Number(formData.get('weight')) : 1

  if (!advertiser_name) return { error: 'Anunciante é obrigatório' }

  const { error } = await supabase
    .from('ad_campaigns')
    .update({ advertiser_name, target_url, slot, image_url, starts_at, ends_at, weight })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

export async function toggleCampaignActive(id: string, is_active: boolean) {
  const supabase = await requireAdminClient()
  await supabase.from('ad_campaigns').update({ is_active }).eq('id', id)
  revalidatePath('/admin/publicidade')
}

export async function deleteCampaign(id: string) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData: FormData) {
  const supabase = await requireAdminClient()

  const title = (formData.get('title') as string)?.trim()
  const advertiser = (formData.get('advertiser') as string)?.trim()
  const destination_url = (formData.get('destination_url') as string)?.trim()
  const placement = formData.get('placement') as 'banner' | 'interstitial' | 'native'
  const image_url = (formData.get('image_url') as string)?.trim() || null
  const starts_at = (formData.get('starts_at') as string) || null
  const ends_at = (formData.get('ends_at') as string) || null
  const budget_impressions = formData.get('budget_impressions')
    ? Number(formData.get('budget_impressions'))
    : null

  if (!title) return { error: 'Nome é obrigatório' }
  if (!advertiser) return { error: 'Anunciante é obrigatório' }
  if (!destination_url) return { error: 'URL de destino é obrigatória' }
  if (!placement) return { error: 'Slot é obrigatório' }

  const { error } = await supabase.from('ad_campaigns').insert({
    title,
    advertiser,
    destination_url,
    placement,
    image_url,
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    budget_impressions,
    active: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await requireAdminClient()

  const title = (formData.get('title') as string)?.trim()
  const advertiser = (formData.get('advertiser') as string)?.trim()
  const destination_url = (formData.get('destination_url') as string)?.trim()
  const placement = formData.get('placement') as 'banner' | 'interstitial' | 'native'
  const image_url = (formData.get('image_url') as string)?.trim() || null
  const starts_at = (formData.get('starts_at') as string) || null
  const ends_at = (formData.get('ends_at') as string) || null
  const budget_impressions = formData.get('budget_impressions')
    ? Number(formData.get('budget_impressions'))
    : null

  if (!title) return { error: 'Nome é obrigatório' }

  const { error } = await supabase
    .from('ad_campaigns')
    .update({ title, advertiser, destination_url, placement, image_url, starts_at, ends_at, budget_impressions })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

export async function toggleCampaignActive(id: string, active: boolean) {
  const supabase = await requireAdminClient()
  await supabase.from('ad_campaigns').update({ active }).eq('id', id)
  revalidatePath('/admin/publicidade')
}

export async function deleteCampaign(id: string) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/publicidade')
  return {}
}

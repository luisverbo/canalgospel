import { createClient } from '@canal-gospel/supabase'

export function shouldShowAds(_isSubscriber = false): boolean {
  return !_isSubscriber
}

export interface AdCampaign {
  id: string
  advertiser_name: string
  image_url: string | null
  target_url: string
  slot: string
}

export async function fetchActiveCampaigns(slot: string): Promise<AdCampaign[]> {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data } = await supabase
      .from('ad_campaigns')
      .select('id, advertiser_name, image_url, target_url, slot')
      .eq('slot', slot)
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('weight', { ascending: false })
      .limit(5)

    return (data as AdCampaign[] | null) ?? []
  } catch {
    return []
  }
}

export function pickCampaign(campaigns: AdCampaign[]): AdCampaign | null {
  if (!campaigns.length) return null
  return campaigns[Math.floor(Math.random() * campaigns.length)]
}

export async function recordImpression(campaignId: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('ad_impressions').insert({ campaign_id: campaignId })
  } catch { /* best-effort */ }
}

export async function recordClick(campaignId: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('ad_clicks').insert({ campaign_id: campaignId })
  } catch { /* best-effort */ }
}

const INTERSTITIAL_KEY = 'cg_last_interstitial'
const INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000

export function canShowInterstitial(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const last = Number(localStorage.getItem(INTERSTITIAL_KEY) ?? '0')
    return Date.now() - last >= INTERSTITIAL_COOLDOWN_MS
  } catch {
    return false
  }
}

export function markInterstitialShown(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INTERSTITIAL_KEY, String(Date.now()))
  } catch { /* ignore */ }
}

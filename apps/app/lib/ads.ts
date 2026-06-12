import { createClient } from '@canal-gospel/supabase'
import { getIsSubscriber } from './subscription'

export function shouldShowAds(): boolean {
  return !getIsSubscriber()
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

    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('id, advertiser_name, image_url, target_url, slot, starts_at, ends_at')
      .eq('slot', slot)
      .eq('is_active', true)
      .order('weight', { ascending: false })
      .limit(20)

    if (error) console.warn('[ads] fetchActiveCampaigns error:', error.message)

    const filtered = ((data as (AdCampaign & { starts_at: string | null; ends_at: string | null })[] | null) ?? [])
      .filter((c) => {
        if (c.starts_at && new Date(c.starts_at) > new Date(now)) return false
        if (c.ends_at && new Date(c.ends_at) < new Date(now)) return false
        return true
      })
      .slice(0, 5)

    return filtered
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

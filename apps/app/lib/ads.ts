import { createClient } from '@canal-gospel/supabase'

// Placeholder — when subscription system lands, check the user's active subscription here.
export function shouldShowAds(_isSubscriber = false): boolean {
  return !_isSubscriber
}

export interface AdCampaign {
  id: string
  title: string
  advertiser: string
  image_url: string | null
  destination_url: string
  placement: 'banner' | 'interstitial' | 'native'
}

export async function fetchActiveCampaigns(placement: AdCampaign['placement']): Promise<AdCampaign[]> {
  const supabase = createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('ad_campaigns')
    .select('id, title, advertiser, image_url, destination_url, placement')
    .eq('placement', placement)
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .limit(5)

  return (data as AdCampaign[] | null) ?? []
}

// Pick a campaign randomly (uniform — a weight column can be added later)
export function pickCampaign(campaigns: AdCampaign[]): AdCampaign | null {
  if (!campaigns.length) return null
  return campaigns[Math.floor(Math.random() * campaigns.length)]
}

// Best-effort: record impression. Requires anon INSERT on ad_impressions.
export async function recordImpression(campaignId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('ad_impressions').insert({ campaign_id: campaignId }).then(() => {})
}

// Best-effort: record click. Requires anon INSERT on ad_clicks.
export async function recordClick(campaignId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('ad_clicks').insert({ campaign_id: campaignId }).then(() => {})
}

// Interstitial frequency guard (localStorage, browser + native)
const INTERSTITIAL_KEY = 'cg_last_interstitial'
const INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export function canShowInterstitial(): boolean {
  if (typeof window === 'undefined') return false
  const last = Number(localStorage.getItem(INTERSTITIAL_KEY) ?? '0')
  return Date.now() - last >= INTERSTITIAL_COOLDOWN_MS
}

export function markInterstitialShown(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INTERSTITIAL_KEY, String(Date.now()))
  }
}

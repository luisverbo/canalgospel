import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { CampaignActions, NewCampaignButton } from './CampaignActions'

const SLOT_LABEL: Record<string, string> = {
  banner: 'Banner',
  feed_native: 'Feed Nativo',
  interstitial: 'Intersticial',
}

function ctr(impressions: number, clicks: number): string {
  if (!impressions) return '—'
  return ((clicks / impressions) * 100).toFixed(1) + '%'
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default async function PublicidadePage() {
  const supabase = await createAdminSupabaseClient()

  const { data: campaigns } = await supabase
    .from('ad_campaigns')
    .select('id, advertiser_name, target_url, slot, image_url, is_active, starts_at, ends_at, weight, created_at')
    .order('created_at', { ascending: false })

  const campaignIds = (campaigns ?? []).map((c) => c.id)

  // Count impressions and clicks per campaign from the detail tables
  const [{ data: impressionRows }, { data: clickRows }] = await Promise.all([
    campaignIds.length
      ? supabase.from('ad_impressions').select('campaign_id').in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length
      ? supabase.from('ad_clicks').select('campaign_id').in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
  ])

  const impressionCount = new Map<string, number>()
  const clickCount = new Map<string, number>()
  for (const r of impressionRows ?? []) {
    impressionCount.set(r.campaign_id, (impressionCount.get(r.campaign_id) ?? 0) + 1)
  }
  for (const r of clickRows ?? []) {
    clickCount.set(r.campaign_id, (clickCount.get(r.campaign_id) ?? 0) + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2860]">Publicidade</h1>
          <p className="text-sm text-[#8A8797] mt-1">Gerencie campanhas próprias e acompanhe resultados.</p>
        </div>
        <NewCampaignButton />
      </div>

      {!campaigns?.length && (
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 text-center py-16">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-[#8A8797]">Nenhuma campanha criada ainda.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {campaigns?.map((c) => {
          const now = new Date()
          const started = !c.starts_at || new Date(c.starts_at) <= now
          const notEnded = !c.ends_at || new Date(c.ends_at) >= now
          const withinPeriod = started && notEnded
          const impressions = impressionCount.get(c.id) ?? 0
          const clicks = clickCount.get(c.id) ?? 0

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
              <div className="flex items-start gap-4">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.advertiser_name}
                    className="h-16 w-28 shrink-0 rounded-xl object-cover border border-[#1E1B2E]/8" />
                ) : (
                  <div className="h-16 w-28 shrink-0 rounded-xl bg-[#2E2860]/5 flex items-center justify-center text-2xl">
                    📢
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.is_active && withinPeriod
                        ? 'bg-emerald-100 text-emerald-700'
                        : c.is_active
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#1E1B2E]/5 text-[#8A8797]'
                    }`}>
                      {c.is_active && withinPeriod ? 'Ativo' : c.is_active ? 'Fora do período' : 'Inativo'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2E2860]/8 text-[#2E2860]">
                      {SLOT_LABEL[c.slot] ?? c.slot}
                    </span>
                    {c.weight && c.weight > 1 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0A943]/10 text-[#9a6f1a]">
                        Peso {c.weight}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-[#1E1B2E]">{c.advertiser_name}</h3>
                  <a href={c.target_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#2E2860] underline truncate block max-w-xs">
                    {c.target_url}
                  </a>
                  <p className="text-xs text-[#8A8797] mt-0.5">
                    {fmtDate(c.starts_at)} → {fmtDate(c.ends_at)}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="text-lg font-bold text-[#2E2860]">{impressions.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] text-[#8A8797]">Impressões</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#2E2860]">{clicks.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] text-[#8A8797]">Cliques</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#E0A943]">{ctr(impressions, clicks)}</p>
                      <p className="text-[10px] text-[#8A8797]">CTR</p>
                    </div>
                  </div>
                </div>
              </div>

              <CampaignActions campaign={{
                id: c.id,
                advertiser_name: c.advertiser_name,
                target_url: c.target_url,
                slot: c.slot,
                image_url: c.image_url,
                starts_at: c.starts_at,
                ends_at: c.ends_at,
                weight: c.weight,
                is_active: c.is_active,
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

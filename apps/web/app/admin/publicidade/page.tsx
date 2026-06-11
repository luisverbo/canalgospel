import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { CampaignActions, NewCampaignButton } from './CampaignActions'

const PLACEMENT_LABEL: Record<string, string> = {
  banner: 'Banner',
  native: 'Feed Nativo',
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
    .select('id, title, advertiser, destination_url, placement, image_url, active, starts_at, ends_at, budget_impressions, total_impressions, total_clicks, created_at')
    .order('created_at', { ascending: false })

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
          const impressions = c.total_impressions ?? 0
          const clicks = c.total_clicks ?? 0
          const now = new Date()
          const started = !c.starts_at || new Date(c.starts_at) <= now
          const notEnded = !c.ends_at || new Date(c.ends_at) >= now
          const withinPeriod = started && notEnded

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
              <div className="flex items-start gap-4">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title}
                    className="h-16 w-28 shrink-0 rounded-xl object-cover border border-[#1E1B2E]/8" />
                ) : (
                  <div className="h-16 w-28 shrink-0 rounded-xl bg-[#2E2860]/5 flex items-center justify-center text-2xl">
                    📢
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.active && withinPeriod
                        ? 'bg-emerald-100 text-emerald-700'
                        : c.active
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#1E1B2E]/5 text-[#8A8797]'
                    }`}>
                      {c.active && withinPeriod ? 'Ativo' : c.active ? 'Fora do período' : 'Inativo'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2E2860]/8 text-[#2E2860]">
                      {PLACEMENT_LABEL[c.placement] ?? c.placement}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#1E1B2E]">{c.title}</h3>
                  <p className="text-xs text-[#8A8797]">{c.advertiser}</p>
                  <p className="text-xs text-[#8A8797] mt-0.5">
                    {fmtDate(c.starts_at)} → {fmtDate(c.ends_at)}
                    {c.budget_impressions ? ` · Limite: ${c.budget_impressions.toLocaleString('pt-BR')} impr.` : ''}
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
                title: c.title,
                advertiser: c.advertiser,
                destination_url: c.destination_url,
                placement: c.placement,
                image_url: c.image_url,
                starts_at: c.starts_at,
                ends_at: c.ends_at,
                budget_impressions: c.budget_impressions,
                active: c.active,
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

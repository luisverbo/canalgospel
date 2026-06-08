import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@canal-gospel/ui'
import { SendWhatsAppButton } from './SendWhatsAppButton'

export default async function WhatsAppPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalSubscribers },
    { count: activeSubscribers },
    { data: subscribers },
    { data: sendLogs },
    { data: devotionals },
  ] = await Promise.all([
    supabase.from('whatsapp_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('whatsapp_subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true),
    supabase.from('whatsapp_subscribers').select('*').order('opted_in_at', { ascending: false }).limit(50),
    supabase.from('whatsapp_sends_log').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('daily_devotionals').select('id, title, scheduled_date').eq('published', true).order('scheduled_date', { ascending: false }).limit(10),
  ])

  const statusColor = {
    pending: 'neutral',
    sending: 'gold',
    completed: 'green',
    failed: 'red',
  } as const

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2860] mb-6">WhatsApp</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
            <p className="text-3xl font-bold text-[#1E1B2E]">{totalSubscribers ?? 0}</p>
            <p className="text-xs text-[#8A8797] mt-1">Total de inscritos</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5">
            <p className="text-3xl font-bold text-emerald-600">{activeSubscribers ?? 0}</p>
            <p className="text-xs text-[#8A8797] mt-1">Ativos</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-[#1E1B2E] mb-4">Enviar Devocional</h2>
        <SendWhatsAppButton
          devotionals={devotionals?.map(d => ({ id: d.id, title: d.title, scheduled_date: d.scheduled_date })) ?? []}
        />
      </div>

      <div>
        <h2 className="font-semibold text-[#1E1B2E] mb-4">Histórico de Envios</h2>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FAF7F1] border-b border-[#1E1B2E]/8">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Mensagem</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Enviados</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Falhas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B2E]/5">
              {sendLogs?.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-3 text-sm text-[#1E1B2E] max-w-xs truncate">{log.message_text}</td>
                  <td className="px-5 py-3 text-sm text-[#1E1B2E]">{log.sent_count} / {log.total_recipients}</td>
                  <td className="px-5 py-3 text-sm text-red-600">{log.failed_count}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusColor[log.status]}>
                      {log.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#8A8797]">
                    {new Date(log.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!sendLogs?.length && (
            <p className="text-center text-[#8A8797] py-8">Nenhum envio registrado.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-[#1E1B2E] mb-4">Inscritos ({activeSubscribers ?? 0} ativos)</h2>
        <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FAF7F1] border-b border-[#1E1B2E]/8">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Telefone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8A8797] uppercase">Inscrito em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B2E]/5">
              {subscribers?.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 text-sm font-mono text-[#1E1B2E]">{s.phone}</td>
                  <td className="px-5 py-3 text-sm text-[#1E1B2E]">{s.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <Badge variant={s.subscribed ? 'green' : 'neutral'}>
                      {s.subscribed ? 'Ativo' : 'Cancelado'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#8A8797]">
                    {new Date(s.opted_in_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

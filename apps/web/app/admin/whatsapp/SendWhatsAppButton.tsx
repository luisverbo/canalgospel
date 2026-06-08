'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Devotional {
  id: string
  title: string
  scheduled_date: string
}

export function SendWhatsAppButton({ devotionals }: { devotionals: Devotional[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    const message = customMessage.trim()
    if (!message) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('whatsapp_sends_log').insert({
      devotional_id: selectedId || null,
      message_text: message,
      status: 'pending',
      triggered_by: user?.id ?? null,
    })

    setSent(true)
    setLoading(false)
    router.refresh()
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
      {sent && (
        <p className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm font-medium">
          Envio agendado com sucesso!
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Devocional (opcional)</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#2E2860]"
        >
          <option value="">Selecionar devocional...</option>
          {devotionals.map((d) => (
            <option key={d.id} value={d.id}>
              {new Date(d.scheduled_date).toLocaleDateString('pt-BR')} — {d.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">Mensagem</label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#2E2860] resize-y"
          placeholder="Digite a mensagem para os inscritos..."
        />
      </div>
      <button
        onClick={handleSend}
        disabled={loading || !customMessage.trim()}
        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Agendando...' : '💬 Enviar para todos os inscritos'}
      </button>
    </div>
  )
}

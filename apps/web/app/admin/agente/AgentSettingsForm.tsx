'use client'

import { useState } from 'react'
import { saveAgentSettings } from './actions'

interface Props {
  settings: {
    doctrine_instructions: string
    auto_publish: boolean
    publish_time: string
    model: string
  }
}

const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (rápido, econômico)' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (melhor qualidade)' },
]

export function AgentSettingsForm({ settings }: Props) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [autoPublish, setAutoPublish] = useState(settings.auto_publish)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    const fd = new FormData(e.currentTarget)
    fd.set('auto_publish', autoPublish ? 'true' : 'false')
    const res = await saveAgentSettings(fd)
    setSaving(false)
    setStatus(res?.error ? { ok: false, msg: res.error } : { ok: true, msg: 'Configurações salvas.' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {status && (
        <p className={`text-sm px-3 py-2 rounded-lg ${status.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {status.msg}
        </p>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">
          Modelo de IA
        </label>
        <select name="model" defaultValue={settings.model}
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm bg-white outline-none focus:border-[#2E2860]">
          {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8A8797] mb-1">
          Diretrizes de doutrina e estilo
        </label>
        <textarea
          name="doctrine_instructions"
          defaultValue={settings.doctrine_instructions}
          rows={6}
          placeholder={`Ex.: Siga a teologia da Fé Positiva (Word of Faith). Enfatize a soberania de Deus, a vitória em Cristo e a autoridade do crente. Tom: esperançoso, edificante, prático. Não use linguagem de condenação ou medo.`}
          className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] resize-none"
        />
        <p className="text-xs text-[#8A8797] mt-1">
          O agente segue essas diretrizes de ênfase e estilo, mas todo o conteúdo gerado é original —
          não cita nem reproduz obras de terceiros, e não menciona autores no texto publicado.
        </p>
      </div>

      <div className="border border-[#1E1B2E]/10 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1E1B2E]">Modo automático</p>
            <p className="text-xs text-[#8A8797] mt-0.5">Gerar e publicar sem aprovação manual</p>
          </div>
          <button
            type="button"
            onClick={() => setAutoPublish((v) => !v)}
            className={`w-12 h-6 rounded-full transition-colors relative ${autoPublish ? 'bg-[#2E2860]' : 'bg-[#1E1B2E]/15'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoPublish ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className={`transition-opacity ${autoPublish ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Horário de geração</label>
          <input type="time" name="publish_time" defaultValue={settings.publish_time}
            className="px-3 py-1.5 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
          ⚠️ <strong>Modo automático ainda não dispara sozinho</strong> — a preferência é salva, mas o cron job precisa ser
          configurado separadamente para de fato automatizar a geração diária.
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-[#2E2860] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </form>
  )
}

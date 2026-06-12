'use client'

import { useState } from 'react'
import { savePartnershipSettings } from './actions'

interface Settings {
  partnership_title: string
  partnership_body: string
  partnership_whatsapp: string
  partnership_whatsapp_message: string
  partnership_email: string
}

export function ParceriaForm({ settings }: { settings: Settings }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    const fd = new FormData(e.currentTarget)
    const res = await savePartnershipSettings(fd)
    setSaving(false)
    if (res?.error) {
      setStatus({ ok: false, msg: res.error })
    } else {
      setStatus({ ok: true, msg: 'Configurações salvas com sucesso!' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
          status.ok
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {status.ok ? '✓ ' : '✗ '}{status.msg}
        </div>
      )}

      {/* Texto da página */}
      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[#1E1B2E] border-b border-[#1E1B2E]/8 pb-3">
          Texto da página
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Título</label>
          <input
            name="partnership_title"
            defaultValue={settings.partnership_title}
            placeholder="Seja um Parceiro de Conteúdo"
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">
            Texto de apresentação
          </label>
          <textarea
            name="partnership_body"
            defaultValue={settings.partnership_body}
            rows={4}
            placeholder="Explique os benefícios de ser parceiro..."
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] resize-none"
          />
          <p className="text-xs text-[#8A8797] mt-1">Aparece abaixo do título na página do app.</p>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[#1E1B2E] border-b border-[#1E1B2E]/8 pb-3">
          Canal WhatsApp
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Número do WhatsApp</label>
          <input
            name="partnership_whatsapp"
            defaultValue={settings.partnership_whatsapp}
            placeholder="5511999999999 (com DDI, sem espaços)"
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]"
          />
          <p className="text-xs text-[#8A8797] mt-1">Deixe em branco para não exibir o botão de WhatsApp.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Mensagem padrão do WhatsApp</label>
          <textarea
            name="partnership_whatsapp_message"
            defaultValue={settings.partnership_whatsapp_message}
            rows={3}
            placeholder="Olá! Tenho interesse em ser parceiro..."
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860] resize-none"
          />
        </div>
      </div>

      {/* E-mail */}
      <div className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[#1E1B2E] border-b border-[#1E1B2E]/8 pb-3">
          Canal E-mail
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#8A8797] mb-1">Endereço de e-mail de contato</label>
          <input
            name="partnership_email"
            type="email"
            defaultValue={settings.partnership_email}
            placeholder="parceria@canalgospel.com.br"
            className="w-full px-3 py-2 rounded-xl border border-[#1E1B2E]/15 text-sm outline-none focus:border-[#2E2860]"
          />
          <p className="text-xs text-[#8A8797] mt-1">Deixe em branco para não exibir o botão de e-mail.</p>
        </div>
      </div>

      <div className="bg-[#2E2860]/5 rounded-2xl border border-[#2E2860]/10 px-4 py-3 text-sm text-[#2E2860]">
        💡 Apenas os canais preenchidos aparecem no app. Se ambos estiverem em branco, o app exibe
        "Em breve — formas de contato serão disponibilizadas."
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </form>
  )
}

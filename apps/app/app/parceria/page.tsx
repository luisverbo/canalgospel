'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@canal-gospel/supabase'
import Link from 'next/link'

interface Settings {
  title: string
  body: string
  whatsapp: string
  whatsapp_message: string
  email: string
}

const DEFAULTS: Settings = {
  title: 'Seja um Parceiro de Conteúdo',
  body: 'Publique seus estudos e devocionais no Canal Gospel, alcance milhares de leitores e receba apoio direto da comunidade via PIX.',
  whatsapp: '',
  whatsapp_message: 'Olá! Tenho interesse em ser parceiro de conteúdo do Canal Gospel.',
  email: '',
}

function usePartnershipSettings(): { settings: Settings; loading: boolean } {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [
        'partnership_title',
        'partnership_body',
        'partnership_whatsapp',
        'partnership_whatsapp_message',
        'partnership_email',
      ])
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
          setSettings({
            title: map['partnership_title'] || DEFAULTS.title,
            body: map['partnership_body'] || DEFAULTS.body,
            whatsapp: map['partnership_whatsapp'] || '',
            whatsapp_message: map['partnership_whatsapp_message'] || DEFAULTS.whatsapp_message,
            email: map['partnership_email'] || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { settings, loading }
}

export default function ParceriaPage() {
  const { settings, loading } = usePartnershipSettings()

  const whatsappClean = settings.whatsapp.replace(/\D/g, '')
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(settings.whatsapp_message)}`
    : null
  const emailUrl = settings.email ? `mailto:${settings.email}?subject=${encodeURIComponent('Parceria Canal Gospel')}` : null
  const hasContact = whatsappUrl || emailUrl

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F1] dark:bg-[#17141F]">
      {/* Hero */}
      <div className="bg-[#2E2860] px-5 pt-10 pb-12 text-white">
        <Link href="/" className="text-white/60 text-sm mb-8 block">← Voltar</Link>
        <div className="flex flex-col items-center text-center gap-4 max-w-xs mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-[#E0A943]/20 border-2 border-[#E0A943] flex items-center justify-center text-3xl">
            🤝
          </div>
          {loading ? (
            <div className="h-8 w-56 rounded-lg bg-white/10 animate-pulse" />
          ) : (
            <h1 className="text-2xl font-bold leading-tight">{settings.title}</h1>
          )}
        </div>
      </div>

      {/* Benefícios */}
      <div className="px-5 py-6 flex flex-col gap-5">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded bg-[#2E2860]/8 animate-pulse" />)}
          </div>
        ) : (
          <p className="text-[#1E1B2E] dark:text-[#D8D5E4] text-base leading-relaxed">
            {settings.body}
          </p>
        )}

        {/* Cards de benefício */}
        <div className="flex flex-col gap-3">
          {[
            { icon: '📖', title: 'Publique seus estudos', desc: 'Compartilhe devocionais, séries e mensagens com a comunidade.' },
            { icon: '🌎', title: 'Alcance audiência', desc: 'Seu conteúdo aparece na Home e na lista de estudos do app.' },
            { icon: '💛', title: 'Receba apoio via PIX', desc: 'Os leitores podem apoiar diretamente o seu ministério.' },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-4 bg-white dark:bg-[#211E2D] rounded-2xl p-4 border border-[#1E1B2E]/7 dark:border-white/7">
              <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
              <div>
                <p className="font-semibold text-sm text-[#1E1B2E] dark:text-[#F3F1FA]">{b.title}</p>
                <p className="text-xs text-[#8A8797] mt-0.5 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de contato */}
        {!loading && hasContact && (
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide text-center">
              Entre em contato
            </p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#E0A943] text-[#1E1B2E] rounded-2xl font-bold text-base active:scale-[0.98] transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.054 23.447a.5.5 0 0 0 .607.607l5.585-1.479A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.628-.5-5.148-1.37l-.368-.215-3.815 1.01 1.01-3.815-.215-.368A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Falar pelo WhatsApp
              </a>
            )}
            {emailUrl && (
              <a
                href={emailUrl}
                className="flex items-center justify-center gap-3 w-full py-3.5 border-2 border-[#2E2860] text-[#2E2860] dark:text-[#B5B0D8] dark:border-[#B5B0D8] rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Enviar e-mail
              </a>
            )}
          </div>
        )}

        {!loading && !hasContact && (
          <p className="text-center text-sm text-[#8A8797] py-4">
            Em breve — formas de contato serão disponibilizadas.
          </p>
        )}
      </div>
    </div>
  )
}

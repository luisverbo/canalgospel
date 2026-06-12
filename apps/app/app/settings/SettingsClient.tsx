'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'
import Link from 'next/link'
import { getIsSubscriber, setIsSubscriber } from '@/lib/subscription'

export function SettingsClient() {
  const { theme, setTheme } = useTheme()
  const [isSub, setIsSub] = useState(false)

  useEffect(() => {
    setIsSub(getIsSubscriber())
  }, [])

  function handleToggle() {
    const next = !isSub
    setIsSubscriber(next)
    setIsSub(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Partnership CTA */}
      <Link href="/parceria">
        <div className="flex items-center gap-4 bg-[#2E2860] rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-[#E0A943] flex items-center justify-center text-xl">
            🤝
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Seja um parceiro de conteúdo</p>
            <p className="text-white/60 text-xs mt-0.5">Publique estudos e ganhe audiência</p>
          </div>
          <span className="text-[#E0A943] font-bold text-lg">›</span>
        </div>
      </Link>

      {/* Subscription */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
          Assinatura — Plano Pregador
        </h2>
        {isSub ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">✓</span>
              <p className="text-sm font-semibold text-[#1E1B2E] dark:text-[#D8D5E4]">Plano Pregador ativo</p>
            </div>
            <p className="text-xs text-[#8A8797]">Assistente de Sermão IA desbloqueado · Zero anúncios</p>
            <button
              onClick={handleToggle}
              className="w-full py-2.5 border border-[#1E1B2E]/15 text-[#8A8797] rounded-xl text-xs active:scale-95 transition-transform"
            >
              Cancelar assinatura (modo teste)
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#8A8797]">
              Assine para acessar o Assistente de Sermão com IA e navegar sem anúncios.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#FAF7F1] dark:bg-white/5 rounded-xl p-3 text-center">
                <p className="text-base font-bold text-[#2E2860] dark:text-[#B5B0D8]">R$ 9,90</p>
                <p className="text-[10px] text-[#8A8797]">por mês</p>
              </div>
              <div className="flex-1 bg-[#FAF7F1] dark:bg-white/5 rounded-xl p-3 text-center">
                <p className="text-base font-bold text-[#2E2860] dark:text-[#B5B0D8]">R$ 59,90</p>
                <p className="text-[10px] text-[#8A8797]">por ano · -49%</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="w-full py-3 bg-[#E0A943] text-[#1E1B2E] rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              ✨ Ativar assinatura (modo teste)
            </button>
            <p className="text-[10px] text-[#8A8797] text-center">
              Modo de teste — na versão final a cobrança será via RevenueCat.
            </p>
          </div>
        )}
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
          Aparência
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Tema</span>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  theme === t
                    ? 'bg-[#2E2860] text-white'
                    : 'bg-[#2E2860]/10 text-[#2E2860] dark:text-[#B5B0D8] dark:bg-white/10'
                }`}
              >
                {t === 'light' ? '☀ Claro' : '🌙 Escuro'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 divide-y divide-[#1E1B2E]/5 dark:divide-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Versão</span>
          <span className="text-sm text-[#8A8797]">1.0.0</span>
        </div>
        <a href="https://canalgospel.vercel.app/privacidade" target="_blank" rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Política de Privacidade</span>
          <span className="text-[#8A8797]">→</span>
        </a>
        <a href="https://canalgospel.vercel.app/termos" target="_blank" rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Termos de Uso</span>
          <span className="text-[#8A8797]">→</span>
        </a>
      </section>
    </div>
  )
}

'use client'

import { useTheme } from '@/lib/theme'
import Link from 'next/link'

export function SettingsClient() {
  const { theme, setTheme } = useTheme()

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

      {/* Subscription — em breve */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
          Assinatura — Plano Pregador
        </h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#8A8797]">
            Em breve: assine para acessar o Assistente de Sermão com IA e navegar sem anúncios.
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
        </div>
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

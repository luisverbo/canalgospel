'use client'

import { useTheme } from '@/lib/theme'

export function SettingsClient() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
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

      {/* Subscription */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
          Assinatura
        </h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#8A8797]">
            Assine para remover anúncios e acessar conteúdo exclusivo.
          </p>
          <button className="w-full py-3 bg-[#E0A943] text-[#1E1B2E] rounded-xl font-semibold text-sm active:scale-95 transition-transform">
            Assinar por R$ 9,90/mês
          </button>
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 divide-y divide-[#1E1B2E]/5 dark:divide-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Versão</span>
          <span className="text-sm text-[#8A8797]">1.0.0</span>
        </div>
        <a
          href="https://canalgospel.com.br/privacidade"
          target="_blank" rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Política de Privacidade</span>
          <span className="text-[#8A8797]">→</span>
        </a>
        <a
          href="https://canalgospel.com.br/termos"
          target="_blank" rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">Termos de Uso</span>
          <span className="text-[#8A8797]">→</span>
        </a>
      </section>
    </div>
  )
}

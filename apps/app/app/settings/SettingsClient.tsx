'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface Subscription {
  plan: string
  status: string
  current_period_end: string
}

export function SettingsClient({
  user,
  subscription,
}: {
  user: User | null
  subscription: Subscription | null
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal')

  return (
    <div className="flex flex-col gap-4">
      {/* Account */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-2">
            Conta
          </h2>
          {user ? (
            <p className="text-sm text-[#1E1B2E]">{user.email}</p>
          ) : (
            <p className="text-sm text-[#8A8797]">Não conectado</p>
          )}
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
            Assinatura
          </h2>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1E1B2E]">
                  Premium {subscription.plan === 'yearly' ? 'Anual' : 'Mensal'}
                </p>
                <p className="text-xs text-[#8A8797]">
                  Válido até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                Ativo
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#8A8797]">
                Assine para remover anúncios e acessar conteúdo exclusivo.
              </p>
              <button className="w-full py-3 bg-[#E0A943] text-[#1E1B2E] rounded-xl font-semibold text-sm">
                Assinar por R$ 9,90/mês
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-4">
        <h2 className="text-xs font-semibold text-[#8A8797] uppercase tracking-wide mb-3">
          Aparência
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1E1B2E]">Tema</span>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? 'bg-[#2E2860] text-white'
                      : 'bg-[#2E2860]/10 text-[#2E2860]'
                  }`}
                >
                  {t === 'light' ? 'Claro' : 'Escuro'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1E1B2E]">Tamanho do texto</span>
            <div className="flex gap-2">
              {(['small', 'normal', 'large'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFontSize(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    fontSize === f
                      ? 'bg-[#2E2860] text-white'
                      : 'bg-[#2E2860]/10 text-[#2E2860]'
                  }`}
                >
                  {f === 'small' ? 'A' : f === 'normal' ? 'A' : 'A'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white rounded-2xl border border-[#1E1B2E]/8 divide-y divide-[#1E1B2E]/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[#1E1B2E]">Versão</span>
          <span className="text-sm text-[#8A8797]">1.0.0</span>
        </div>
        <a
          href="https://canalgospel.com.br/privacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm text-[#1E1B2E]">Política de Privacidade</span>
          <span className="text-[#8A8797]">→</span>
        </a>
        <a
          href="https://canalgospel.com.br/termos"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm text-[#1E1B2E]">Termos de Uso</span>
          <span className="text-[#8A8797]">→</span>
        </a>
      </section>
    </div>
  )
}

'use client'

import { createClient } from '@canal-gospel/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou senha inválidos.')
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#2E2860] placeholder-[#8A8797]"
          placeholder="admin@canalgospel.com.br"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#1E1B2E]/15 bg-[#FAF7F1] text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#2E2860]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

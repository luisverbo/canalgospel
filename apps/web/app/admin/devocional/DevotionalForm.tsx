'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DevotionalForm() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    verse_ref: '',
    verse_text: '',
    reflection: '',
    youtube_url: '',
  })

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload: Record<string, string> = {
      date: form.date,
      verse_ref: form.verse_ref,
      verse_text: form.verse_text,
    }
    if (form.reflection.trim()) payload.reflection = form.reflection.trim()
    if (form.youtube_url.trim()) payload.youtube_url = form.youtube_url.trim()

    const { error: insertError } = await supabase.from('daily_devotionals').insert(payload)
    if (!insertError) {
      setSuccess(true)
      setForm({
        date: new Date().toISOString().split('T')[0],
        verse_ref: '',
        verse_text: '',
        reflection: '',
        youtube_url: '',
      })
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(insertError.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1E1B2E]/8 p-5 flex flex-col gap-4">
      {success && (
        <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2 text-sm font-medium">
          Devocional salvo com sucesso!
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-2 text-sm font-medium">
          Erro: {error}
        </div>
      )}

      <Field label="Data">
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          className="field-input"
        />
      </Field>

      <Field label="Referência do Versículo">
        <input
          required
          value={form.verse_ref}
          onChange={(e) => set('verse_ref', e.target.value)}
          className="field-input"
          placeholder="Ex: João 3:16"
        />
      </Field>

      <Field label="Texto do Versículo">
        <textarea
          required
          value={form.verse_text}
          onChange={(e) => set('verse_text', e.target.value)}
          className="field-input"
          rows={3}
          placeholder="Texto completo do versículo..."
        />
      </Field>

      <Field label="Reflexão (opcional)">
        <textarea
          value={form.reflection}
          onChange={(e) => set('reflection', e.target.value)}
          className="field-input"
          rows={4}
          placeholder="Mensagem de reflexão..."
        />
      </Field>

      <Field label="YouTube (opcional)">
        <input
          type="url"
          value={form.youtube_url}
          onChange={(e) => set('youtube_url', e.target.value)}
          className="field-input"
          placeholder="https://youtube.com/watch?v=..."
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#2E2860] text-white rounded-xl font-semibold text-sm hover:bg-[#3D3580] disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Devocional'}
      </button>

      <style jsx>{`
        .field-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(30, 27, 46, 0.15);
          background: #FAF7F1;
          color: #1E1B2E;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }
        .field-input:focus {
          border-color: #2E2860;
        }
      `}</style>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E1B2E] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

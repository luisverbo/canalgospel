'use client'

import { createClient } from '@canal-gospel/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DevotionalForm() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    verse: '',
    verse_reference: '',
    reflection: '',
    prayer: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    published: false,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('daily_devotionals').insert(form)
    if (!error) {
      setSuccess(true)
      setForm({
        title: '',
        verse: '',
        verse_reference: '',
        reflection: '',
        prayer: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        published: false,
      })
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
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

      <Field label="Título">
        <input required value={form.title} onChange={(e) => set('title', e.target.value)}
          className="field-input" placeholder="Ex: A Paz que Excede todo Entendimento" />
      </Field>

      <Field label="Versículo">
        <textarea required value={form.verse} onChange={(e) => set('verse', e.target.value)}
          className="field-input" rows={2} placeholder="Texto do versículo" />
      </Field>

      <Field label="Referência">
        <input required value={form.verse_reference} onChange={(e) => set('verse_reference', e.target.value)}
          className="field-input" placeholder="Ex: Filipenses 4:7" />
      </Field>

      <Field label="Reflexão">
        <textarea required value={form.reflection} onChange={(e) => set('reflection', e.target.value)}
          className="field-input" rows={4} placeholder="Mensagem de reflexão..." />
      </Field>

      <Field label="Oração (opcional)">
        <textarea value={form.prayer} onChange={(e) => set('prayer', e.target.value)}
          className="field-input" rows={2} placeholder="Oração sugerida..." />
      </Field>

      <Field label="Data">
        <input type="date" required value={form.scheduled_date}
          onChange={(e) => set('scheduled_date', e.target.value)} className="field-input" />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set('published', e.target.checked)}
          className="h-4 w-4 rounded accent-[#2E2860]"
        />
        <span className="text-sm text-[#1E1B2E]">Publicar imediatamente</span>
      </label>

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
          ring: 2px solid #2E2860;
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

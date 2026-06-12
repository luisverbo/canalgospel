'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, WandSparkles, ChevronRight, FileText, Download, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@canal-gospel/supabase'
import { getIsSubscriber, getDeviceId } from '@/lib/subscription'

interface SermonPoint {
  title: string
  content: string
  verses: string[]
  illustration: string
}

interface SermonOutline {
  title: string
  introduction: string
  points: SermonPoint[]
  conclusion: string
  call_to_action: string
  practical_application: string
}

interface FormValues {
  theme: string
  base_verse: string
  worship_type: string
  duration_min: number
}

interface HistoryItem {
  id: string
  theme: string
  base_verse: string | null
  worship_type: string
  duration_min: number
  result_json: SermonOutline
  created_at: string
}

const WORSHIP_OPTIONS = [
  { value: 'domingo-manha', label: 'Domingo de manhã' },
  { value: 'jovens', label: 'Culto de jovens' },
  { value: 'evangelismo', label: 'Evangelismo' },
  { value: 'funeral', label: 'Culto fúnebre' },
  { value: 'celula', label: 'Célula' },
  { value: 'estudo-biblico', label: 'Estudo bíblico' },
]

const DURATION_OPTIONS = [
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 40, label: '40 min' },
  { value: 60, label: '60 min' },
]

const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL ?? '').replace(/\/$/, '')

// ─── PDF export ───────────────────────────────────────────────────────────────

async function exportPDF(outline: SermonOutline, theme: string, baseVerse?: string | null) {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    let y = 20
    const margin = 15
    const lh = 6
    const width = doc.internal.pageSize.getWidth() - 2 * margin

    const add = (text: string, size = 11, bold = false) => {
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, width) as string[]
      lines.forEach((line) => {
        if (y > 282) { doc.addPage(); y = 20 }
        doc.text(line, margin, y)
        y += lh
      })
      y += 2
    }

    add(outline.title, 18, true)
    add(`Tema: ${theme}`, 10)
    if (baseVerse) add(`Versículo base: ${baseVerse}`, 10)
    y += 4

    add('INTRODUÇÃO', 12, true)
    add(outline.introduction)
    y += 4

    outline.points.forEach((pt, i) => {
      add(`PONTO ${i + 1}: ${pt.title}`, 12, true)
      add(pt.content)
      if (pt.verses.length) add(`Versículos: ${pt.verses.join(', ')}`, 10)
      add(`Ilustração: ${pt.illustration}`, 10)
      y += 4
    })

    add('CONCLUSÃO', 12, true)
    add(outline.conclusion)
    y += 2
    add('Chamada à decisão:', 11, true)
    add(outline.call_to_action)
    y += 2
    add('Aplicação prática:', 11, true)
    add(outline.practical_application)

    const filename = `sermao-${theme.replace(/[^a-zA-Z0-9À-ž]/g, '-').toLowerCase()}.pdf`
    doc.save(filename)
  } catch (e) {
    alert('Erro ao gerar PDF: ' + (e instanceof Error ? e.message : String(e)))
  }
}

// ─── Inline-edit helpers ──────────────────────────────────────────────────────

const TA = 'w-full px-3 py-2 rounded-xl border border-[#2E2860]/30 text-sm outline-none focus:border-[#2E2860] bg-[#FAF7F1] dark:bg-white/5 dark:text-[#F3F1FA] resize-none'
const INPUT = 'w-full px-3 py-2 rounded-xl border border-[#2E2860]/30 text-sm outline-none focus:border-[#2E2860] bg-[#FAF7F1] dark:bg-white/5 dark:text-[#F3F1FA]'

function EditBar({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2 mt-2">
      <button type="button" onClick={onCancel}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1E1B2E]/15 text-xs text-[#8A8797]">
        <X size={12} /> Cancelar
      </button>
      <button type="button" onClick={onSave}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2E2860] text-white text-xs font-semibold">
        <Check size={12} /> Salvar
      </button>
    </div>
  )
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#1E1B2E]/10 dark:border-white/10 text-[#8A8797] text-xs hover:border-[#2E2860]/30 hover:text-[#2E2860] transition-colors">
      <Pencil size={11} strokeWidth={2} /> Editar
    </button>
  )
}

// ─── OutlineView ──────────────────────────────────────────────────────────────

type EditSection = 'title' | 'intro' | `point-${number}` | 'conclusion' | null

function OutlineView({
  outline, theme, baseVerse, onUpdate, onNew,
}: {
  outline: SermonOutline
  theme: string
  baseVerse?: string | null
  onUpdate: (updated: SermonOutline) => void
  onNew: () => void
}) {
  const [editing, setEditing] = useState<EditSection>(null)
  // Draft state per section
  const [draftTitle, setDraftTitle] = useState('')
  const [draftIntro, setDraftIntro] = useState('')
  const [draftPoint, setDraftPoint] = useState<{ title: string; content: string; verses: string; illustration: string }>({ title: '', content: '', verses: '', illustration: '' })
  const [draftConclusion, setDraftConclusion] = useState({ conclusion: '', call_to_action: '', practical_application: '' })

  const startEdit = (section: EditSection) => {
    if (section === 'title') setDraftTitle(outline.title)
    else if (section === 'intro') setDraftIntro(outline.introduction)
    else if (section === 'conclusion') setDraftConclusion({ conclusion: outline.conclusion, call_to_action: outline.call_to_action, practical_application: outline.practical_application })
    else if (section?.startsWith('point-')) {
      const i = Number(section.split('-')[1])
      const pt = outline.points[i]
      setDraftPoint({ title: pt.title, content: pt.content, verses: pt.verses.join('\n'), illustration: pt.illustration })
    }
    setEditing(section)
  }

  const saveEdit = () => {
    let updated = { ...outline }
    if (editing === 'title') {
      updated = { ...updated, title: draftTitle.trim() || updated.title }
    } else if (editing === 'intro') {
      updated = { ...updated, introduction: draftIntro.trim() || updated.introduction }
    } else if (editing === 'conclusion') {
      updated = { ...updated, conclusion: draftConclusion.conclusion, call_to_action: draftConclusion.call_to_action, practical_application: draftConclusion.practical_application }
    } else if (editing?.startsWith('point-')) {
      const i = Number(editing.split('-')[1])
      const newPoints = [...updated.points]
      newPoints[i] = {
        title: draftPoint.title.trim() || newPoints[i].title,
        content: draftPoint.content,
        verses: draftPoint.verses.split('\n').map((v) => v.trim()).filter(Boolean),
        illustration: draftPoint.illustration,
      }
      updated = { ...updated, points: newPoints }
    }
    onUpdate(updated)
    setEditing(null)
  }

  const cancel = () => setEditing(null)

  return (
    <div className="flex flex-col gap-4">
      {/* Title card */}
      <div className="bg-[#2E2860] rounded-2xl p-5">
        <p className="text-[#E0A943] text-xs font-bold uppercase tracking-widest mb-1">Esboço gerado</p>
        {editing === 'title' ? (
          <>
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white text-lg font-bold outline-none" />
            <EditBar onSave={saveEdit} onCancel={cancel} />
          </>
        ) : (
          <div className="flex items-start gap-2">
            <h2 className="text-white text-xl font-bold leading-snug flex-1">{outline.title}</h2>
            <button type="button" onClick={() => startEdit('title')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/20 text-white/70 text-xs hover:border-white/50 transition-colors mt-0.5">
              <Pencil size={11} strokeWidth={2} /> Editar
            </button>
          </div>
        )}
      </div>

      {/* Introduction */}
      <div className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#8A8797] uppercase tracking-wide">Introdução</h3>
          {editing !== 'intro' && <EditBtn onClick={() => startEdit('intro')} />}
        </div>
        {editing === 'intro' ? (
          <>
            <textarea value={draftIntro} onChange={(e) => setDraftIntro(e.target.value)} rows={5} className={TA} />
            <EditBar onSave={saveEdit} onCancel={cancel} />
          </>
        ) : (
          <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4] leading-relaxed">{outline.introduction}</p>
        )}
      </div>

      {/* Points */}
      {outline.points?.map((pt, i) => {
        const key = `point-${i}` as EditSection
        const isEditing = editing === key
        return (
          <div key={i} className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-6 w-6 rounded-full bg-[#2E2860] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {isEditing ? (
                <input value={draftPoint.title} onChange={(e) => setDraftPoint((d) => ({ ...d, title: e.target.value }))}
                  className={INPUT + ' flex-1'} placeholder="Título do ponto" />
              ) : (
                <>
                  <h3 className="font-semibold text-[#1E1B2E] dark:text-[#F3F1FA] flex-1 leading-snug">{pt.title}</h3>
                  <EditBtn onClick={() => startEdit(key)} />
                </>
              )}
            </div>
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Desenvolvimento</label>
                  <textarea value={draftPoint.content} onChange={(e) => setDraftPoint((d) => ({ ...d, content: e.target.value }))} rows={4} className={TA} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Versículos (um por linha)</label>
                  <textarea value={draftPoint.verses} onChange={(e) => setDraftPoint((d) => ({ ...d, verses: e.target.value }))} rows={2} className={TA} placeholder="João 3:16&#10;Rm 8:28" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Ilustração</label>
                  <textarea value={draftPoint.illustration} onChange={(e) => setDraftPoint((d) => ({ ...d, illustration: e.target.value }))} rows={3} className={TA} />
                </div>
                <EditBar onSave={saveEdit} onCancel={cancel} />
              </div>
            ) : (
              <>
                <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4] leading-relaxed mb-3">{pt.content}</p>
                {pt.verses?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {pt.verses.map((v) => (
                      <span key={v} className="text-xs bg-[#2E2860]/8 text-[#2E2860] dark:bg-[#2E2860]/30 dark:text-[#B5B0D8] px-2 py-0.5 rounded-full font-medium">{v}</span>
                    ))}
                  </div>
                )}
                <div className="bg-[#FAF7F1] dark:bg-white/5 rounded-xl px-3 py-2">
                  <p className="text-[9px] font-bold text-[#8A8797] uppercase tracking-wide mb-0.5">Ilustração sugerida</p>
                  <p className="text-xs text-[#1E1B2E] dark:text-[#D8D5E4] leading-relaxed">{pt.illustration}</p>
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* Conclusion */}
      <div className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#8A8797] uppercase tracking-wide">Conclusão</h3>
          {editing !== 'conclusion' && <EditBtn onClick={() => startEdit('conclusion')} />}
        </div>
        {editing === 'conclusion' ? (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Conclusão</label>
              <textarea value={draftConclusion.conclusion} onChange={(e) => setDraftConclusion((d) => ({ ...d, conclusion: e.target.value }))} rows={4} className={TA} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Chamada à decisão</label>
              <textarea value={draftConclusion.call_to_action} onChange={(e) => setDraftConclusion((d) => ({ ...d, call_to_action: e.target.value }))} rows={3} className={TA} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8A8797] uppercase tracking-wide block mb-1">Aplicação prática</label>
              <textarea value={draftConclusion.practical_application} onChange={(e) => setDraftConclusion((d) => ({ ...d, practical_application: e.target.value }))} rows={3} className={TA} />
            </div>
            <EditBar onSave={saveEdit} onCancel={cancel} />
          </div>
        ) : (
          <>
            <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4] leading-relaxed mb-3">{outline.conclusion}</p>
            <div className="bg-[#E0A943]/10 dark:bg-[#E0A943]/5 rounded-xl px-3 py-2 mb-2">
              <p className="text-[9px] font-bold text-[#9a6f1a] uppercase tracking-wide mb-0.5">Chamada à decisão</p>
              <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">{outline.call_to_action}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Aplicação prática</p>
              <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4]">{outline.practical_application}</p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => exportPDF(outline, theme, baseVerse)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#E0A943] text-[#1E1B2E] rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
        >
          <Download size={16} strokeWidth={2} />
          Exportar PDF
        </button>
        <button
          onClick={onNew}
          className="flex-1 py-3.5 border border-[#2E2860]/20 dark:border-white/15 text-[#2E2860] dark:text-[#B5B0D8] rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          Novo esboço
        </button>
      </div>
    </div>
  )
}

// ─── Paywall ──────────────────────────────────────────────────────────────────

function Paywall() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-10">
      <header className="flex items-center gap-3">
        <Link href="/" className="h-9 w-9 flex items-center justify-center rounded-full bg-[#2E2860]/10">
          <ArrowLeft size={18} strokeWidth={1.5} className="text-[#2E2860] dark:text-[#D8D5E4]" />
        </Link>
        <h1 className="text-lg font-bold text-[#1E1B2E] dark:text-[#F3F1FA]">Assistente de Sermão</h1>
      </header>

      <div className="bg-[#1E1B2E] rounded-[20px] p-6 text-center">
        <div className="h-14 w-14 rounded-[18px] bg-[#E0A943] flex items-center justify-center mx-auto mb-4">
          <WandSparkles size={28} strokeWidth={1.8} className="text-[#1E1B2E]" />
        </div>
        <p className="text-xs font-bold text-[#E0A943] uppercase tracking-widest mb-1">Plano Pregador</p>
        <h2 className="text-xl font-bold text-white mb-2">Monte seu sermão com IA</h2>
        <p className="text-sm text-[#A9A4C4]">Em minutos, gere um esboço completo, bíblico e pronto para pregar.</p>
      </div>

      <div className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-5">
        <h3 className="font-semibold text-[#1E1B2E] dark:text-[#F3F1FA] mb-4">O que está incluído</h3>
        <div className="flex flex-col gap-3">
          {[
            { icon: '✨', text: 'Esboços completos — introdução, 3 pontos e conclusão' },
            { icon: '✏️', text: 'Edite qualquer parte do esboço antes de exportar' },
            { icon: '📄', text: 'Exportar em PDF com as suas edições' },
            { icon: '🚫', text: 'Zero anúncios — nem AdMob nem anúncios internos' },
            { icon: '📚', text: 'Histórico de todos os esboços gerados' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-base shrink-0">{icon}</span>
              <p className="text-sm text-[#1E1B2E] dark:text-[#D8D5E4] flex-1">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-5">
        <div className="flex justify-around text-center gap-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#2E2860] dark:text-[#B5B0D8]">R$ 9,90</p>
            <p className="text-xs text-[#8A8797] mt-0.5">por mês</p>
          </div>
          <div className="w-px bg-[#1E1B2E]/10 dark:bg-white/10" />
          <div className="flex-1">
            <p className="text-2xl font-bold text-[#2E2860] dark:text-[#B5B0D8]">R$ 59,90</p>
            <p className="text-xs text-[#8A8797] mt-0.5">por ano · economize 49%</p>
          </div>
        </div>
      </div>

      <Link href="/settings">
        <div className="flex items-center justify-center gap-2 bg-[#E0A943] text-[#1E1B2E] rounded-2xl py-4 font-bold text-base active:scale-[0.98] transition-transform">
          <WandSparkles size={20} strokeWidth={2} />
          Assinar Plano Pregador
        </div>
      </Link>
      <p className="text-center text-xs text-[#8A8797] -mt-2">
        Assinantes não veem anúncios — nem AdMob nem anúncios internos.
      </p>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SermonAssistantPage() {
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [tab, setTab] = useState<'generate' | 'history'>('generate')
  const [form, setForm] = useState<FormValues>({ theme: '', base_verse: '', worship_type: 'domingo-manha', duration_min: 30 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outline, setOutline] = useState<SermonOutline | null>(null)
  const [savedOutlineId, setSavedOutlineId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null)

  useEffect(() => {
    setIsSubscriber(getIsSubscriber())
  }, [])

  useEffect(() => {
    if (tab === 'history' && isSubscriber) loadHistory()
  }, [tab, isSubscriber])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('sermon_outlines')
        .select('id, theme, base_verse, worship_type, duration_min, result_json, created_at')
        .eq('user_device_id', getDeviceId())
        .order('created_at', { ascending: false })
        .limit(20)
      setHistory((data as HistoryItem[]) ?? [])
    } catch { /* ignore */ } finally {
      setHistoryLoading(false)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.theme.trim()) return
    if (!WEB_URL) {
      setError('NEXT_PUBLIC_WEB_URL não configurada. Defina a variável de ambiente apontando para o painel web (ex.: https://seu-app.vercel.app).')
      return
    }
    setLoading(true)
    setError('')
    setOutline(null)
    setSavedOutlineId(null)
    try {
      const res = await fetch(`${WEB_URL}/api/sermon-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setError(json.error ?? 'Erro desconhecido.'); return }

      setOutline(json.outline)

      // Save and capture the record ID for later edits
      const supabase = createClient()
      const { data: inserted } = await supabase
        .from('sermon_outlines')
        .insert({
          user_device_id: getDeviceId(),
          theme: form.theme,
          base_verse: form.base_verse || null,
          worship_type: form.worship_type,
          duration_min: form.duration_min,
          result_json: json.outline,
        })
        .select('id')
        .single()
      if (inserted?.id) setSavedOutlineId(inserted.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro de rede.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOutlineUpdate(updated: SermonOutline) {
    setOutline(updated)
    // Persist edits to Supabase
    if (savedOutlineId) {
      const supabase = createClient()
      await supabase
        .from('sermon_outlines')
        .update({ result_json: updated })
        .eq('id', savedOutlineId)
        .catch(() => { /* best-effort */ })
    }
  }

  async function handleHistoryUpdate(updated: SermonOutline, id: string) {
    const supabase = createClient()
    await supabase
      .from('sermon_outlines')
      .update({ result_json: updated })
      .eq('id', id)
      .catch(() => { /* best-effort */ })
    setSelectedHistory((prev) => prev ? { ...prev, result_json: updated } : prev)
  }

  if (!isSubscriber) return <Paywall />

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <Link href="/" className="h-9 w-9 flex items-center justify-center rounded-full bg-[#2E2860]/10 dark:bg-white/10">
          <ArrowLeft size={18} strokeWidth={1.5} className="text-[#2E2860] dark:text-[#D8D5E4]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#1E1B2E] dark:text-[#F3F1FA]">Assistente de Sermão</h1>
          <p className="text-xs text-[#8A8797]">IA · Plano Pregador</p>
        </div>
      </header>

      <div className="mx-4 mb-4 flex gap-1 bg-[#2E2860]/5 dark:bg-white/5 rounded-xl p-1">
        {(['generate', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedHistory(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white dark:bg-[#2E2860] text-[#2E2860] dark:text-white shadow-sm' : 'text-[#8A8797]'
            }`}
          >
            {t === 'generate' ? '✨ Gerar' : '📚 Histórico'}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 flex flex-col gap-4">
        {tab === 'generate' && (
          outline ? (
            <OutlineView
              outline={outline}
              theme={form.theme}
              baseVerse={form.base_verse || null}
              onUpdate={handleOutlineUpdate}
              onNew={() => { setOutline(null); setSavedOutlineId(null) }}
            />
          ) : (
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm leading-relaxed">{error}</div>
              )}

              <div className="bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1.5 block">Tema do sermão *</label>
                  <input
                    value={form.theme}
                    onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                    placeholder="Ex.: A fé que supera obstáculos"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 dark:border-white/15 text-sm outline-none focus:border-[#2E2860] bg-[#FAF7F1] dark:bg-white/5 dark:text-[#F3F1FA]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1.5 block">
                    Versículo base <span className="font-normal">(opcional)</span>
                  </label>
                  <input
                    value={form.base_verse}
                    onChange={(e) => setForm((f) => ({ ...f, base_verse: e.target.value }))}
                    placeholder="Ex.: Hebreus 11:1"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 dark:border-white/15 text-sm outline-none focus:border-[#2E2860] bg-[#FAF7F1] dark:bg-white/5 dark:text-[#F3F1FA]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1.5 block">Tipo de culto</label>
                  <select
                    value={form.worship_type}
                    onChange={(e) => setForm((f) => ({ ...f, worship_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E1B2E]/15 dark:border-white/15 text-sm outline-none focus:border-[#2E2860] bg-[#FAF7F1] dark:bg-white/5 dark:text-[#F3F1FA]"
                  >
                    {WORSHIP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8A8797] mb-1.5 block">Duração</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, duration_min: o.value }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          form.duration_min === o.value
                            ? 'bg-[#2E2860] text-white border-[#2E2860]'
                            : 'border-[#1E1B2E]/15 dark:border-white/15 text-[#8A8797] bg-[#FAF7F1] dark:bg-white/5'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.theme.trim()}
                className="flex items-center justify-center gap-2 py-4 bg-[#E0A943] text-[#1E1B2E] rounded-2xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-[#1E1B2E]/30 border-t-[#1E1B2E] rounded-full animate-spin" />
                    Gerando esboço...
                  </>
                ) : (
                  <>
                    <WandSparkles size={20} strokeWidth={2} />
                    Gerar esboço
                  </>
                )}
              </button>
            </form>
          )
        )}

        {tab === 'history' && (
          selectedHistory ? (
            <div className="flex flex-col gap-4">
              <button onClick={() => setSelectedHistory(null)}
                className="flex items-center gap-1.5 text-sm text-[#2E2860] dark:text-[#B5B0D8] font-semibold">
                <ArrowLeft size={16} strokeWidth={2} /> Histórico
              </button>
              <OutlineView
                outline={selectedHistory.result_json}
                theme={selectedHistory.theme}
                baseVerse={selectedHistory.base_verse}
                onUpdate={(updated) => handleHistoryUpdate(updated, selectedHistory.id)}
                onNew={() => { setSelectedHistory(null); setTab('generate') }}
              />
            </div>
          ) : historyLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-[#2E2860]/5 animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm text-[#8A8797]">Nenhum esboço gerado ainda.</p>
              <button onClick={() => setTab('generate')}
                className="mt-4 px-5 py-2 bg-[#E0A943] text-[#1E1B2E] rounded-xl font-semibold text-sm">
                Gerar primeiro esboço
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <button key={item.id} onClick={() => setSelectedHistory(item)}
                  className="w-full text-left bg-white dark:bg-[#211E2D] rounded-2xl border border-[#1E1B2E]/8 dark:border-white/8 p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2E2860]/8 dark:bg-[#2E2860]/30 flex items-center justify-center">
                    <FileText size={18} strokeWidth={1.5} className="text-[#2E2860] dark:text-[#B5B0D8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1E1B2E] dark:text-[#F3F1FA] text-sm truncate">
                      {item.result_json?.title ?? item.theme}
                    </p>
                    <p className="text-xs text-[#8A8797] mt-0.5 truncate">{item.theme} · {item.duration_min} min</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-[#8A8797]">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    <ChevronRight size={16} strokeWidth={2} className="text-[#8A8797]" />
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

// ─── Agent Settings ────────────────────────────────────────────────────────────

export async function loadAgentSettings() {
  const supabase = await requireAdminClient()
  const { data } = await supabase
    .from('agent_settings')
    .select('doctrine_instructions, auto_publish, publish_time, model')
    .eq('id', 1)
    .maybeSingle()
  return data ?? {
    doctrine_instructions: '',
    auto_publish: false,
    publish_time: '06:00',
    model: 'claude-haiku-4-5-20251001',
  }
}

export async function saveAgentSettings(formData: FormData) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('agent_settings').upsert({
    id: 1,
    doctrine_instructions: ((formData.get('doctrine_instructions') as string) ?? '').trim(),
    auto_publish: formData.get('auto_publish') === 'true',
    publish_time: (formData.get('publish_time') as string) || '06:00',
    model: (formData.get('model') as string) || 'claude-haiku-4-5-20251001',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePath('/admin/agente')
  return {}
}

// ─── Themes CRUD ───────────────────────────────────────────────────────────────

export async function loadThemes() {
  const supabase = await requireAdminClient()
  const { data } = await supabase.from('devotional_themes').select('*').order('sort_order')
  return data ?? []
}

export async function createTheme(formData: FormData) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('devotional_themes').insert({
    day_label: ((formData.get('day_label') as string) ?? '').trim(),
    theme: ((formData.get('theme') as string) ?? '').trim(),
    sort_order: Number(formData.get('sort_order') ?? 0),
    active: true,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/agente')
  return {}
}

export async function updateTheme(id: string, formData: FormData) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('devotional_themes').update({
    day_label: ((formData.get('day_label') as string) ?? '').trim(),
    theme: ((formData.get('theme') as string) ?? '').trim(),
    sort_order: Number(formData.get('sort_order') ?? 0),
    active: formData.get('active') !== 'false',
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/agente')
  return {}
}

export async function deleteTheme(id: string) {
  const supabase = await requireAdminClient()
  await supabase.from('devotional_themes').delete().eq('id', id)
  revalidatePath('/admin/agente')
}

export async function toggleThemeActive(id: string, active: boolean) {
  const supabase = await requireAdminClient()
  await supabase.from('devotional_themes').update({ active }).eq('id', id)
  revalidatePath('/admin/agente')
}

// ─── Generate Devotional ───────────────────────────────────────────────────────

export async function generateDevotional() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'ANTHROPIC_API_KEY não configurada no ambiente (Vercel → Settings → Environment Variables).' }
  }

  const supabase = await requireAdminClient()

  // Load agent settings
  const settings = await loadAgentSettings()

  // Pick today's theme: try to match day_label to day-of-week, else use first active theme
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  const todayLabel = days[new Date().getDay()]
  const { data: themes } = await supabase
    .from('devotional_themes')
    .select('theme, day_label')
    .eq('active', true)
    .order('sort_order')

  const matched = themes?.find((t) => t.day_label.toLowerCase().trim() === todayLabel)
  const themeText = matched?.theme ?? themes?.[0]?.theme ?? 'Fé e confiança em Deus'

  // Build prompt
  const doctrineBlock = settings.doctrine_instructions?.trim()
    ? `DIRETRIZES DE ESTILO E ÊNFASE:\n${settings.doctrine_instructions}\n\n`
    : ''

  const prompt = `Você é um escritor de devocionais cristãos. Escreva um devocional curto e original em português do Brasil.

${doctrineBlock}TEMA DO DIA: ${themeText}

Requisitos:
- Escolha um versículo bíblico relevante ao tema (da Bíblia ARC ou NVI)
- Reflexão original de 150-250 palavras, tom de ensino e encorajamento
- Inclua uma breve aplicação prática no final
- Conteúdo 100% original, fundamentado na Bíblia
- NÃO copie obras de terceiros nem mencione nomes de autores, pregadores ou ministérios
- Escreva como se você mesmo fosse o autor — voz pastoral direta

Responda APENAS com JSON válido (sem blocos de código markdown):
{
  "verse_ref": "Livro Capítulo:Versículo (ARC)",
  "verse_text": "Texto completo do versículo",
  "reflection": "Reflexão e aplicação (150-250 palavras)"
}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model = settings.model || 'claude-haiku-4-5-20251001'

    const response = await client.messages.create({
      model,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const block = response.content[0]
    if (block.type !== 'text') return { error: 'Resposta inesperada da API.' }

    // Strip markdown code fences if present
    const raw = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    let parsed: { verse_ref: string; verse_text: string; reflection: string }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { error: `Não foi possível interpretar a resposta da IA: ${raw.slice(0, 200)}` }
    }

    if (!parsed.verse_ref || !parsed.verse_text || !parsed.reflection) {
      return { error: 'Resposta incompleta — campos obrigatórios ausentes.' }
    }

    const dateStr = new Date().toISOString().split('T')[0]
    const { error: dbError } = await supabase.from('ai_devotionals').insert({
      date: dateStr,
      verse_ref: parsed.verse_ref,
      verse_text: parsed.verse_text,
      reflection: parsed.reflection,
      theme: themeText,
      status: 'pending',
    })
    if (dbError) return { error: dbError.message }

    revalidatePath('/admin/agente')
    return { success: true, theme: themeText }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { error: `Erro ao chamar a API Anthropic: ${msg}` }
  }
}

// ─── Approval Queue ────────────────────────────────────────────────────────────

export async function loadPendingDevotionals() {
  const supabase = await requireAdminClient()
  const { data } = await supabase
    .from('ai_devotionals')
    .select('id, date, verse_ref, verse_text, reflection, theme, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updatePendingDevotional(id: string, formData: FormData) {
  const supabase = await requireAdminClient()
  const { error } = await supabase.from('ai_devotionals').update({
    verse_ref: ((formData.get('verse_ref') as string) ?? '').trim(),
    verse_text: ((formData.get('verse_text') as string) ?? '').trim(),
    reflection: ((formData.get('reflection') as string) ?? '').trim(),
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/agente')
  return {}
}

export async function approveDevotional(id: string) {
  const supabase = await requireAdminClient()

  const { data, error: fetchErr } = await supabase
    .from('ai_devotionals')
    .select('date, verse_ref, verse_text, reflection')
    .eq('id', id)
    .single()
  if (fetchErr || !data) return { error: 'Devocional não encontrado.' }

  // Upsert into daily_devotionals (by date — update if exists, insert otherwise)
  const { data: existing } = await supabase
    .from('daily_devotionals')
    .select('id')
    .eq('date', data.date)
    .maybeSingle()

  const payload = {
    date: data.date,
    verse_ref: data.verse_ref,
    verse_text: data.verse_text,
    reflection: data.reflection,
  }

  const { error: writeErr } = existing
    ? await supabase.from('daily_devotionals').update(payload).eq('id', existing.id)
    : await supabase.from('daily_devotionals').insert(payload)

  if (writeErr) return { error: writeErr.message }

  await supabase.from('ai_devotionals').update({ status: 'approved' }).eq('id', id)
  revalidatePath('/admin/agente')
  revalidatePath('/admin/devocional')
  return {}
}

export async function discardDevotional(id: string) {
  const supabase = await requireAdminClient()
  await supabase.from('ai_devotionals').update({ status: 'discarded' }).eq('id', id)
  revalidatePath('/admin/agente')
}

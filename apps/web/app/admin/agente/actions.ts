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
  const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const { data: themes } = await supabase
    .from('devotional_themes')
    .select('theme, day_label')
    .eq('active', true)
    .order('sort_order')

  const matched = themes?.find((t) => normalize(t.day_label) === todayLabel)
  const themeText = matched?.theme ?? themes?.[0]?.theme ?? 'Fé e confiança em Deus'
  console.log(`[agente] dia hoje: ${todayLabel} → tema: "${themeText}" (match: ${!!matched})`)

  // Build prompt
  const doctrineBlock = settings.doctrine_instructions?.trim()
    ? `DIRETRIZES DE ESTILO E ÊNFASE:\n${settings.doctrine_instructions}\n\n`
    : ''

  const prompt = `Você é um escritor de devocionais cristãos. Escreva um devocional CURTO e original em português do Brasil.

${doctrineBlock}TEMA DO DIA: ${themeText}

Requisitos:
- Escolha um versículo bíblico relevante ao tema (da Bíblia ARC ou NVI)
- Escreva UMA reflexão de 3-4 frases sobre o versículo
- Finalize com UMA frase de aplicação prática direta
- Total máximo: 130 palavras no campo "reflection"
- Conteúdo 100% original, fundamentado na Bíblia
- NÃO copie obras de terceiros nem mencione nomes de autores, pregadores ou ministérios
- Voz pastoral direta, tom de encorajamento, leitura rápida no celular

Responda APENAS com JSON válido (sem blocos de código markdown):
{
  "verse_ref": "Livro Capítulo:Versículo (ARC)",
  "verse_text": "Texto completo do versículo",
  "reflection": "Reflexão (3-4 frases) + 1 frase de aplicação prática — máximo 130 palavras"
}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model = settings.model || 'claude-haiku-4-5-20251001'

    const response = await client.messages.create({
      model,
      max_tokens: 600,
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
  const update: Record<string, string> = {
    verse_ref: ((formData.get('verse_ref') as string) ?? '').trim(),
    verse_text: ((formData.get('verse_text') as string) ?? '').trim(),
    reflection: ((formData.get('reflection') as string) ?? '').trim(),
  }
  const dateVal = (formData.get('date') as string)?.trim()
  if (dateVal) update.date = dateVal
  const { error } = await supabase.from('ai_devotionals').update(update).eq('id', id)
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

// ─── Generate Full Week ────────────────────────────────────────────────────────

export async function generateWeekDevotionals(startDate: string): Promise<{
  generated: number
  errors: string[]
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { generated: 0, errors: ['ANTHROPIC_API_KEY não configurada.'] }
  }

  const supabase = await requireAdminClient()
  const settings = await loadAgentSettings()

  const { data: themes } = await supabase
    .from('devotional_themes')
    .select('theme, day_label')
    .eq('active', true)
    .order('sort_order')

  // Canonical day labels (no accents, lowercase) — must match devotional_themes.day_label after normalization
  const dayLabels = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

  // Normalize: remove accents, lowercase, trim
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

  console.log('[agente] themes in DB:', JSON.stringify(themes?.map((t) => ({ day_label: t.day_label, normalized: normalize(t.day_label), theme: t.theme }))))

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const model = settings.model || 'claude-haiku-4-5-20251001'

  const doctrineBlock = settings.doctrine_instructions?.trim()
    ? `DIRETRIZES DE ESTILO E ÊNFASE:\n${settings.doctrine_instructions}\n\n`
    : ''

  const base = new Date(startDate + 'T12:00:00')
  const errors: string[] = []
  let generated = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = dayLabels[d.getDay()]

    const matched = themes?.find((t) => normalize(t.day_label) === dayLabel)
    const themeText = matched?.theme ?? ''
    if (!matched) {
      console.log(`[agente] tema não encontrado para dia: ${dayLabel} (${dateStr}) — temas disponíveis: ${themes?.map((t) => normalize(t.day_label)).join(', ')}`)
    } else {
      console.log(`[agente] dia ${dayLabel} (${dateStr}) → tema: "${themeText}"`)
    }

    const prompt = `Você é um escritor de devocionais cristãos. Escreva um devocional CURTO e original em português do Brasil.

${doctrineBlock}TEMA DO DIA: ${themeText}

Requisitos:
- Escolha um versículo bíblico relevante ao tema (da Bíblia ARC ou NVI)
- Escreva UMA reflexão de 3-4 frases sobre o versículo
- Finalize com UMA frase de aplicação prática direta
- Total máximo: 130 palavras no campo "reflection"
- Conteúdo 100% original, fundamentado na Bíblia
- NÃO copie obras de terceiros nem mencione nomes de autores, pregadores ou ministérios
- Voz pastoral direta, tom de encorajamento, leitura rápida no celular

Responda APENAS com JSON válido (sem blocos de código markdown):
{
  "verse_ref": "Livro Capítulo:Versículo (ARC)",
  "verse_text": "Texto completo do versículo",
  "reflection": "Reflexão (3-4 frases) + 1 frase de aplicação prática — máximo 130 palavras"
}`

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })
      const block = response.content[0]
      if (block.type !== 'text') { errors.push(`Dia ${dateStr}: resposta inesperada.`); continue }

      const raw = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      let parsed: { verse_ref: string; verse_text: string; reflection: string }
      try { parsed = JSON.parse(raw) } catch { errors.push(`Dia ${dateStr}: JSON inválido.`); continue }

      if (!parsed.verse_ref || !parsed.verse_text || !parsed.reflection) {
        errors.push(`Dia ${dateStr}: campos incompletos.`)
        continue
      }

      const { error: dbError } = await supabase.from('ai_devotionals').insert({
        date: dateStr,
        verse_ref: parsed.verse_ref,
        verse_text: parsed.verse_text,
        reflection: parsed.reflection,
        theme: themeText,
        status: 'pending',
      })
      if (dbError) { errors.push(`Dia ${dateStr}: ${dbError.message}`); continue }
      generated++
    } catch (e) {
      errors.push(`Dia ${dateStr}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  revalidatePath('/admin/agente')
  return { generated, errors }
}

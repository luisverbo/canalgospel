import { NextRequest, NextResponse } from 'next/server'
import { requireAdminClient } from '@/lib/supabase/admin-guard'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY não configurada no servidor.' },
      { status: 500, headers: CORS }
    )
  }

  let body: { theme?: string; base_verse?: string; worship_type?: string; duration_min?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400, headers: CORS })
  }

  if (!body.theme?.trim()) {
    return NextResponse.json({ error: 'Campo "theme" obrigatório.' }, { status: 400, headers: CORS })
  }

  let doctrineInstructions = ''
  let model = 'claude-haiku-4-5-20251001'
  try {
    const supabase = await requireAdminClient()
    const { data } = await supabase
      .from('agent_settings')
      .select('doctrine_instructions, model')
      .eq('id', 1)
      .maybeSingle()
    if (data) {
      doctrineInstructions = data.doctrine_instructions ?? ''
      model = data.model || model
    }
  } catch { /* use defaults */ }

  const worshipLabels: Record<string, string> = {
    'domingo-manha': 'Culto de domingo de manhã',
    'jovens': 'Culto de jovens',
    'evangelismo': 'Culto de evangelismo',
    'funeral': 'Culto fúnebre',
    'celula': 'Reunião de célula',
    'estudo-biblico': 'Estudo bíblico',
  }

  const worshipLabel = worshipLabels[body.worship_type ?? ''] ?? body.worship_type ?? 'Culto geral'
  const durationLabel = body.duration_min ? `${body.duration_min} minutos` : '30 minutos'
  const doctrineBlock = doctrineInstructions.trim()
    ? `DIRETRIZES DE DOUTRINA E ESTILO:\n${doctrineInstructions}\n\n`
    : ''

  const systemPrompt = `Você é um assistente de pregação cristã experiente. Você ajuda pastores e pregadores a prepararem sermões bem estruturados, bíblicos e edificantes.
${doctrineBlock}Regras absolutas:
- Conteúdo 100% original, baseado exclusivamente na Bíblia
- NÃO copie obras de terceiros nem mencione autores, pregadores ou ministérios no texto gerado
- Escreva em português do Brasil, tom pastoral, encorajador e de ensino`

  const userPrompt = `Crie um esboço completo de sermão com os seguintes parâmetros:

Tema: ${body.theme}
Versículo base: ${body.base_verse?.trim() || '(escolha o versículo mais adequado ao tema)'}
Tipo de culto: ${worshipLabel}
Duração aproximada: ${durationLabel}

Responda APENAS com JSON válido (sem bloco de código markdown), no formato exato:
{
  "title": "Título criativo do sermão",
  "introduction": "Parágrafo de introdução com gancho inicial que prenda a atenção (2-3 frases)",
  "points": [
    {
      "title": "Título do Ponto 1",
      "content": "Desenvolvimento do ponto — conexão com o tema e o versículo (2-3 frases)",
      "verses": ["Livro Cap:Ver (ARC)", "Livro Cap:Ver (ARC)"],
      "illustration": "Sugestão de ilustração, história ou exemplo prático para este ponto"
    },
    {
      "title": "Título do Ponto 2",
      "content": "Desenvolvimento do ponto (2-3 frases)",
      "verses": ["Livro Cap:Ver (ARC)"],
      "illustration": "Sugestão de ilustração para este ponto"
    },
    {
      "title": "Título do Ponto 3",
      "content": "Desenvolvimento do ponto (2-3 frases)",
      "verses": ["Livro Cap:Ver (ARC)"],
      "illustration": "Sugestão de ilustração para este ponto"
    }
  ],
  "conclusion": "Parágrafo de conclusão que amarre os três pontos (2-3 frases)",
  "call_to_action": "Chamada à decisão ou resposta da congregação (1-2 frases)",
  "practical_application": "Aplicação prática para a semana — algo concreto que a congregação pode fazer (1-2 frases)"
}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = response.content[0]
    if (block.type !== 'text') {
      return NextResponse.json({ error: 'Resposta inesperada da IA.' }, { status: 500, headers: CORS })
    }

    const raw = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    let outline
    try {
      outline = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: `JSON inválido na resposta: ${raw.slice(0, 200)}` },
        { status: 500, headers: CORS }
      )
    }

    return NextResponse.json({ outline }, { headers: CORS })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `Erro ao chamar a IA: ${msg}` }, { status: 500, headers: CORS })
  }
}

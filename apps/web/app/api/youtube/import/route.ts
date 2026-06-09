import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

interface Category { id: string; name: string; slug: string; kind: string }

async function categorizeWithClaude(
  title: string,
  description: string,
  categories: Category[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || categories.length === 0) return null

  const list = categories.map((c) => `${c.slug}: ${c.name}`).join('\n')
  const prompt = `Você é um assistente que categoriza pregações evangélicas brasileiras.

Título do vídeo: "${title}"
Descrição: "${description.slice(0, 400)}"

Categorias disponíveis:
${list}

Responda APENAS com o slug da categoria mais adequada. Se nenhuma categoria se encaixar bem, responda "null".`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const slug = data.content?.[0]?.text?.trim()
    if (!slug || slug === 'null') return null
    return categories.find((c) => c.slug === slug)?.id ?? null
  } catch {
    return null
  }
}

async function getOrCreateCanalGospelPreacher(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>): Promise<string | null> {
  // Look for existing Canal Gospel preacher
  const { data: existing } = await supabase
    .from('preachers')
    .select('id')
    .eq('slug', 'canal-gospel')
    .maybeSingle()

  if (existing) return existing.id

  // Try to find an admin profile to attach to
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  if (!adminProfile) return null

  const { data: created } = await supabase
    .from('preachers')
    .insert({
      id: adminProfile.id,
      display_name: 'Canal Gospel',
      slug: 'canal-gospel',
      bio: 'Conteúdo curado pelo Canal Gospel',
      status: 'active',
    })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { channelId, preacherId } = body as { channelId: string; preacherId?: string }

  if (!channelId?.trim()) {
    return NextResponse.json({ error: 'channelId é obrigatório' }, { status: 400 })
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY
  if (!youtubeApiKey) {
    return NextResponse.json(
      { error: 'Configure YOUTUBE_API_KEY nas variáveis de ambiente da Vercel' },
      { status: 500 }
    )
  }

  // Resolve @handle → channelId
  let resolvedChannelId = channelId.trim()
  if (!resolvedChannelId.startsWith('UC')) {
    const q = encodeURIComponent(resolvedChannelId.replace('@', ''))
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=channel&maxResults=1&key=${youtubeApiKey}`
    )
    if (res.ok) {
      const d = await res.json()
      resolvedChannelId = d.items?.[0]?.snippet?.channelId ?? resolvedChannelId
    }
  }

  // Fetch up to 50 videos
  const ytRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${resolvedChannelId}&type=video&maxResults=50&order=date&key=${youtubeApiKey}`
  )
  if (!ytRes.ok) {
    const err = await ytRes.text()
    return NextResponse.json({ error: `YouTube API: ${err}` }, { status: 500 })
  }
  const ytData = await ytRes.json()
  const items = ytData.items ?? []

  const supabase = await createAdminSupabaseClient()
  const { data: categories } = await supabase.from('categories').select('id, name, slug, kind')

  // Determine preacher: use provided, or fall back to Canal Gospel profile
  const effectivePreacherId = preacherId || await getOrCreateCanalGospelPreacher(supabase)

  const results: Array<{
    videoId: string
    title: string
    youtube_url: string
    category_id: string | null
    categorized: boolean
    slug: string
    body: string
  }> = []

  for (const item of items) {
    const videoId = item.id?.videoId
    if (!videoId) continue
    const rawTitle = item.snippet?.title ?? ''
    const rawDescription = item.snippet?.description ?? ''
    const title = decodeHtmlEntities(rawTitle)
    const description = decodeHtmlEntities(rawDescription)
    const category_id = await categorizeWithClaude(title, description, categories ?? [])
    const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`
    results.push({
      videoId,
      title,
      youtube_url: `https://youtube.com/watch?v=${videoId}`,
      category_id,
      categorized: !!category_id,
      slug,
      body: description || ' ',
    })
  }

  const errors: string[] = []
  let imported = 0

  for (const r of results) {
    const { error } = await supabase.from('studies').insert({
      title: r.title,
      slug: r.slug,
      youtube_url: r.youtube_url,
      body: r.body,
      preacher_id: effectivePreacherId,
      category_id: r.category_id,
      status: 'pending',
    })
    if (error) errors.push(`"${r.title}": ${error.message}`)
    else imported++
  }

  const uncategorized = results.filter((r) => !r.categorized && !errors.find((e) => e.includes(r.title))).length

  return NextResponse.json({ imported, uncategorized, errors })
}

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelId: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  kind: string
}

async function categorizWithClaude(
  title: string,
  description: string,
  categories: Category[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const categoriesList = categories
    .map((c) => `- ${c.slug}: ${c.name} (${c.kind})`)
    .join('\n')

  const prompt = `Given this YouTube video title and description, return the SINGLE best matching category slug from the list below. Return ONLY the slug, nothing else.

Title: ${title}
Description: ${description.slice(0, 500)}

Categories:
${categoriesList}

Return only the slug of the best matching category.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const slug = data.content?.[0]?.text?.trim()
    const matched = categories.find((c) => c.slug === slug)
    return matched ? matched.slug : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { channelId, preacherId } = body as {
    channelId: string
    preacherId: string
  }

  if (!channelId || !preacherId) {
    return NextResponse.json({ error: 'channelId and preacherId are required' }, { status: 400 })
  }

  const youtubeApiKey = process.env.YOUTUBE_API_KEY
  if (!youtubeApiKey) {
    return NextResponse.json(
      { error: 'Configure YOUTUBE_API_KEY nas variáveis de ambiente da Vercel' },
      { status: 500 }
    )
  }

  // Resolve @handle to channelId if needed
  let resolvedChannelId = channelId
  if (channelId.startsWith('@') || !channelId.startsWith('UC')) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelId)}&type=channel&maxResults=1&key=${youtubeApiKey}`
    const searchRes = await fetch(searchUrl)
    if (searchRes.ok) {
      const searchData = await searchRes.json()
      const foundId = searchData.items?.[0]?.snippet?.channelId
      if (foundId) resolvedChannelId = foundId
    }
  }

  const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${resolvedChannelId}&type=video&maxResults=50&key=${youtubeApiKey}`
  const ytRes = await fetch(ytUrl)
  if (!ytRes.ok) {
    const ytErr = await ytRes.text()
    return NextResponse.json({ error: `YouTube API error: ${ytErr}` }, { status: 500 })
  }
  const ytData = await ytRes.json()
  const items: YouTubeSearchItem[] = ytData.items ?? []

  const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, kind')

  const errors: string[] = []
  let imported = 0

  for (const item of items) {
    const videoId = item.id?.videoId
    if (!videoId) continue

    const title = item.snippet.title
    const description = item.snippet.description

    try {
      let categoryId: string | null = null

      if (categories && categories.length > 0) {
        const matchedSlug = await categorizWithClaude(title, description, categories)
        if (matchedSlug) {
          const cat = categories.find((c) => c.slug === matchedSlug)
          categoryId = cat?.id ?? null
        }
      }

      const slug = `${slugify(title)}-${randomSuffix()}`

      const study: Record<string, unknown> = {
        title,
        slug,
        youtube_url: `https://youtube.com/watch?v=${videoId}`,
        body: description || '',
        preacher_id: preacherId,
        status: 'pending',
      }
      if (categoryId) study.category_id = categoryId

      const { error: insertError } = await supabase.from('studies').insert(study)
      if (insertError) {
        errors.push(`"${title}": ${insertError.message}`)
      } else {
        imported++
      }
    } catch (err) {
      errors.push(`"${title}": ${String(err)}`)
    }
  }

  return NextResponse.json({ imported, errors })
}

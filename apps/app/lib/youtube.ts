export function extractYouTubeId(url: string | null | undefined): string {
  if (!url) return ''
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  )
  return match?.[1] ?? ''
}

export function youTubeEmbedUrl(url: string | null | undefined): string {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

export function youTubeThumb(url: string | null | undefined): string {
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ''
}

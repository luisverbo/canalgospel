// Tipos explícitos para resultados de queries com joins — evita 'never' da inferência automática

export interface Preacher {
  display_name: string
  slug: string
  photo_url: string | null
}

export interface PreacherFull extends Preacher {
  bio: string | null
  church: string | null
  city: string | null
  instagram: string | null
  whatsapp: string | null
  pix_key: string | null
  status: string
}

export interface Category {
  name: string
  slug: string
}

export interface StudyCard {
  id: string
  title: string
  slug: string
  body: string | null
  youtube_url: string | null
  audio_url: string | null
  cover_url: string | null
  content_type: string | null
  read_time_min: number | null
  published_at: string | null
  preachers: Preacher | null
  categories: Category | null
}

export interface StudyFull extends StudyCard {
  preacher_id: string | null
  category_id: string | null
  status: string
  created_at: string
}

export interface Devotional {
  id: string
  date: string
  verse_ref: string
  verse_text: string
  reflection: string | null
}

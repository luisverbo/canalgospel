'use server'

import { requireAdminClient } from '@/lib/supabase/admin-guard'
import { revalidatePath } from 'next/cache'

const KEYS = [
  'partnership_title',
  'partnership_body',
  'partnership_whatsapp',
  'partnership_whatsapp_message',
  'partnership_email',
] as const

type SettingKey = (typeof KEYS)[number]

export async function savePartnershipSettings(formData: FormData) {
  const supabase = await requireAdminClient()

  const rows: { key: string; value: string }[] = KEYS.map((k) => ({
    key: k,
    value: ((formData.get(k) as string) ?? '').trim(),
  }))

  const { error } = await supabase
    .from('app_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) return { error: error.message }
  revalidatePath('/admin/parceria')
  return {}
}

export async function loadPartnershipSettings(): Promise<Record<SettingKey, string>> {
  const supabase = await requireAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', KEYS)

  const defaults: Record<SettingKey, string> = {
    partnership_title: 'Seja um Parceiro de Conteúdo',
    partnership_body:
      'Publique seus estudos e devocionais no Canal Gospel, alcance milhares de leitores e receba apoio direto da comunidade via PIX.',
    partnership_whatsapp: '',
    partnership_whatsapp_message:
      'Olá! Tenho interesse em ser parceiro de conteúdo do Canal Gospel.',
    partnership_email: '',
  }

  if (!data) return defaults
  const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value])) as Partial<Record<SettingKey, string>>
  return { ...defaults, ...map }
}

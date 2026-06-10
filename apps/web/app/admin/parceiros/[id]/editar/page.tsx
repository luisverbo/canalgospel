import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EditPartnerForm } from './EditPartnerForm'

export default async function EditarParceiroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createAdminSupabaseClient()

  const { data: preacher } = await supabase
    .from('preachers')
    .select('id, display_name, slug, bio, church, city, photo_url, instagram, whatsapp, pix_key, status, auto_publish, profiles(email)')
    .eq('id', id)
    .maybeSingle()

  if (!preacher) notFound()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/parceiros" className="text-sm text-[#8A8797] hover:text-[#1E1B2E] transition-colors">
          ← Voltar para Parceiros
        </Link>
        <h1 className="text-2xl font-bold text-[#2E2860] mt-2">Editar Parceiro</h1>
        <p className="text-[#8A8797] mt-1">{(preacher.profiles as { email: string } | null)?.email}</p>
      </div>
      <EditPartnerForm preacher={preacher} />
    </div>
  )
}

import { createClient } from '@canal-gospel/supabase'
import { StudyCard } from '@/components/StudyCard'
import { Badge } from '@canal-gospel/ui'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PixButton } from './PixButton'

export default async function PreacherProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()

  const [{ data: preacher }, { data: studies }] = await Promise.all([
    supabase
      .from('preachers')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'approved')
      .single(),
    supabase
      .from('studies')
      .select('*, categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20),
  ])

  if (!preacher) notFound()

  const preacherStudies = studies?.filter((s) => s.preacher_id === preacher.id)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-[#2E2860] px-5 pt-10 pb-8 text-white">
        <Link href="/" className="text-white/70 text-sm mb-4 block">
          ← Voltar
        </Link>
        <div className="flex items-center gap-4">
          {preacher.photo_url ? (
            <img
              src={preacher.photo_url}
              alt={preacher.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-[#E0A943]"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-[#E0A943]/30 flex items-center justify-center text-3xl font-bold text-[#E0A943]">
              {preacher.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{preacher.name}</h1>
            {preacher.church && (
              <p className="text-white/70 text-sm">{preacher.church}</p>
            )}
            {preacher.city && preacher.state && (
              <p className="text-white/50 text-xs">
                {preacher.city}, {preacher.state}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-6 mt-5">
          <div className="text-center">
            <p className="text-xl font-bold text-[#E0A943]">{preacher.total_studies}</p>
            <p className="text-xs text-white/60">Estudos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#E0A943]">
              {preacher.total_views.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-white/60">Leituras</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">
        {preacher.bio && (
          <section>
            <h2 className="text-base font-semibold text-[#1E1B2E] mb-2">Sobre</h2>
            <p className="text-sm text-[#8A8797] leading-relaxed">{preacher.bio}</p>
          </section>
        )}

        <div className="flex gap-3">
          {preacher.instagram_handle && (
            <a
              href={`https://instagram.com/${preacher.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E2860]/10 text-[#2E2860] text-sm font-medium"
            >
              📸 Instagram
            </a>
          )}
          {preacher.whatsapp && (
            <a
              href={`https://wa.me/${preacher.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        {preacher.pix_key && (
          <PixButton pixKey={preacher.pix_key} preacherName={preacher.name} />
        )}

        <section>
          <h2 className="text-base font-semibold text-[#1E1B2E] mb-3">
            Estudos ({preacherStudies?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-3">
            {preacherStudies?.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                preacher={{ name: preacher.name, slug: preacher.slug, photo_url: preacher.photo_url }}
                category={(study.categories as { name: string; slug: string }) ?? null}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

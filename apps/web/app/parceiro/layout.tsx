import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '../admin/LogoutButton'

const navItems = [
  { href: '/parceiro', label: 'Dashboard', icon: '📊' },
  { href: '/parceiro/estudos', label: 'Meus Estudos', icon: '📖' },
  { href: '/parceiro/perfil', label: 'Meu Perfil', icon: '👤' },
]

export default async function ParceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: preacher } = await supabase
    .from('preachers')
    .select('display_name, photo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#2E2860] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {preacher?.photo_url ? (
              <img src={preacher.photo_url} alt={preacher.display_name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#E0A943]/30 flex items-center justify-center text-sm font-bold text-[#E0A943]">
                {preacher?.display_name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{preacher?.display_name ?? 'Parceiro'}</p>
              <p className="text-xs text-white/50">Painel Parceiro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate mb-3">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 bg-[#FAF7F1] overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

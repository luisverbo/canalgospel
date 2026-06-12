import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from './LogoutButton'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/parceiros', label: 'Parceiros', icon: '🤝' },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: '📝' },
  { href: '/admin/devocional', label: 'Devocional', icon: '📿' },
  { href: '/admin/categorias', label: 'Categorias', icon: '🏷' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/admin/youtube-import', label: 'Importar YouTube', icon: '▶️' },
  { href: '/admin/publicidade', label: 'Publicidade', icon: '📢' },
  { href: '/admin/agente', label: 'Agente IA', icon: '✨' },
  { href: '/admin/parceria', label: 'Parceria', icon: '🤝' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E2860] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="text-xl font-bold">Canal Gospel</span>
          <p className="text-xs text-white/50 mt-0.5">Painel Admin</p>
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

      {/* Main */}
      <main className="flex-1 bg-[#FAF7F1] overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

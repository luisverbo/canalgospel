'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Search, Bookmark, Play } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Início', Icon: Home },
  { href: '/studies', label: 'Estudos', Icon: BookOpen },
  { href: '/search', label: 'Buscar', Icon: Search },
  { href: '/saved', label: 'Salvos', Icon: Bookmark },
  { href: '/videos', label: 'Vídeos', Icon: Play },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1727] border-t border-[#1E1B2E]/8 dark:border-white/8 safe-area-bottom">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                isActive
                  ? 'text-[#2E2860] dark:text-[#E0A943]'
                  : 'text-[#8A8797] dark:text-white/40'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

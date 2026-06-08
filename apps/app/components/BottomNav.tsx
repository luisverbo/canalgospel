'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Início', icon: '🏠' },
  { href: '/studies', label: 'Estudos', icon: '📖' },
  { href: '/search', label: 'Buscar', icon: '🔍' },
  { href: '/saved', label: 'Salvos', icon: '🔖' },
  { href: '/videos', label: 'Vídeos', icon: '▶' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#1E1B2E]/10 safe-area-bottom z-50">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                isActive ? 'text-[#2E2860]' : 'text-[#8A8797]'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-[#2E2860]' : 'text-[#8A8797]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 bg-[#2E2860] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

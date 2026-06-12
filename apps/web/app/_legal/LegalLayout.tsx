import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalLayout({ title, lastUpdated, children }: {
  title: string
  lastUpdated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1E1B2E]/8 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#2E2860] flex items-center justify-center shrink-0">
            <span className="text-[#E0A943] font-bold text-xs">CG</span>
          </div>
          <span className="font-bold text-[#2E2860]">Canal Gospel</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10">
        <h1 className="text-2xl font-bold text-[#1E1B2E] mb-1">{title}</h1>
        <p className="text-sm text-[#8A8797] mb-8">{lastUpdated}</p>
        <div className="prose prose-sm max-w-none text-[#1E1B2E]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E1B2E]/8 py-6">
        <div className="max-w-2xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#8A8797]">
          <span>© {new Date().getFullYear()} Canal Gospel</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-[#2E2860] transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-[#2E2860] transition-colors">Termos</Link>
            <a href="https://canalgospel.vercel.app" className="hover:text-[#2E2860] transition-colors">← Voltar ao app</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* Prose helpers — used in the page content */
export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-bold text-[#1E1B2E] mt-8 mb-3">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[#3D3A4E] leading-relaxed mb-4">{children}</p>
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 mb-4 space-y-1 text-sm text-[#3D3A4E] leading-relaxed">{children}</ul>
}

export function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}

export function Bold({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-[#1E1B2E]">{children}</strong>
}

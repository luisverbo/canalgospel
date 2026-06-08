import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Canal Gospel — Painel',
  description: 'Painel administrativo e de parceiros do Canal Gospel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#FAF7F1] text-[#1E1B2E] font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}

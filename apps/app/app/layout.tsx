import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Canal Gospel',
  description: 'Estudos bíblicos e devocionais diários',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#FAF7F1] text-[#1E1B2E] font-sans min-h-[100dvh]">
        <main className="min-h-[100dvh] pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}

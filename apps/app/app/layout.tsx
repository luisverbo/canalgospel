import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/BottomNav'
import { AdBanner } from '@/components/AdBanner'
import { ThemeProvider } from '@/lib/theme'

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
      <body className="bg-[#FAF7F1] dark:bg-[#17141F] text-[#1E1B2E] dark:text-[#D8D5E4] font-sans min-h-[100dvh] transition-colors">
        <ThemeProvider>
          <main className="min-h-[100dvh] pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
            {children}
          </main>
          <AdBanner />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}

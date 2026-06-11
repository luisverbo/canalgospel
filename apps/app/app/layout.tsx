import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/BottomNav'
import { AdBanner } from '@/components/AdBanner'
import { ThemeProvider } from '@/lib/theme'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
        <ErrorBoundary>
          <ThemeProvider>
            {/*
              Layout stack (bottom up, all fixed):
                0px  ← screen bottom
                ~56px  BottomNav (z-50)
                ~56+56=112px  AdBanner slot (z-40)
              Main content padded to clear both.
            */}
            <main className="min-h-[100dvh] pb-[calc(7rem+env(safe-area-inset-bottom,0px))]">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <AdBanner />
            <BottomNav />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

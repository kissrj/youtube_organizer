import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import { AuthHeader } from '@/components/AuthHeader'
import { IconThemeProvider } from '@/providers/IconThemeProvider'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { DndProviderComponent } from '@/components/dnd/DndProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Organizer',
  description: 'Organize your YouTube videos with notebooks, tags and AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <SessionProvider>
            <IconThemeProvider>
              <ToastProvider>
                <DndProviderComponent>
                  <div className="min-h-screen">
                    <AuthHeader />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      {children}
                    </main>
                  </div>
                </DndProviderComponent>
              </ToastProvider>
            </IconThemeProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

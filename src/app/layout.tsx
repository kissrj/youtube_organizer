import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import { AuthHeader } from '@/components/AuthHeader'
import { IconThemeProvider } from '@/providers/IconThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Organizer',
  description: 'Organize suas playlists do YouTube por categorias e tags',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <IconThemeProvider>
            <div className="min-h-screen bg-white">
              <AuthHeader />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </IconThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Film, ListVideo, FolderTree, Notebook, Tag, Wand2, Youtube } from 'lucide-react'
import YouTubeTest from '@/components/YouTubeTest'

interface YouTubeStatus {
  connected: boolean
  youtubeUserId?: string
  youtubeUsername?: string
  connectedAt?: string
  tokenValid?: boolean
  tokenExpiry?: string
  scope?: string
}

export default function Dashboard() {
  const [youtubeStatus, setYoutubeStatus] = useState<YouTubeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [youtubeError, setYoutubeError] = useState<string | null>(null)

  useEffect(() => {
    checkYouTubeStatus()
    checkForYouTubeErrors()
  }, [])

  const checkForYouTubeErrors = () => {
    // Verificar se há parâmetros de erro na URL
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const details = urlParams.get('details')

    if (error) {
      let errorMessage = ''

      switch (error) {
        case 'youtube_callback_error':
          errorMessage = 'Erro geral no processo de autenticação do YouTube.'
          break
        case 'youtube_invalid_grant':
          errorMessage = 'Código de autorização inválido ou expirado. Tente conectar novamente.'
          break
        case 'youtube_redirect_uri_mismatch':
          errorMessage = 'URI de redirecionamento não corresponde ao configurado no Google Cloud Console.'
          break
        case 'youtube_access_denied':
          errorMessage = 'Acesso negado pelo usuário. Você precisa autorizar o acesso para continuar.'
          break
        case 'youtube_auth_failed':
          errorMessage = 'Falha na autorização inicial do YouTube.'
          break
        case 'youtube_no_code':
          errorMessage = 'Código de autorização não foi recebido do Google.'
          break
        case 'youtube_no_state':
          errorMessage = 'Parâmetro de estado não foi recebido (possível problema de segurança).'
          break
        default:
          errorMessage = 'Erro desconhecido na autenticação do YouTube.'
      }

      if (details) {
        errorMessage += ` Detalhes: ${decodeURIComponent(details)}`
      }

      setYoutubeError(errorMessage)

      // Limpar os parâmetros da URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }

  const checkYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status')
      if (response.ok) {
        const data = await response.json()
        setYoutubeStatus(data)
      } else {
        setYoutubeStatus({ connected: false })
      }
    } catch (error) {
      console.error('Error checking YouTube status:', error)
      setYoutubeStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }

  const connectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        console.error('Failed to get YouTube auth URL:', response.status)
      }
    } catch (error) {
      console.error('Error connecting YouTube:', error)
    }
  }

  const disconnectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'DELETE'
      })
      if (response.ok) {
        setYoutubeStatus({ connected: false })
        // Recarregar a página para atualizar o status
        window.location.reload()
      }
    } catch (error) {
      console.error('Error disconnecting YouTube:', error)
    }
  }

  return (
    <AuthGuard>
      <div className="dashboard space-y-10">
        {/* YouTube Error Notification */}
        {youtubeError && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 shadow-lg p-6 md:p-8">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Erro na Conexão YouTube
                </h3>
                <p className="text-red-700 mb-4">
                  {youtubeError}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={connectYouTube}
                    className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white shadow hover:shadow-md hover:bg-red-700"
                  >
                    <Youtube className="h-4 w-4" aria-hidden="true" />
                    Tentar Novamente
                  </button>
                  <button
                    onClick={() => setYoutubeError(null)}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white shadow hover:shadow-md hover:bg-gray-700"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200/70 bg-white/90 shadow-lg p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Welcome to YouTube Organizer
          </h2>
          <p className="text-gray-600 mb-8">
            Organize your YouTube content with fast, friendly tools.
          </p>

          {/* Cards first: Videos, Playlists, Categories, Notebooks, Tags, Auto Tags */}
          <div className="cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Videos */}
            <Link href="/videos" className="card card-videos group">
              <div className="card-inner">
                <div className="card-icon">
                  <Film className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Videos</h3>
                <p className="card-desc">Manage all imported videos</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>

            {/* Playlists */}
            <Link href="/playlists" className="card card-playlists group" style={{ animationDelay: '60ms' }}>
              <div className="card-inner">
                <div className="card-icon">
                  <ListVideo className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Playlists</h3>
                <p className="card-desc">Import, sync, and explore</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>

            {/* Categories */}
            <Link href="/categories" className="card card-categories group" style={{ animationDelay: '120ms' }}>
              <div className="card-inner">
                <div className="card-icon">
                  <FolderTree className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Categories</h3>
                <p className="card-desc">Organize by themes and topics</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>

            {/* Notebooks */}
            <Link href="/notebooks" className="card card-notebooks group" style={{ animationDelay: '180ms' }}>
              <div className="card-inner">
                <div className="card-icon">
                  <Notebook className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Notebooks</h3>
                <p className="card-desc">Curate videos, channels, and lists</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>

            {/* Tags */}
            <Link href="/tags" className="card card-tags group" style={{ animationDelay: '240ms' }}>
              <div className="card-inner">
                <div className="card-icon">
                  <Tag className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Tags</h3>
                <p className="card-desc">Flexible labeling for discovery</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>

            {/* Auto Tags */}
            <Link href="/auto-tags" className="card card-auto-tags group" style={{ animationDelay: '300ms' }}>
              <div className="card-inner">
                <div className="card-icon">
                  <Wand2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="card-title">Auto Tags</h3>
                <p className="card-desc">Smart suggestions and analysis</p>
                <span className="card-cta">Open</span>
              </div>
            </Link>
          </div>
        </div>

        {/* YouTube connection section (after cards) */}
        <div className="rounded-2xl border border-gray-200/70 bg-white/90 shadow-lg overflow-hidden">
          <div className="relative p-6 md:p-8">
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_10%_10%,#ff0000,transparent_25%),radial-gradient(circle_at_90%_10%,#ff8a80,transparent_25%)]"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                  <Youtube className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold">YouTube Connection</h3>
              </div>

              {loading ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Checking connection...</span>
                </div>
              ) : youtubeStatus?.connected ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-green-700 border border-green-200">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-medium">Connected</span>
                    {youtubeStatus.youtubeUsername && (
                      <span className="text-gray-600">as {youtubeStatus.youtubeUsername}</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    <p className="font-medium">You can access:</p>
                    <ul className="mt-2 grid grid-cols-2 gap-2">
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Public playlists
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Private playlists
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Unlisted playlists
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Your complete history
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={disconnectYouTube}
                      className="focus-ring inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white shadow hover:shadow-md hover:bg-red-700"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-yellow-800 border border-yellow-200">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                    <span className="font-medium">Not connected</span>
                  </div>

                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Without OAuth connection:</p>
                    <ul className="mt-2 grid grid-cols-2 gap-2">
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Public playlists only
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Private playlists (blocked)
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Unlisted playlists (blocked)
                      </li>
                      <li className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Personal history (blocked)
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 p-4">
                    <p className="text-sm text-foreground mb-2 font-medium">To access your private playlists:</p>
                    <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                      <li>Configure OAuth in Google Cloud Console</li>
                      <li>Add credentials to the .env file</li>
                      <li>Click Connect YouTube below</li>
                    </ol>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={connectYouTube}
                      className="focus-ring inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white shadow hover:shadow-md hover:bg-red-700"
                    >
                      <Youtube className="h-4 w-4" aria-hidden="true" />
                      Connect YouTube
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white/90 shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How to get started
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sync your playlists</h4>
                <p className="text-gray-600">
                  Use a YouTube playlist ID to import automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create categories</h4>
                <p className="text-gray-600">
                  Organize your playlists by themes, topics or any criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add tags</h4>
                <p className="text-gray-600">
                  Use tags for more granular and flexible organization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Test Section */}
        <div className="rounded-2xl border border-gray-200/70 bg-white/90 shadow-lg p-6 md:p-8">
          <YouTubeTest />
        </div>
      </div>
    </AuthGuard>
  )
}


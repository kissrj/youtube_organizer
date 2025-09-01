'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'

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

  useEffect(() => {
    checkYouTubeStatus()
  }, [])

  const checkYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status')
      if (response.ok) {
        const data = await response.json()
        setYoutubeStatus(data)
      }
    } catch (error) {
      console.error('Erro ao verificar status do YouTube:', error)
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
      }
    } catch (error) {
      console.error('Erro ao conectar YouTube:', error)
    }
  }

  const disconnectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'DELETE'
      })
      if (response.ok) {
        setYoutubeStatus({ connected: false })
      }
    } catch (error) {
      console.error('Erro ao desconectar YouTube:', error)
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo ao YouTube Organizer
          </h2>
          <p className="text-gray-600 mb-6">
            Organize suas playlists do YouTube por categorias e tags de forma eficiente.
          </p>

          {/* Status da Conexão YouTube */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🔗 Conexão com YouTube
            </h3>

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Verificando conexão...</span>
              </div>
            ) : youtubeStatus?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium text-green-700">Conectado</span>
                  {youtubeStatus.youtubeUsername && (
                    <span className="text-gray-600">como {youtubeStatus.youtubeUsername}</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎯 <strong className="text-gray-900">Você pode acessar:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li className="text-green-700">✅ Playlists públicas</li>
                    <li className="text-green-700">✅ Playlists privadas</li>
                    <li className="text-green-700">✅ Playlists não listadas</li>
                    <li className="text-green-700">✅ Seu histórico completo</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={disconnectYouTube}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Desconectar YouTube
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-700">Não conectado</span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎯 <strong className="text-gray-900">Sem conexão OAuth:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li className="text-green-700">✅ Playlists públicas apenas</li>
                    <li className="text-red-700">❌ Playlists privadas (bloqueadas)</li>
                    <li className="text-red-700">❌ Playlists não listadas (bloqueadas)</li>
                    <li className="text-red-700">❌ Seu histórico pessoal (bloqueado)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>💡 Para acessar suas playlists privadas:</strong>
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Configure OAuth no Google Cloud Console</li>
                    <li>Adicione as credenciais no arquivo .env</li>
                    <li>Clique em "Conectar YouTube" abaixo</li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={connectYouTube}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔗 Conectar YouTube
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📚 Coleções
              </h3>
              <p className="text-blue-700 mb-4">
                Organize vídeos, canais e playlists em coleções personalizáveis
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Coleções
              </Link>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎥 Vídeos
              </h3>
              <p className="text-green-700 mb-4">
                Gerencie seus vídeos importados
              </p>
              <Link
                href="/videos"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Ver Vídeos
              </Link>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                🏷️ Tags
              </h3>
              <p className="text-purple-700 mb-4">
                Adicione tags aos seus vídeos
              </p>
              <Link
                href="/tags"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Ver Tags
              </Link>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                🤖 Tags Automáticas
              </h3>
              <p className="text-orange-700 mb-4">
                Sistema inteligente de análise e sugestão automática de tags
              </p>
              <Link
                href="/auto-tags"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Gerenciar Tags
              </Link>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                🔄 Sincronização
              </h3>
              <p className="text-indigo-700 mb-4">
                Mantenha seus dados sincronizados entre dispositivos
              </p>
              <Link
                href="/sync"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Gerenciar Sync
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Como começar
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sincronize suas playlists</h4>
                <p className="text-gray-600">
                  Use o ID de uma playlist do YouTube para importar automaticamente.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Crie categorias</h4>
                <p className="text-gray-600">
                  Organize suas playlists por temas, assuntos ou qualquer critério.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border border-purple-200">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Adicione tags</h4>
                <p className="text-gray-600">
                  Use tags para uma organização mais granular e flexível.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

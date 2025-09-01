'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
}

interface Playlist {
  id: string
  youtubeId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  itemCount: number
  categories: Array<{
    category: {
      id: string
      name: string
      color: string
    }
  }>
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)
  const [youtubeId, setYoutubeId] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [showOrganizer, setShowOrganizer] = useState(false)
  const [syncVideosLoading, setSyncVideosLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaylists()
    fetchCategoriesAndTags()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Erro ao buscar playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error('Erro ao buscar categorias e tags:', error)
    }
  }

  const extractYouTubePlaylistId = (input: string): string | null => {
    const trimmed = input.trim()

    // Se já é um ID válido (34 caracteres), retorna como está
    const playlistRegex = /^[A-Za-z0-9_-]{34}$/
    if (playlistRegex.test(trimmed)) {
      return trimmed
    }

    // Tenta extrair ID de uma URL completa
    const urlRegex = /[?&]list=([A-Za-z0-9_-]{34})/
    const match = trimmed.match(urlRegex)

    if (match) {
      return match[1]
    }

    return null
  }

  const validateYouTubePlaylistId = (id: string): { isValid: boolean; extractedId?: string; error?: string } => {
    const extractedId = extractYouTubePlaylistId(id)

    if (!extractedId) {
      return {
        isValid: false,
        error: 'Formato inválido. Deve ser um ID de 34 caracteres ou uma URL do YouTube com parâmetro list='
      }
    }

    return {
      isValid: true,
      extractedId
    }
  }

  const syncPlaylist = async () => {
    const trimmedInput = youtubeId.trim()
    if (!trimmedInput) return

    // Validação e extração do ID
    const validation = validateYouTubePlaylistId(trimmedInput)
    if (!validation.isValid) {
      alert(`❌ ${validation.error}\n\n` +
            '💡 Você pode:\n' +
            '• Copiar apenas o ID (34 caracteres)\n' +
            '• Ou colar a URL completa do YouTube\n\n' +
            'Exemplos válidos:\n' +
            '• PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI\n' +
            '• https://www.youtube.com/playlist?list=PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI')
      return
    }

    const finalId = validation.extractedId!

    setSyncLoading(true)
    try {
      const response = await fetch('/api/playlists/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeId: finalId }),
      })

      if (response.ok) {
        setYoutubeId('')
        fetchPlaylists()
        alert('✅ Playlist sincronizada com sucesso!')
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Erro ao sincronizar playlist'

        // Mostra mensagem de erro mais amigável
        if (errorMessage.includes('ID da playlist inválido')) {
          alert('❌ ID da playlist inválido!\n\n' +
                'O ID deve ter exatamente 34 caracteres.\n' +
                'Exemplo: PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI\n\n' +
                'Certifique-se de copiar apenas o ID, não a URL completa.')
        } else if (errorMessage.includes('não encontrada no YouTube')) {
          alert('❌ Playlist não encontrada!\n\n' +
                'Verifique se:\n' +
                '• O ID da playlist está correto\n' +
                '• A playlist é pública\n' +
                '• A playlist não foi excluída\n' +
                '• Você tem permissão para acessá-la')
        } else if (errorMessage.includes('Acesso negado')) {
          alert('❌ Problema com a API do YouTube!\n\n' +
                'Verifique se:\n' +
                '• A chave da API está correta\n' +
                '• A quota diária não foi excedida\n' +
                '• A API do YouTube Data v3 está habilitada')
        } else if (errorMessage.includes('quota')) {
          alert('❌ Quota da API excedida!\n\n' +
                'A quota diária da API do YouTube foi excedida.\n' +
                'Tente novamente amanhã ou considere fazer upgrade do plano.')
        } else {
          alert(`❌ Erro: ${errorMessage}`)
        }

        // Mostrar mensagem de erro mais amigável
        if (errorMessage.includes('não encontrada ou privada')) {
          alert(`❌ Playlist não encontrada!\n\n💡 Tente usar uma playlist pública conhecida:\n\n📺 ID: PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI\n📝 Título: Popular Music Videos\n\nOu configure OAuth para acessar suas playlists privadas.`)
        } else {
          alert(`❌ Erro: ${errorMessage}`)
        }
        console.error('Erro ao sincronizar playlist:', errorMessage)
      }
    } catch (error) {
      console.error('Erro ao sincronizar playlist:', error)

      // Verifica se é um erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('❌ Erro de conexão!\n\n' +
              'Verifique sua conexão com a internet e tente novamente.')
      } else {
        alert('❌ Erro inesperado!\n\n' +
              'Tente novamente em alguns instantes.')
      }
    } finally {
      setSyncLoading(false)
    }
  }

  const addCategoryToPlaylist = async (playlistId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      })

      if (response.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
    }
  }

  const removeCategoryFromPlaylist = async (playlistId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/categories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      })

      if (response.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error)
    }
  }

  const addTagToPlaylist = async (playlistId: string, tagName: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagName }),
      })

      if (response.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
    }
  }

  const removeTagFromPlaylist = async (playlistId: string, tagId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })

      if (response.ok) {
        fetchPlaylists()
      }
    } catch (error) {
      console.error('Erro ao remover tag:', error)
    }
  }

  const openOrganizer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setShowOrganizer(true)
  }

  const syncPlaylistVideos = async (playlist: Playlist) => {
    setSyncVideosLoading(playlist.id)

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/sync-videos`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Vídeos importados com sucesso!\n\n📊 Estatísticas:\n• ${data.imported} vídeos importados\n• ${data.skipped} vídeos pulados\n• ${data.errors} erros\n\nTotal: ${data.total} vídeos processados`)

        // Recarregar playlists para atualizar contadores
        fetchPlaylists()
      } else {
        alert(`❌ Erro ao importar vídeos: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao sincronizar vídeos:', error)
      alert('❌ Erro ao conectar com o servidor. Tente novamente.')
    } finally {
      setSyncVideosLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
        </div>

      {/* Formulário para sincronizar playlist */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sincronizar Playlist do YouTube
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="Cole o ID da playlist do YouTube"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
          />
          <button
            onClick={syncPlaylist}
            disabled={syncLoading || !youtubeId.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncLoading ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {/* Botão de teste rápido */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">Teste rápido:</span>
          <button
            onClick={() => setYoutubeId('PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            🎵 Popular Music Videos
          </button>
          <span className="text-xs text-gray-500">
            (Playlist pública conhecida que funciona)
          </span>
        </div>

        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p><strong>✅ Você pode colar:</strong></p>
          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
            <div>
              <span className="font-medium text-green-800">Apenas o ID:</span>
              <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2">PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI</code>
            </div>
            <div>
              <span className="font-medium text-green-800">Ou a URL completa:</span>
              <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2 break-all">https://www.youtube.com/playlist?list=PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI</code>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 O sistema extrairá automaticamente o ID da playlist da URL se necessário.
          </p>
        </div>
      </div>

      {/* Lista de playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              {playlist.thumbnailUrl && (
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {playlist.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {playlist.channelTitle}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {playlist.itemCount} vídeos
              </p>

              {/* Categorias */}
              {playlist.categories.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {playlist.categories.map((pc) => (
                      <span
                        key={pc.category.id}
                        className="inline-block px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: pc.category.color || '#e5e7eb',
                          color: '#374151'
                        }}
                      >
                        {pc.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {playlist.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {playlist.tags.map((pt) => (
                    <span
                      key={pt.tag.id}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      #{pt.tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => syncPlaylistVideos(playlist)}
                  disabled={syncVideosLoading === playlist.id}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {syncVideosLoading === playlist.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      📥 Importar Vídeos
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.youtubeId}`, '_blank')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  title="Abrir no YouTube"
                >
                  📺
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma playlist encontrada. Sincronize uma playlist do YouTube para começar.
          </p>
        </div>
      )}
      </div>
    </AuthGuard>
  )
}
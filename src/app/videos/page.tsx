'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { VideoFilters, FilterState } from '@/components/VideoFilters'
import { Pagination, usePagination } from '@/components/Pagination'
import VideoModal from '@/components/VideoModal'
import SearchBar from '@/components/SearchBar'
import { formatVideoStats, getDefinitionColor, getDimensionColor, getProjectionColor } from '@/lib/utils/video-formatters'

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
}

interface Video {
  id: string
  youtubeId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  duration: string
  viewCount: string
  likeCount: string
  commentCount: string
  favoriteCount: string
  publishedAt: string
  definition: string
  dimension: string
  projection: string
  defaultAudioLanguage: string
  categoryId: string
  videoTags: string[]
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

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showOrganizer, setShowOrganizer] = useState(false)
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [totalVideos, setTotalVideos] = useState(0)
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null)

  const { currentPage, setCurrentPage, itemsPerPage, resetPage, getPaginationInfo } = usePagination(1, 12)

  useEffect(() => {
    fetchVideos()
    fetchCategoriesAndTags()
  }, [currentPage, currentFilters])

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters)
    resetPage() // Reset para primeira página quando filtros mudam
  }

  const fetchVideos = async () => {
    try {
      // Construir parâmetros de query
      const params = new URLSearchParams()

      if (currentFilters) {
        if (currentFilters.search) params.append('search', currentFilters.search)
        if (currentFilters.categoryId) params.append('categoryId', currentFilters.categoryId)
        if (currentFilters.tagId) params.append('tagId', currentFilters.tagId)
        if (currentFilters.dateRange) params.append('dateRange', currentFilters.dateRange)
        if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy)
        if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder)
        if (currentFilters.definition) params.append('definition', currentFilters.definition)
        if (currentFilters.dimension) params.append('dimension', currentFilters.dimension)
      }

      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())

      const response = await fetch(`/api/videos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || data)
        setTotalVideos(data.total || data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error)
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

  const validateYouTubeVideoUrl = (input: string) => {
    const { validateYouTubeVideoInput } = require('@/lib/validation/video-validation')
    return validateYouTubeVideoInput(input)
  }

  const syncVideo = async () => {
    const trimmedInput = youtubeUrl.trim()
    if (!trimmedInput) return

    // Validação e extração do ID
    const validation = validateYouTubeVideoUrl(trimmedInput)
    if (!validation.isValid) {
      alert(`❌ ${validation.error}\n\n` +
            '💡 Você pode colar:\n' +
            '• Apenas o ID (11 caracteres)\n' +
            '• Ou a URL completa do YouTube\n\n' +
            'Exemplos válidos:\n' +
            '• dQw4w9WgXcQ\n' +
            '• https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      return
    }

    const finalId = validation.extractedId!

    setSyncLoading(true)
    try {
      const response = await fetch('/api/videos/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeId: finalId }),
      })

      if (response.ok) {
        setYoutubeUrl('')
        fetchVideos()
        alert('✅ Vídeo importado com sucesso!')
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Erro ao importar vídeo'

        // Mostra mensagem de erro mais amigável
        if (errorMessage.includes('não encontrado')) {
          alert('❌ Vídeo não encontrado!\n\n' +
                'Verifique se:\n' +
                '• O ID do vídeo está correto\n' +
                '• O vídeo é público\n' +
                '• O vídeo não foi excluído\n' +
                '• Você tem permissão para acessá-lo')
        } else if (errorMessage.includes('já foi importado')) {
          alert('ℹ️ Este vídeo já foi importado anteriormente.')
        } else {
          alert(`❌ Erro: ${errorMessage}`)
        }

        console.error('Erro ao importar vídeo:', errorMessage)
      }
    } catch (error) {
      console.error('Erro ao importar vídeo:', error)

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

  const addCategoryToVideo = async (videoId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      })

      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
    }
  }

  const removeCategoryFromVideo = async (videoId: string, categoryId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/categories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      })

      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error)
    }
  }

  const addTagToVideo = async (videoId: string, tagName: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagName }),
      })

      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
    }
  }

  const removeTagFromVideo = async (videoId: string, tagId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })

      if (response.ok) {
        fetchVideos()
      }
    } catch (error) {
      console.error('Erro ao remover tag:', error)
    }
  }

  const openOrganizer = (video: Video) => {
    setSelectedVideo(video)
    setShowOrganizer(true)
  }

  const openVideoModal = async (video: Video) => {
    try {
      // Try to fetch fresh copy (may include newly-saved description)
      const res = await fetch(`/api/videos/${video.id}`)
      if (res.ok) {
        const fresh = await res.json()
        setSelectedVideoForModal(fresh)
      } else {
        // Fallback to the provided object if auth or other issues
        setSelectedVideoForModal(video)
      }
    } catch (err) {
      setSelectedVideoForModal(video)
    }

    setShowVideoModal(true)
  }

  const closeVideoModal = () => {
    setSelectedVideoForModal(null)
    setShowVideoModal(false)
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
          <h1 className="text-3xl font-bold text-gray-900">Vídeos Importados</h1>
        </div>

        {/* Formulário para importar vídeo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Importar Vídeo do YouTube
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
                placeholder="Cole o link do vídeo do YouTube"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              />
              <button
                onClick={syncVideo}
                disabled={syncLoading || !youtubeUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncLoading ? 'Importando...' : 'Importar Vídeo'}
              </button>
            </div>

            {/* Botão de teste rápido */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Teste rápido:</span>
              <button
                onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                🎵 Never Gonna Give You Up
              </button>
              <span className="text-xs text-gray-500">
                (Vídeo público conhecido que funciona)
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4 space-y-1">
            <p><strong>✅ Você pode colar:</strong></p>
            <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
              <div>
                <span className="font-medium text-green-800">Apenas o ID:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2">dQw4w9WgXcQ</code>
              </div>
              <div>
                <span className="font-medium text-green-800">Ou a URL completa:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2 break-all">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 O sistema extrairá automaticamente o ID do vídeo da URL se necessário.
            </p>
          </div>
        </div>

        {/* Barra de Busca Avançada */}
        <SearchBar
          onSearch={(query, filters) => {
            // Converte os filtros do SearchBar para o formato do VideoFilters
            const videoFilters: FilterState = {
              search: query,
              categoryId: filters.categoryId || '',
              tagId: filters.tagId || '',
              dateRange: '',
              sortBy: 'createdAt',
              sortOrder: 'desc',
              definition: '',
              dimension: '',
            }
            handleFiltersChange(videoFilters)
          }}
          categories={categories}
          tags={tags}
          placeholder="Buscar nos títulos, descrições e conteúdo dos vídeos..."
        />

        {/* Lista de vídeos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const stats = formatVideoStats(video)
            return (
              <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Category badge (primary) - prominent on the thumbnail */}
                  {video.categories && video.categories.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <span
                        className="inline-block px-2 py-1 text-xs rounded-full font-semibold shadow"
                        style={{ backgroundColor: video.categories[0].category.color || '#f3f4f6', color: '#111827' }}
                      >
                        {video.categories[0].category.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {stats.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {stats.definition}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {video.channelTitle}
                  </p>

                  {/* Estatísticas principais */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{stats.views}</div>
                      <div className="text-xs text-gray-500">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{stats.likes}</div>
                      <div className="text-xs text-gray-500">Curtidas</div>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {stats.publishedAt}</span>
                      <span>⏱️ {stats.timeAgo}</span>
                    </div>

                    {/* Badges de qualidade */}
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getDefinitionColor(video.definition)}`}>
                        {stats.definition}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getDimensionColor(video.dimension)}`}>
                        {stats.dimension}
                      </span>
                      {video.projection !== 'rectangular' && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getProjectionColor(video.projection)}`}>
                          {stats.projection}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Categorias */}
                  {video.categories.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {video.categories.map((vc) => (
                          <span
                            key={vc.category.id}
                            className="inline-block px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: vc.category.color || '#e5e7eb',
                              color: '#374151'
                            }}
                          >
                            {vc.category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.map((vt) => (
                        <span
                          key={vt.tag.id}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          #{vt.tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags do vídeo (do YouTube) */}
                  {stats.tags.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Tags do YouTube:</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {stats.tags.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{stats.tags.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openVideoModal(video)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>▶️</span>
                      Assistir
                    </button>
                    <button
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      title="Abrir no YouTube"
                    >
                      📺
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Tem certeza que deseja apagar este vídeo? Esta ação é irreversível.')) return
                        try {
                          const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            // refresh list
                            fetchVideos()
                          } else {
                            const err = await res.json()
                            alert(err.error || 'Erro ao apagar vídeo')
                          }
                        } catch (e) {
                          console.error('Erro ao apagar vídeo:', e)
                          alert('Erro ao apagar vídeo')
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      title="Apagar vídeo"
                    >
                      🗑️ Apagar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal do Vídeo */}
        <VideoModal
          video={selectedVideoForModal}
          onClose={closeVideoModal}
        />

        {/* Componente de Paginação */}
        {totalVideos > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalVideos / itemsPerPage)}
            totalItems={totalVideos}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhum vídeo importado ainda. Importe um vídeo do YouTube para começar.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
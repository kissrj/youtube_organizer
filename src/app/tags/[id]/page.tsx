'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import VideoModal from '@/components/VideoModal'

interface Video {
  id: string
  youtubeId: string
  title: string
  description?: string
  thumbnailUrl?: string
  channelTitle?: string
  duration?: string
  viewCount?: string
  publishedAt?: string
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
  categories: Array<{
    category: {
      id: string
      name: string
      color?: string
    }
  }>
}

interface TagDetails {
  id: string
  name: string
  _count: {
    videos: number
    playlists: number
  }
  playlists: Array<{
    playlist: {
      id: string
      title: string
      thumbnailUrl: string | null
    }
  }>
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface TagWorkspaceData {
  videos: Video[]
  pagination: PaginationInfo
  tag: TagDetails
}

export default function TagWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [data, setData] = useState<TagWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Desembrulhar params com React.use()
  const resolvedParams = use(params)
  const tagId = resolvedParams.id

  useEffect(() => {
    fetchTagWorkspace(currentPage)
  }, [tagId, currentPage])

  const fetchTagWorkspace = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tags/${tagId}/videos?page=${page}&limit=20`)

      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else if (response.status === 404) {
        // Tag não encontrada, redirecionar para página de tags
        router.push('/tags')
      }
    } catch (error) {
      console.error('Erro ao buscar workspace da tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDuration = (duration: string | null) => {
    if (!duration) return ''
    // Remove PT prefix and format
    return duration.replace('PT', '').toLowerCase()
  }

  const formatViewCount = (viewCount: string | null) => {
    if (!viewCount) return ''
    const count = parseInt(viewCount)
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <AuthGuard>
        <div className="text-center py-12">
          <p className="text-gray-500">Tag não encontrada.</p>
        </div>
      </AuthGuard>
    )
  }

  const { videos, pagination, tag } = data

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header da Tag */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">#{tag.name}</h1>
              <div className="flex items-center space-x-6 mt-2">
                <span className="text-sm text-gray-600">
                  {tag._count?.videos || 0} vídeo{(tag._count?.videos || 0) !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  {tag._count?.playlists || 0} playlist{(tag._count?.playlists || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/tags')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Voltar para Tags
            </button>
          </div>

          {/* Playlists relacionadas (preview) */}
          {tag.playlists.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Playlists relacionadas</h3>
              <div className="flex flex-wrap gap-3">
                {tag.playlists.map((pt) => (
                  <div key={pt.playlist.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    {pt.playlist.thumbnailUrl && (
                      <Image
                        src={pt.playlist.thumbnailUrl}
                        alt={pt.playlist.title}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <span className="text-sm text-gray-700 truncate max-w-32">
                      {pt.playlist.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Vídeos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Vídeos com a tag #{tag.name}
          </h2>

          {videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Nenhum vídeo encontrado com esta tag.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="aspect-video relative">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      )}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {video.title}
                      </h3>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{video.channelTitle}</span>
                        {video.viewCount && (
                          <span>{formatViewCount(video.viewCount)} views</span>
                        )}
                      </div>

                      {/* Tags do vídeo */}
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {video.tags.slice(0, 2).map((tag) => (
                            <span key={tag.tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              #{tag.tag.name}
                            </span>
                          ))}
                          {video.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{video.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Anterior
                  </button>

                  <span className="text-sm text-gray-600">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Vídeo */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </AuthGuard>
  )
}
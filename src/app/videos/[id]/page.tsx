'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { YouTubePlayer } from '@/components/YouTubePlayer'

interface Video {
  id: string
  youtubeId: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  channelTitle?: string | null
  channelId?: string | null
  duration?: string | null
  viewCount?: number | string | null
  likeCount?: number | string | null
  commentCount?: number | string | null
  publishedAt?: string | null
  definition?: string | null
  dimension?: string | null
  projection?: string | null
  defaultAudioLanguage?: string | null
  categoryId?: string | null
  videoTags?: string | null
  createdAt: string
  updatedAt: string
  categories: {
    category: {
      id: string
      name: string
      description: string
      color: string
    }
  }[]
  tags: {
    tag: {
      id: string
      name: string
    }
  }[]
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Desembrulhar params com React.use()
  const resolvedParams = use(params)
  const videoId = resolvedParams.id

  useEffect(() => {
    if (videoId) {
      fetchVideo(videoId)
    }
  }, [videoId])

  const fetchVideo = async (videoId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/videos/${videoId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Vídeo não encontrado')
        } else {
          setError('Erro ao carregar vídeo')
        }
        return
      }

      const data = await response.json()
      setVideo(data)
    } catch (err) {
      console.error('Erro ao buscar vídeo:', err)
      setError('Erro ao carregar vídeo')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number | string | null | undefined) => {
    const n = typeof num === 'string' ? parseInt(num, 10) : (num ?? 0)
    if (Number.isNaN(n)) return '0'
    if (n >= 1_000_000) {
      return (n / 1_000_000).toFixed(1) + 'M'
    }
    if (n >= 1_000) {
      return (n / 1_000).toFixed(1) + 'K'
    }
    return String(n)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/videos"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Voltar para Vídeos
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!video) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vídeo não encontrado</h1>
            <Link
              href="/videos"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ← Voltar para Vídeos
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/videos"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ← Voltar para Vídeos
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {video.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player - Mobile First */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <YouTubePlayer
                  videoId={video.youtubeId}
                  width="100%"
                  height="480px"
                  className="w-full"
                />
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {video.title}
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 mb-4">
                  {video.channelTitle && <span>👤 {video.channelTitle}</span>}
                  {video.publishedAt && <><span>•</span><span>📅 {formatDate(video.publishedAt)}</span></>}
                  {video.duration && <><span>•</span><span>⏱️ {formatDuration(video.duration)}</span></>}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  <span>👁️ {formatNumber(video.viewCount)} visualizações</span>
                  <span>👍 {formatNumber(video.likeCount)} likes</span>
                  <span>💬 {formatNumber(video.commentCount)} comentários</span>
                </div>

                {/* Categories */}
                {video.categories && video.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📁 Categorias</h3>
                    <div className="flex flex-wrap gap-2">
                      {video.categories.map(({ category }) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            border: `1px solid ${category.color}40`
                          }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {video.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Descrição</h3>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {video.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Video Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Detalhes Técnicos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID do YouTube:</span>
                    <span className="font-mono text-sm text-gray-900">{video.youtubeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Definição:</span>
                    <span className="font-medium">{video.definition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensão:</span>
                    <span className="font-medium">{video.dimension}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projeção:</span>
                    <span className="font-medium">{video.projection}</span>
                  </div>
                  {video.defaultAudioLanguage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Idioma:</span>
                      <span className="font-medium">{video.defaultAudioLanguage}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adicionado em:</span>
                    <span className="font-medium">{formatDate(video.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização:</span>
                    <span className="font-medium">{formatDate(video.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Ações</h3>
                <div className="space-y-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🎥 Ver no YouTube
                  </a>
                  <a
                    href={`https://www.youtube.com/channel/${video.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    📺 Ver Canal
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Actions - Only shown on mobile */}
          <div className="lg:hidden mt-8 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Ações</h3>
              <div className="space-y-3">
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  🎥 Ver no YouTube
                </a>
                <a
                  href={`https://www.youtube.com/channel/${video.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  📺 Ver Canal
                </a>
              </div>
            </div>

            {/* Mobile Technical Details - Only shown on mobile */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Detalhes Técnicos</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do YouTube:</span>
                  <span className="font-mono text-sm text-gray-900">{video.youtubeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Definição:</span>
                  <span className="font-medium">{video.definition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensão:</span>
                  <span className="font-medium">{video.dimension}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projeção:</span>
                  <span className="font-medium">{video.projection}</span>
                </div>
                {video.defaultAudioLanguage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Idioma:</span>
                    <span className="font-medium">{video.defaultAudioLanguage}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Adicionado em:</span>
                  <span className="font-medium">{formatDate(video.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium">{formatDate(video.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
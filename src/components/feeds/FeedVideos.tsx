'use client'

import React, { useState, useEffect } from 'react'
import { Video } from '@/lib/types'
import { Search, Filter, Calendar, Eye, Heart, MessageCircle, Clock, ArrowLeft } from 'lucide-react'

interface FeedVideosProps {
  feedId: string
  onBack: () => void
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export function FeedVideos({ feedId, onBack }: FeedVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadVideos()
  }, [feedId, pagination.page])

  const loadVideos = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/collections/feeds/${feedId}?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 })
    loadVideos()
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration (PT4M13S) to minutes:seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    const totalMinutes = hours * 60 + minutes
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatNumber = (num: string | undefined) => {
    if (!num) return '0'
    return parseInt(num).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vídeos do Feed</h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} vídeo{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
          </form>
        </div>
      </div>

      {/* Lista de vídeos */}
      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum vídeo encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 relative">
                  <img
                    src={video.thumbnailUrl || '/placeholder-video.png'}
                    alt={video.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 text-gray-900 text-xs px-2 py-1 rounded border border-gray-200">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Metadados */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {video.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    )}

                    {video.viewCount && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(video.viewCount)} visualizações</span>
                      </div>
                    )}

                    {video.likeCount && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(video.likeCount)} curtidas</span>
                      </div>
                    )}

                    {video.commentCount && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{formatNumber(video.commentCount)} comentários</span>
                      </div>
                    )}
                  </div>

                  {/* Canal e tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {video.channel?.thumbnailUrl && (
                        <img
                          src={video.channel.thumbnailUrl}
                          alt={video.channel.title}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {video.channel?.title || video.channelTitle}
                        </p>
                        <p className="text-sm text-gray-500">
                          {video.channelTitle && video.channelTitle !== video.channel?.title
                            ? video.channelTitle
                            : ''}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{video.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <span className="text-gray-600">
            Página {pagination.page} de {pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

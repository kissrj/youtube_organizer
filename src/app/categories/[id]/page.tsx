'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import SearchBar from '@/components/SearchBar'
import { formatVideoStats, getDefinitionColor, getDimensionColor, getProjectionColor } from '@/lib/utils/video-formatters'

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
  playlist: {
    id: string
    title: string
    youtubeId: string
  }
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

interface Category {
  id: string
  name: string
  description: string
  color: string
}

export default function CategoryVideosPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.id as string

  const [videos, setVideos] = useState<Video[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('publishedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndVideos()
    }
  }, [categoryId, searchQuery, sortBy, sortOrder])

  const fetchCategoryAndVideos = async () => {
    try {
      // Fetch category details
      const categoryResponse = await fetch(`/api/categories/${categoryId}`)
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData)
      }

      // Fetch videos from playlists in this category
      const videosResponse = await fetch(
        `/api/categories/${categoryId}/videos?search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      )
      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        setVideos(videosData)
      }
    } catch (error) {
      console.error('Error fetching category videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const openVideoModal = async (video: Video) => {
    try {
      const res = await fetch(`/api/videos/${video.id}`)
      if (res.ok) {
        const fresh = await res.json()
        // For now, just open YouTube. You can implement a modal later
        window.open(`https://www.youtube.com/watch?v=${fresh.youtubeId}`, '_blank')
      } else {
        window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
      }
    } catch (err) {
      window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <AuthGuard>
        <div className="text-center py-12">
          <p className="text-gray-500">Category not found.</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Categories
          </button>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header with category info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/categories')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back to Categories
            </button>
            <div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{videos.length} videos</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search videos in this category..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="publishedAt">Published Date</option>
              <option value="title">Title</option>
              <option value="viewCount">Views</option>
              <option value="duration">Duration</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Video list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const stats = formatVideoStats(video)
            return (
              <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Playlist badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    📺 {video.playlist.title}
                  </div>

                  {/* Category badge */}
                  {video.categories.length > 0 && (
                    <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                      {video.categories[0].category.name}
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {stats.duration}
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
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

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{stats.views}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">{stats.likes}</div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                  </div>

                  {/* Quality badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
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

                  {/* Tags */}
                  {video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map((vt) => (
                        <span
                          key={vt.tag.id}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          #{vt.tag.name}
                        </span>
                      ))}
                      {video.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{video.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openVideoModal(video)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>▶️</span>
                      Watch
                    </button>
                    <button
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      title="Open on YouTube"
                    >
                      📺
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No videos found in this category.
              {searchQuery && ' Try adjusting your search terms.'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Videos are associated with categories when you import them individually or sync them from playlists.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
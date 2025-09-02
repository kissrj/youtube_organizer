'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import SearchBar from '@/components/SearchBar'
import VideoModal from '@/components/VideoModal'
import { formatVideoStats, getDefinitionColor, getDimensionColor, getProjectionColor } from '@/lib/utils/video-formatters'
import CompactMarkdown from '@/components/CompactMarkdown'

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

export default function PlaylistVideosPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params?.id as string

  const [videos, setVideos] = useState<Video[]>([])
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('publishedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistAndVideos()
    }
  }, [playlistId, searchQuery, sortBy, sortOrder])

  const fetchPlaylistAndVideos = async () => {
    try {
      // Fetch playlist details
      const playlistResponse = await fetch(`/api/playlists/${playlistId}`)
      if (playlistResponse.ok) {
        const playlistData = await playlistResponse.json()
        setPlaylist(playlistData)
      }

      // Fetch videos from this playlist
      const videosResponse = await fetch(
        `/api/playlists/${playlistId}/videos?search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      )
      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        setVideos(videosData)
      }
    } catch (error) {
      console.error('Error fetching playlist videos:', error)
    } finally {
      setLoading(false)
    }
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

  if (!playlist) {
    return (
      <AuthGuard>
        <div className="text-center py-12">
          <p className="text-gray-500">Playlist not found.</p>
          <button
            onClick={() => router.push('/playlists')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Playlists
          </button>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header with playlist info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/playlists')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back to Playlists
            </button>
            <div className="flex items-center space-x-4">
              {playlist.thumbnailUrl && (
                <Image
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  width={80}
                  height={60}
                  className="w-20 h-15 object-cover rounded"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{playlist.title}</h1>
                <p className="text-gray-600">{playlist.channelTitle}</p>
                {playlist.description && (
                  <p className="text-sm text-gray-500 mt-1">{playlist.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{videos.length} videos</p>
            <p className="text-xs text-gray-400">from {playlist.itemCount} total</p>
          </div>
        </div>

        {/* Categories and Tags */}
        {(playlist.categories.length > 0 || playlist.tags.length > 0) && (
          <div className="flex flex-wrap gap-4">
            {playlist.categories.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
                <div className="inline-flex flex-wrap gap-1">
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
            {playlist.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {playlist.tags.map((pt) => (
                    <span
                      key={pt.tag.id}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      #{pt.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search videos in this playlist..."
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
              // Parse videoTags if it's a string (from database)
              const parsedTags = typeof video.videoTags === 'string'
                ? JSON.parse(video.videoTags || '[]')
                : (video.videoTags || [])
  
              // Filter out playlist tags for display
              const displayTags = parsedTags.filter((tag: string) =>
                !tag.startsWith('playlist_') && !tag.startsWith('playlist:')
              )
  
              const stats = formatVideoStats({
                ...video,
                videoTags: displayTags
              })
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
                  <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                    📺 {video.playlist?.title || playlist.title}
                  </div>

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
                  <p className="text-sm text-gray-600 mb-2">
                    {video.channelTitle}
                  </p>

                  {/* Video description (compact) */}
                  {video.description && (
                    <div className="mb-3">
                      <CompactMarkdown
                        text={video.description}
                        maxLength={100}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Main statistics */}
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

                  {/* Additional information */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {stats.publishedAt}</span>
                      <span>⏱️ {stats.timeAgo}</span>
                    </div>

                    {/* Quality badges */}
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

                  {/* Categories */}
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

                  {/* Video tags (from YouTube) */}
                  {stats.tags.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">YouTube Tags:</div>
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
                            +{stats.tags.length - 3} more
                          </span>
                        )}
                      </div>
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
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this video? This action is irreversible.')) return
                        setDeleteLoading(video.id)
                        try {
                          const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            // refresh list
                            fetchPlaylistAndVideos()
                          } else {
                            const err = await res.json()
                            alert(err.error || 'Error deleting video')
                          }
                        } catch (e) {
                          console.error('Error deleting video:', e)
                          alert('Error deleting video')
                        } finally {
                          setDeleteLoading(null)
                        }
                      }}
                      disabled={deleteLoading === video.id}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete video"
                    >
                      {deleteLoading === video.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        '🗑️ Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Video Modal */}
        <VideoModal
          video={selectedVideoForModal}
          onClose={closeVideoModal}
        />

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No videos found in this playlist.
              {searchQuery && ' Try adjusting your search terms.'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Videos are automatically imported when you add a playlist.
              If you're not seeing videos, the playlist might be empty or private.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
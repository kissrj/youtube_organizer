'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import SearchBar from '@/components/SearchBar'
import VideoModal from '@/components/VideoModal'
import FixedActionsBar from '@/components/FixedActionsBar'
import DraggableItem from '@/components/DraggableItem'
import { useQuickActions } from '@/hooks/useQuickActions'
import { formatVideoStats, getDefinitionColor, getDimensionColor, getProjectionColor } from '@/lib/utils/video-formatters'
import CompactMarkdown from '@/components/CompactMarkdown'
import SortControls, { VIDEO_SORT_OPTIONS } from '@/components/SortControls'

// Custom CSS for pulse animations
const pulseStyles = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
      transform: scale(1.05);
    }
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }

  .animation-delay-300 {
    animation-delay: 0.3s;
  }

  .animation-delay-400 {
    animation-delay: 0.4s;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = pulseStyles
  document.head.appendChild(styleSheet)
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

export default function PlaylistVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  // Desembrulhar params com React.use()
  const resolvedParams = use(params)
  const playlistId = resolvedParams.id

  const [videos, setVideos] = useState<Video[]>([])
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('publishedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<Video | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [layoutType, setLayoutType] = useState<'grid' | 'compact' | 'horizontal'>('grid')

  // Quick Actions Hook
  const {
    notebookModal,
    tagModal,
    handleNotebookDrop,
    handleTagDrop,
    handleDeleteDrop,
    handleAddToNotebook,
    handleCreateNotebook,
    handleAddTags,
    handleCreateTag,
    closeNotebookModal,
    closeTagModal,
  } = useQuickActions()

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

  // Compute readable text color for colored badges
  const readableTextColor = (hex: string) => {
    try {
      const c = (hex || '').replace('#', '')
      if (c.length !== 6) return '#111827'
      const r = parseInt(c.slice(0, 2), 16) / 255
      const g = parseInt(c.slice(2, 4), 16) / 255
      const b = parseInt(c.slice(4, 6), 16) / 255
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
      return lum > 0.6 ? '#111827' : '#F9FAFB'
    } catch {
      return '#111827'
    }
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
            <p className="text-subtle">Playlist not found.</p>
            <button
              onClick={() => router.push('/playlists')}
              className="mt-4 btn btn-primary"
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
              className="btn btn-ghost"
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
                <h1 className="text-3xl font-bold text-foreground">{playlist.title}</h1>
                <p className="text-muted">{playlist.channelTitle}</p>
                {playlist.description && (
                  <p className="text-sm text-subtle mt-1">{playlist.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-subtle">{videos.length} videos</p>
            <p className="text-xs text-subtle">from {playlist.itemCount} total</p>
          </div>
        </div>

        {/* Removed notebook promo section per request */}

        {/* Categories and Tags */}
        {(playlist.categories.length > 0 || playlist.tags.length > 0) && (
          <div className="flex flex-wrap gap-4">
            {playlist.categories.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted mr-2">Categories:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {playlist.categories.map((pc) => (
                    <span
                      key={pc.category.id}
                      className="inline-block px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: pc.category.color || '#e5e7eb',
                        color: readableTextColor(pc.category.color || '#e5e7eb')
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
                <span className="text-sm font-medium text-muted mr-2">Tags:</span>
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
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            sortOptions={VIDEO_SORT_OPTIONS}
          />
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted mr-2">Layout:</span>
          <div className="flex bg-surface border border-subtle rounded-lg p-1">
            <button
              onClick={() => setLayoutType('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'grid'
                  ? 'bg-elevated text-foreground shadow-sm'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setLayoutType('compact')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'compact'
                  ? 'bg-elevated text-foreground shadow-sm'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setLayoutType('horizontal')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                layoutType === 'horizontal'
                  ? 'bg-elevated text-foreground shadow-sm'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              Horizontal
            </button>
          </div>
        </div>

        {/* Video list - Dynamic Layout */}
        {layoutType === 'grid' && (
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
                <DraggableItem
                  key={video.id}
                  id={video.id}
                  type="video"
                  title={video.title}
                  youtubeId={video.youtubeId}
                  className="mb-4 transform-gpu will-change-transform video-card animate-card-enter group"
                >
                  <div className="ui-card overflow-hidden ui-card-hover group">
                    <div className="aspect-video relative animate-image-zoom bg-surface">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          width={1280}
                          height={720}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="backdrop-blur-sm bg-black/40 text-white px-3 py-2 rounded-full text-sm shadow">Tap to play</div>
                      </div>

                      {/* Playlist badge */}
                      <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                        📺 {video.playlist?.title || playlist.title}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {stats.duration}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {stats.definition}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted mb-2">
                        {video.channelTitle}
                      </p>

                      {/* Video description (compact) */}
                      {video.description && (
                        <div className="mb-3">
                          <CompactMarkdown
                            text={video.description}
                            maxLength={100}
                            className="text-sm text-muted leading-relaxed"
                          />
                        </div>
                      )}

                      {/* Main statistics */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold" style={{ color: 'var(--primary-600)' }}>{stats.views}</div>
                          <div className="text-xs text-subtle">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold" style={{ color: '#ef4444' }}>{stats.likes}</div>
                          <div className="text-xs text-subtle">Likes</div>
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
                                  color: readableTextColor(vc.category.color || '#e5e7eb')
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

                      {/* Action buttons - displayed horizontally with animations */}
                      <div className="flex gap-2 mt-4 items-center">
                        <button
                          onClick={() => openVideoModal(video)}
                          className="flex-1 btn btn-primary px-4 py-2 animate-button-hover flex items-center justify-center gap-2"
                        >
                          <span>▶️</span>
                          Watch
                        </button>
                        <button
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                          className="btn btn-ghost px-4 py-2 animate-button-hover"
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
                          className="btn px-4 py-2 animate-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
                </DraggableItem>
              )
            })}
          </div>
        )}

        {layoutType === 'compact' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos.map((video) => {
              const parsedTags = typeof video.videoTags === 'string'
                ? JSON.parse(video.videoTags || '[]')
                : (video.videoTags || [])
              const displayTags = parsedTags.filter((tag: string) =>
                !tag.startsWith('playlist_') && !tag.startsWith('playlist:')
              )
              const stats = formatVideoStats({
                ...video,
                videoTags: displayTags
              })

              return (
                <DraggableItem
                  key={video.id}
                  id={video.id}
                  type="video"
                  title={video.title}
                  youtubeId={video.youtubeId}
                  className="mb-4 transform-gpu will-change-transform video-card animate-card-enter group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-card-hover border border-gray-100 cursor-pointer group">
                    <div className="aspect-video bg-gray-200 relative animate-image-zoom">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          width={320}
                          height={180}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                        {stats.duration}
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {video.channelTitle}
                      </p>
                    </div>
                  </div>
                </DraggableItem>
              )
            })}
          </div>
        )}

        {layoutType === 'horizontal' && (
          <div className="px-6 py-4 custom-scrollbar">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
              {videos.map((video) => {
                const parsedTags = typeof video.videoTags === 'string'
                  ? JSON.parse(video.videoTags || '[]')
                  : (video.videoTags || [])
                const displayTags = parsedTags.filter((tag: string) =>
                  !tag.startsWith('playlist_') && !tag.startsWith('playlist:')
                )
                const stats = formatVideoStats({
                  ...video,
                  videoTags: displayTags
                })

                return (
                  <DraggableItem
                    key={video.id}
                    id={video.id}
                    type="video"
                    title={video.title}
                    youtubeId={video.youtubeId}
                    className="mb-4 transform-gpu will-change-transform video-card animate-card-enter group"
                  >
                    <div className="flex-shrink-0 w-64 ui-card overflow-hidden ui-card-hover cursor-pointer group snap-start">
                      <div className="aspect-video relative animate-image-zoom bg-surface">
                        {video.thumbnailUrl && (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            width={320}
                            height={180}
                            className="w-full h-full object-cover transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="backdrop-blur-sm bg-black/40 text-white px-3 py-2 rounded-full text-sm shadow">Tap to play</div>
                        </div>
                        {/* Playlist badge */}
                        <div className="absolute top-2 left-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                          📺 {video.playlist?.title || playlist.title}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {stats.duration}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {stats.definition}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 leading-tight">
                          {video.title}
                        </h3>
                        <p className="text-xs text-muted mb-2">
                          {video.channelTitle}
                        </p>
                        {/* Compact stats */}
                        <div className="flex items-center justify-between text-xs text-subtle mb-2">
                          <span>{stats.views} views</span>
                          <span>{stats.timeAgo}</span>
                        </div>
                        {/* Action buttons - simplified for horizontal layout */}
                        <div className="flex gap-1 items-center">
                          <button
                            onClick={() => openVideoModal(video)}
                            className="flex-1 btn btn-primary px-2 py-1 text-xs animate-button-hover flex items-center justify-center gap-1"
                          >
                            <span>▶️</span>
                            Watch
                          </button>
                          <button
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                            className="btn btn-ghost px-2 py-1 text-xs animate-button-hover"
                            title="Open on YouTube"
                          >
                            📺
                          </button>

                        </div>
                      </div>
                    </div>
                  </DraggableItem>
                )
              })}
            </div>
          </div>
        )}


        {/* Video Modal */}
        <VideoModal
          video={selectedVideoForModal}
          onClose={closeVideoModal}
        />

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-subtle">
              No videos found in this playlist.
              {searchQuery && ' Try adjusting your search terms.'}
            </p>
            <p className="text-sm text-subtle mt-2">
              Videos are automatically imported when you add a playlist.
              If you're not seeing videos, the playlist might be empty or private.
            </p>
          </div>
        )}

        {/* Fixed Actions Bar - Always Visible */}
        <FixedActionsBar
          onNotebookDrop={handleAddToNotebook}
          onCreateNotebook={handleCreateNotebook}
          onTagDrop={handleTagDrop}
          onDeleteDrop={handleDeleteDrop}
        />
      </div>
    </AuthGuard>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import { VideoFilters, FilterState } from '@/components/VideoFilters'
import { Pagination, usePagination } from '@/components/Pagination'
import VideoModal from '@/components/VideoModal'
import SearchBar from '@/components/SearchBar'
import { formatVideoStats, getDefinitionColor, getDimensionColor, getProjectionColor } from '@/lib/utils/video-formatters'
import CompactMarkdown from '@/components/CompactMarkdown'
import FixedActionsBar from '@/components/FixedActionsBar'
import DraggableItem from '@/components/DraggableItem'
import { useQuickActions } from '@/hooks/useQuickActions'
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
  isWatched: boolean
  watchedAt?: string
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

type LayoutType = 'grid' | 'compact' | 'horizontal'

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
  const [layoutType, setLayoutType] = useState<LayoutType>('grid')
  const [tagInputVisible, setTagInputVisible] = useState<string | null>(null)
  const [tagInputValue, setTagInputValue] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [watchStatusFilter, setWatchStatusFilter] = useState<'all' | 'watched' | 'unwatched'>('all')

  const { currentPage, setCurrentPage, itemsPerPage, resetPage, getPaginationInfo } = usePagination(1, 12)

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
    fetchVideos()
    fetchCategoriesAndTags()
  }, [currentPage, currentFilters, sortBy, sortOrder, watchStatusFilter])

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters)
    resetPage() // Reset to first page when filters change
  }

  const fetchVideos = async () => {
    try {
      // Build query parameters
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
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      // Add watch status filter
      if (watchStatusFilter !== 'all') {
        params.append('watchStatus', watchStatusFilter)
      }

      const response = await fetch(`/api/videos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || data)
        setTotalVideos(data.total || data.length)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
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
      console.error('Error fetching categories and tags:', error)
    }
  }

  const validateYouTubeVideoUrl = (input: string) => {
    const { validateYouTubeVideoInput } = require('@/lib/validation/video-validation')
    return validateYouTubeVideoInput(input)
  }

  const syncVideo = async () => {
    const trimmedInput = youtubeUrl.trim()
    if (!trimmedInput) return

    // Validation and ID extraction
    const validation = validateYouTubeVideoUrl(trimmedInput)
    if (!validation.isValid) {
      alert(`❌ ${validation.error}\n\n` +
            '💡 You can paste:\n' +
            '• Just the ID (11 characters)\n' +
            '• Or the full YouTube URL\n\n' +
            'Valid examples:\n' +
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
        alert('✅ Video imported successfully!')
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Error importing video'

        // Show more user-friendly error message
        if (errorMessage.includes('not found')) {
          alert('❌ Video not found!\n\n' +
                'Check if:\n' +
                '• The video ID is correct\n' +
                '• The video is public\n' +
                '• The video hasn\'t been deleted\n' +
                '• You have permission to access it')
        } else if (errorMessage.includes('já foi importado')) {
          alert('ℹ️ This video has already been imported previously.')
        } else {
          alert(`❌ Error: ${errorMessage}`)
        }

        console.error('Error importing video:', errorMessage)
      }
    } catch (error) {
      console.error('Error importing video:', error)

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('❌ Connection error!\n\n' +
              'Check your internet connection and try again.')
      } else {
        alert('❌ Unexpected error!\n\n' +
              'Try again in a few moments.')
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
      console.error('Error adding category:', error)
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
      console.error('Error removing category:', error)
    }
  }

  const addTagToVideo = async (videoId: string, tagName: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagName: tagName.trim() }),
      })

      if (response.ok) {
        fetchVideos()
      } else {
        const errorData = await response.json()
        alert(`Erro ao adicionar tag: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      alert('Erro ao adicionar tag. Tente novamente.')
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
      console.error('Error removing tag:', error)
    }
  }

  const showTagInput = (videoId: string) => {
    setTagInputVisible(videoId)
    setTagInputValue('')
  }

  const hideTagInput = () => {
    setTagInputVisible(null)
    setTagInputValue('')
  }

  const handleTagInputSubmit = async (videoId: string, tagName: string) => {
    if (!tagName.trim()) {
      hideTagInput()
      return
    }

    await addTagToVideo(videoId, tagName)
    hideTagInput()
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent, videoId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTagInputSubmit(videoId, tagInputValue)
    } else if (e.key === 'Escape') {
      hideTagInput()
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

  // Compute readable text color for colored category badges
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

  return (
    <AuthGuard>
      <div className="space-y-6">
          {/* Header Section - Title on top line */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-foreground">🎬 Videos</h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Drag videos to the action bar on the right</span>
              </div>
            </div>

            {/* Controls Section - Below title */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Reindex Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (confirm('This will reindex all your videos for better search. It may take a few minutes. Continue?')) {
                      try {
                        const response = await fetch('/api/videos', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'reindex' })
                        })
                        if (response.ok) {
                          alert('✅ Reindexing started! Search will be better in a few minutes.')
                        } else {
                          alert('❌ Failed to start reindexing')
                        }
                      } catch (error) {
                        alert('❌ Error starting reindexing')
                      }
                    }
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  title="Reindex videos for better search"
                >
                  🔄 Reindex Search
                </button>
              </div>
              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                sortOptions={VIDEO_SORT_OPTIONS}
              />

              <div className="flex items-center gap-4">
                {/* Watch Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted mr-2">Status:</span>
                  <div className="flex bg-surface border border-subtle rounded-lg p-1">
                    <button
                      onClick={() => setWatchStatusFilter('all')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        watchStatusFilter === 'all'
                          ? 'bg-elevated text-foreground shadow-sm'
                          : 'text-subtle hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setWatchStatusFilter('watched')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        watchStatusFilter === 'watched'
                          ? 'bg-elevated text-foreground shadow-sm'
                          : 'text-subtle hover:text-foreground'
                      }`}
                    >
                      Watched
                    </button>
                    <button
                      onClick={() => setWatchStatusFilter('unwatched')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        watchStatusFilter === 'unwatched'
                          ? 'bg-elevated text-foreground shadow-sm'
                          : 'text-subtle hover:text-foreground'
                      }`}
                    >
                      Unwatched
                    </button>
                  </div>
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
              </div>
            </div>
          </div>

          {/* Inline container to render Quick Actions bar */}
          <div id="quick-actions-inline" className="flex justify-center py-2" />


          {/* Removed notebook promo section per request */}

        {/* Form to import video */}
        <div className="ui-card p-6 ui-card-hover">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Import YouTube Video
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
                placeholder="Paste the YouTube video link"
                className="flex-1 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-fg bg-surface placeholder:text-subtle border border-ui"
              />
              <button
                onClick={syncVideo}
                disabled={syncLoading || !youtubeUrl.trim()}
                className="btn btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncLoading ? 'Importing...' : 'Import Video'}
              </button>
            </div>

            {/* Quick test button */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Quick test:</span>
              <button
                onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="px-3 py-1 text-sm rounded-md transition-colors"
                style={{ backgroundColor: 'color-mix(in oklab, #22c55e 12%, transparent)', color: '#16a34a' }}
              >
                🎵 Never Gonna Give You Up
              </button>
              <span className="text-xs text-subtle">
                (Known working public video)
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4 space-y-1">
            <p><strong>✅ You can paste:</strong></p>
            <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
              <div>
                <span className="font-medium text-green-800">Just the ID:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2">dQw4w9WgXcQ</code>
              </div>
              <div>
                <span className="font-medium text-green-800">Or the full URL:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2 break-all">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 The system will automatically extract the video ID from the URL if necessary.
            </p>
          </div>
        </div>

        {/* Advanced Search Bar */}
        <SearchBar
          onSearch={(query, filters) => {
            // Convert SearchBar filters to VideoFilters format
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
          placeholder="Search in video titles, descriptions and content..."
        />

        {/* Video list - Dynamic Layout */}
        {layoutType === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {videos.map((video, index) => {
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
                    <div className="ui-card overflow-hidden ui-card-hover cursor-pointer group">
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
                      {/* Drag indicator */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          Drag
                        </div>
                      </div>
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

                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {stats.duration}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {stats.definition}
                      </div>
                      {/* Watch Status Indicator for Horizontal */}
                      {video.isWatched && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Watched
                          </div>
                        </div>
                      )}
                      {/* Watch Status Indicator */}
                      {video.isWatched && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Watched
                          </div>
                        </div>
                      )}
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
                            maxLength={120}
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
                      <div className="flex items-center justify-between text-xs text-subtle">
                        <span>📅 {stats.publishedAt}</span>
                        <span>⏱️ {stats.timeAgo}</span>
                      </div>
                      {/* Watch Status Info */}
                      {video.isWatched && video.watchedAt && (
                        <div className="text-xs text-green-600 font-medium">
                          ✅ Watched on {new Date(video.watchedAt).toLocaleDateString()}
                        </div>
                      )}

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
                      <div className="flex flex-wrap gap-1 items-center">
                        {video.tags.map((vt) => (
                          <span
                            key={vt.tag.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded group/tag"
                          >
                            #{vt.tag.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeTagFromVideo(video.id, vt.tag.id)
                              }}
                              className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity text-xs"
                              title="Remover tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        {/* Add tag button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            showTagInput(video.id)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          title="Adicionar tag"
                        >
                          <span>+</span>
                          <span className="hidden sm:inline">Tag</span>
                        </button>
                      </div>

                      {/* Tag input */}
                      {tagInputVisible === video.id && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={tagInputValue}
                            onChange={(e) => setTagInputValue(e.target.value)}
                            onKeyDown={(e) => handleTagInputKeyPress(e, video.id)}
                            onBlur={() => handleTagInputSubmit(video.id, tagInputValue)}
                            placeholder="Digite o nome da tag..."
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Pressione Enter para confirmar, Esc para cancelar
                          </div>
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
                            try {
                              const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
                              if (res.ok) {
                                // refresh list
                                fetchVideos()
                              } else {
                                const err = await res.json()
                                alert(err.error || 'Error deleting video')
                              }
                            } catch (e) {
                              console.error('Error deleting video:', e)
                              alert('Error deleting video')
                            }
                          }}
                          className="btn px-4 py-2 animate-button-hover"
                          title="Delete video"
                        >
                          🗑️ Delete
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
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 p-4 md:p-6">
            {videos.map((video, index) => {
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
                  className="transform-gpu will-change-transform video-card animate-card-enter"
                >
                  <div className="ui-card overflow-hidden ui-card-hover cursor-pointer group">
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
                        <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                          {stats.duration}
                        </div>
                        {/* Watch Status Indicator for Compact */}
                        {video.isWatched && (
                          <div className="absolute top-1 right-1">
                            <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-medium">
                              ✓
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-foreground text-xs mb-1 line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted">
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
              {videos.map((video, index) => {
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
                    className="flex-shrink-0 w-64 transform-gpu will-change-transform video-card animate-card-enter snap-start"
                  >
                    <div className="ui-card overflow-hidden ui-card-hover cursor-pointer group">
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

                        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {stats.duration}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
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

        {/* Pagination Component */}
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
              No videos imported yet. Import a YouTube video to get started.
            </p>
          </div>
        )}
      </div>

      {/* Fixed Actions Bar - Always Visible */}
      <FixedActionsBar
        onNotebookDrop={handleAddToNotebook}
        onCreateNotebook={handleCreateNotebook}
        onTagDrop={handleTagDrop}
        onDeleteDrop={handleDeleteDrop}
      />

      {/* Modals are handled by FixedActionsBar */}
    </AuthGuard>
  )
}

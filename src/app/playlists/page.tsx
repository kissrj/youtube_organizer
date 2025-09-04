'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'
import FixedActionsBar from '@/components/FixedActionsBar'
import DraggableItem from '@/components/DraggableItem'
import { useQuickActions } from '@/hooks/useQuickActions'
import SortControls, { PLAYLIST_SORT_OPTIONS } from '@/components/SortControls'

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
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
    fetchPlaylists()
    fetchCategoriesAndTags()
  }, [sortBy, sortOrder])

  const fetchPlaylists = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      })
      const response = await fetch(`/api/playlists?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
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

  const extractYouTubePlaylistId = (input: string): string | null => {
    const trimmed = input.trim()

    // If it's already a valid ID (34 characters), return as is
    const playlistRegex = /^[A-Za-z0-9_-]{34}$/
    if (playlistRegex.test(trimmed)) {
      return trimmed
    }

    // Try to extract ID from a complete URL
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
        error: 'Invalid format. Must be a 34-character ID or a YouTube URL with list parameter'
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

    // Validation and ID extraction
    const validation = validateYouTubePlaylistId(trimmedInput)
    if (!validation.isValid) {
      alert(`❌ ${validation.error}\n\n` +
            '💡 You can:\n' +
            '• Copy just the ID (34 characters)\n' +
            '• Or paste the full YouTube URL\n\n' +
            'Valid examples:\n' +
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
        const data = await response.json()
        setYoutubeId('')
        fetchPlaylists()

        const videoSyncResult = data.videoSyncResult
        if (videoSyncResult) {
          alert(`✅ Playlist added successfully!\n\n📊 Video Import Results:\n• ${videoSyncResult.imported} videos imported\n• ${videoSyncResult.skipped} videos skipped\n• ${videoSyncResult.errors} errors\n\nTotal: ${videoSyncResult.total} videos processed`)
        } else {
          alert('✅ Playlist added successfully!\n\nVideos will be imported automatically in the background.')
        }
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Error synchronizing playlist'

        // Show more user-friendly error message
        if (errorMessage.includes('Invalid playlist ID')) {
          alert('❌ Invalid playlist ID!\n\n' +
                'The ID must be exactly 34 characters.\n' +
                'Example: PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI\n\n' +
                'Make sure to copy only the ID, not the full URL.')
        } else if (errorMessage.includes('not found on YouTube')) {
          alert('❌ Playlist not found!\n\n' +
                'Check if:\n' +
                '• The playlist ID is correct\n' +
                '• The playlist is public\n' +
                '• The playlist hasn\'t been deleted\n' +
                '• You have permission to access it')
        } else if (errorMessage.includes('Access denied')) {
          alert('❌ Problem with YouTube API!\n\n' +
                'Check if:\n' +
                '• The API key is correct\n' +
                '• The daily quota hasn\'t been exceeded\n' +
                '• The YouTube Data v3 API is enabled')
        } else if (errorMessage.includes('quota')) {
          alert('❌ API quota exceeded!\n\n' +
                'The daily YouTube API quota has been exceeded.\n' +
                'Try again tomorrow or consider upgrading your plan.')
        } else {
          alert(`Erro: ${errorMessage}`)
        }

        // Show more user-friendly error message
        if (errorMessage.includes('not found or private')) {
          alert(`❌ Playlist not found!\n\n💡 Try using a known public playlist:\n\n📺 ID: PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI\n🎵 Title: Popular Music Videos\n\nOr configure OAuth to access your private playlists.`)
        } else {
          alert(`❌ Error: ${errorMessage}`)
        }
        console.error('Error synchronizing playlist:', errorMessage)
      }
    } catch (error) {
      console.error('Error synchronizing playlist:', error)

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
      console.error('Error adding category:', error)
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
      console.error('Error removing category:', error)
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
      console.error('Error adding tag:', error)
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
      console.error('Error removing tag:', error)
    }
  }

  const openOrganizer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    setShowOrganizer(true)
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

        {/* Sort Controls */}
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          sortOptions={PLAYLIST_SORT_OPTIONS}
          className="justify-end"
        />

        {/* Form to synchronize playlist */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add YouTube Playlist
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="Paste the YouTube playlist ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
            />
            <button
              onClick={syncPlaylist}
              disabled={syncLoading || !youtubeId.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncLoading ? 'Adding Playlist & Importing Videos...' : 'Add Playlist'}
            </button>
          </div>

          {/* Quick test button */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Quick test:</span>
            <button
              onClick={() => setYoutubeId('PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              Popular Music Videos
            </button>
            <span className="text-xs text-gray-500">
              (Known working public playlist)
            </span>
          </div>

          <div className="text-sm text-gray-600 mt-2 space-y-1">
            <p><strong>✅ You can paste:</strong></p>
            <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
              <div>
                <span className="font-medium text-green-800">Just the ID:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2">PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI</code>
              </div>
              <div>
                <span className="font-medium text-green-800">Or the full URL:</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-900 ml-2 break-all">https://www.youtube.com/playlist?list=PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI</code>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
              <p className="text-blue-800 font-medium">🚀 Automatic Video Import</p>
              <p className="text-blue-700 text-sm mt-1">
                When you add a playlist, all videos from that playlist will be automatically imported and tagged appropriately.
                These videos will only appear in this playlist's workspace, not in your general videos section.
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 The system will automatically extract the playlist ID from the URL if necessary.
            </p>
          </div>
        </div>

        {/* Playlist list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <DraggableItem
              key={playlist.id}
              id={playlist.id}
              type="playlist"
              title={playlist.title}
              youtubeId={playlist.youtubeId}
              className="mb-4 transform-gpu will-change-transform playlist-card animate-card-enter group"
            >
              <div
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => window.location.href = `/playlists/${playlist.id}`}
              >
                <div className="aspect-video bg-gray-200 relative">
                  {playlist.thumbnailUrl && (
                    <Image
                      src={playlist.thumbnailUrl}
                      alt={playlist.title}
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                    Click to view videos
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {playlist.channelTitle}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {playlist.itemCount} videos
                  </p>

                  {/* Categories */}
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

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => window.location.href = `/playlists/${playlist.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📺</span>
                      View Videos
                    </button>
                    <button
                      onClick={() => window.open(`https://www.youtube.com/playlist?list=${playlist.youtubeId}`, '_blank')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>▶️</span>
                      Watch
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this playlist? This action is irreversible.')) return
                        try {
                          const res = await fetch(`/api/playlists/${playlist.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            // refresh list
                            fetchPlaylists()
                          } else {
                            const err = await res.json()
                            alert(err.error || 'Error deleting playlist')
                          }
                        } catch (e) {
                          console.error('Error deleting playlist:', e)
                          alert('Error deleting playlist')
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      title="Delete playlist"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </DraggableItem>
          ))}
        </div>

        {playlists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No playlists found. Synchronize a YouTube playlist to get started.
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

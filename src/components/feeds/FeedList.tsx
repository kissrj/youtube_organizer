'use client'

import React, { useState, useEffect } from 'react'
import { FeedCard } from './FeedCard'
import { Feed, FeedSortBy, FeedSortOrder } from '@/lib/types'
import { Plus, Video } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'

interface FeedListProps {
  collectionId: string
  onFeedSelect: (feed: Feed) => void
}

export function FeedList({ collectionId, onFeedSelect }: FeedListProps) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Feed | null>(null)
  const { toast } = useToast()
  const [newFeed, setNewFeed] = useState({
    title: '',
    description: '',
    sortBy: 'RECENT' as FeedSortBy,
    sortOrder: 'DESC' as FeedSortOrder,
    isActive: true
  })

  useEffect(() => {
    loadFeeds()
  }, [collectionId])

  const loadFeeds = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/collections/${collectionId}/feeds`)
      if (response.ok) {
        const data = await response.json()
        setFeeds(data)
      } else {
        const problem = await safeParseError(response)
        setError(problem)
      }
    } catch (error) {
      console.error('Error loading feeds:', error)
      setError('Failed to load feeds. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFeed = async () => {
    if (!newFeed.title.trim()) return

    try {
      setIsCreating(true)
      setError(null)
      const response = await fetch(`/api/collections/${collectionId}/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeed)
      })

      if (response.ok) {
        const createdFeed = await response.json()
        setFeeds([...feeds, createdFeed])
        setIsCreateDialogOpen(false)
        toast({ title: 'Feed created', description: `"${createdFeed?.title || newFeed.title}" added`, variant: 'success' })
        setNewFeed({
          title: '',
          description: '',
          sortBy: 'RECENT',
          sortOrder: 'DESC',
          isActive: true
        })
      } else {
        const problem = await safeParseError(response)
        setError(problem)
        toast({ title: 'Failed to create feed', description: problem, variant: 'error' })
      }
    } catch (error) {
      console.error('Error creating feed:', error)
      const msg = 'Failed to create feed. Check your connection and try again.'
      setError(msg)
      toast({ title: 'Erro ao criar feed', description: msg, variant: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateFeed = async (id: string, data: Partial<Feed>) => {
    try {
      const response = await fetch(`/api/collections/feeds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const updatedFeed = await response.json()
        setFeeds(feeds.map(feed => feed.id === id ? updatedFeed : feed))
      }
    } catch (error) {
      console.error('Erro ao atualizar feed:', error)
    }
  }

  const confirmDelete = (feed: Feed) => {
    setToDelete(feed)
    setConfirmOpen(true)
  }

  const handleDeleteFeed = async () => {
    if (!toDelete) return
    const backup = toDelete
    try {
      const response = await fetch(`/api/collections/feeds/${backup.id}`, { method: 'DELETE' })
      if (response.ok) {
        setFeeds(feeds.filter(f => f.id !== backup.id))
        toast({
          title: 'Feed deleted',
          description: `"${backup.title}" removed`,
          actionLabel: 'Undo',
          onAction: async () => {
            try {
              const body = {
                title: backup.title,
                description: (backup as any).description || '',
                sortBy: backup.sortBy,
                sortOrder: backup.sortOrder,
                isActive: (backup as any).isActive ?? true,
              }
              const r = await fetch(`/api/collections/${collectionId}/feeds`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
              })
              if (r.ok) {
                const recreated = await r.json()
                setFeeds(prev => [...prev, recreated])
                toast({ title: 'Action undone', description: 'Feed restored', variant: 'success' })
              } else {
                toast({ title: 'Undo failed', description: 'Could not restore', variant: 'error' })
              }
            } catch {
              toast({ title: 'Undo failed', description: 'Check your connection', variant: 'error' })
            }
          },
          variant: 'success',
        })
      } else {
        const problem = await safeParseError(response)
        toast({ title: 'Delete failed', description: problem, variant: 'error' })
      }
    } catch (error) {
      console.error('Error deleting feed:', error)
      toast({ title: 'Delete failed', description: 'Network error', variant: 'error' })
    } finally {
      setToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Feeds</h2>
          <p className="text-gray-600 mt-1">Create feeds to organize videos by filters</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Feed
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3">
          {error}
        </div>
      )}

      {feeds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Video className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No feeds yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create custom feeds to organize videos by filters
          </p>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Feed
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onUpdate={handleUpdateFeed}
              onDelete={(id) => {
                const f = feeds.find(ff => ff.id === id)
                if (f) confirmDelete(f)
              }}
              onVideosClick={onFeedSelect}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Feed</h3>
              <button
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newFeed.title}
                  onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Feed name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newFeed.description}
                  onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={newFeed.sortBy}
                    onChange={(e) => setNewFeed({ ...newFeed, sortBy: e.target.value as FeedSortBy })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="RECENT">Most Recent</option>
                    <option value="VIEWS">Most Views</option>
                    <option value="LIKES">Most Likes</option>
                    <option value="COMMENTS">Most Comments</option>
                    <option value="DURATION">Duration</option>
                    <option value="RELEVANCE">Relevance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    value={newFeed.sortOrder}
                    onChange={(e) => setNewFeed({ ...newFeed, sortOrder: e.target.value as FeedSortOrder })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newFeed.isActive}
                  onChange={(e) => setNewFeed({ ...newFeed, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active feed
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateFeed}
                  disabled={!newFeed.title.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating…' : 'Create Feed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete feed"
        description={`Are you sure you want to delete "${toDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteFeed}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}

// Helper para extrair mensagem de erro de respostas não-OK
async function safeParseError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (data?.error) return data.error
  } catch {}
  return `Erro (${response.status}) ao processar a solicitação.`
}

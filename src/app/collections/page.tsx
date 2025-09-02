'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CollectionCard } from '@/components/collections/CollectionCard'
import { AddCollectionDialog } from '@/components/collections/AddCollectionDialog'
import { CollectionSettingsWithIcons } from '@/components/collections/CollectionSettingsWithIcons'
import { Collection } from '@/lib/types'
import { Plus, Settings, Rss } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Collection | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        // The API returns { success: true, data: { collections: [...], total: number, hierarchy: [...] } }
        setCollections(data.data?.collections || [])
      }
    } catch (error) {
      console.error('Error loading collections:', error)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async (data: any) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Collection created',
          description: `"${result?.data?.name || data?.name}" added successfully`,
          variant: 'success',
        })
        await loadCollections()
      } else {
        const error = await response.json()
        toast({ title: 'Failed to create collection', description: error?.error || 'Unknown error', variant: 'error' })
      }
    } catch (error) {
      toast({ title: 'Failed to create collection', description: 'Check your connection and try again.', variant: 'error' })
    }
  }

  const handleUpdateCollection = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast({ title: 'Collection updated', variant: 'success' })
        await loadCollections()
      } else {
        const error = await response.json()
        toast({ title: 'Update failed', description: error?.error || 'Unknown error', variant: 'error' })
      }
    } catch (error) {
      toast({ title: 'Update failed', description: 'Check your connection and try again.', variant: 'error' })
    }
  }

  const confirmDelete = (collection: Collection) => {
    setToDelete(collection)
    setConfirmOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!toDelete) return
    const backup = toDelete
    try {
      const response = await fetch(`/api/collections/${backup.id}`, { method: 'DELETE' })
      if (response.ok) {
        await loadCollections()
        toast({
          title: 'Collection deleted',
          description: `"${backup.name}" was removed` ,
          actionLabel: 'Undo',
          onAction: async () => {
            try {
              const body = {
                name: backup.name,
                description: backup.description,
                icon: backup.icon,
                color: backup.color,
                isPublic: backup.isPublic,
                parentId: backup.parentId,
              }
              const r = await fetch('/api/collections', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
              })
              if (r.ok) {
                await loadCollections()
                toast({ title: 'Action undone', description: 'Collection restored', variant: 'success' })
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
        const err = await response.json()
        toast({ title: 'Delete failed', description: err?.error || 'Unknown error', variant: 'error' })
      }
    } catch {
      toast({ title: 'Delete failed', description: 'Check your connection and try again.', variant: 'error' })
    } finally {
      setToDelete(null)
    }
  }

  const handleIconChange = async (icon: string) => {
    if (!selectedCollection) return
    await handleUpdateCollection(selectedCollection.id, { icon })
  }

  const handleColorChange = async (color: string) => {
    if (!selectedCollection) return
    await handleUpdateCollection(selectedCollection.id, { color })
  }

  const handleSettingsUpdate = async (settings: any) => {
    if (!selectedCollection) return
    // Here the settings update would be implemented
    console.log('Updating settings:', settings)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600 mt-1">Organize your videos, channels and playlists</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Collection
          </button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
            <p className="text-gray-600 mb-6">Create your first collection to get started</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                isSelected={selectedCollection?.id === collection.id}
                onClick={() => setSelectedCollection(collection)}
                onIconChange={handleIconChange}
                onColorChange={handleColorChange}
                onEdit={() => {
                  setSelectedCollection(collection)
                  setShowSettings(true)
                }}
                onFeeds={() => {
                  window.location.href = `/collections/${collection.id}/feeds`
                }}
                onDelete={() => confirmDelete(collection)}
              />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <AddCollectionDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleCreateCollection}
        />

        {/* Settings Panel */}
        {showSettings && selectedCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Settings - {selectedCollection.name}</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-6">
                <CollectionSettingsWithIcons
                  collection={selectedCollection}
                  onUpdate={handleSettingsUpdate}
                  onUpdateIcon={handleIconChange}
                  onUpdateColor={handleColorChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete collection"
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirmed}
        onClose={() => setConfirmOpen(false)}
      />
    </AuthGuard>
  )
}

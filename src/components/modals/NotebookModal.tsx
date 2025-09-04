'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Notebook } from 'lucide-react'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface Notebook {
  id: string
  name: string
  description?: string
  color?: string
}

interface NotebookModalProps {
  isOpen: boolean
  onClose: () => void
  draggedItem: DraggedItem | null
  onAddToNotebook: (notebookId: string, item: DraggedItem) => void
  onCreateNotebook: (name: string, description: string, item: DraggedItem) => void
}

export default function NotebookModal({
  isOpen,
  onClose,
  draggedItem,
  onAddToNotebook,
  onCreateNotebook
}: NotebookModalProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [newNotebookDescription, setNewNotebookDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      console.log('🎬 NotebookModal: Modal opened, fetching notebooks...')
      fetchNotebooks()
    }
  }, [isOpen])

  // Debug: Log notebooks state changes
  useEffect(() => {
    console.log('📝 NotebookModal: Notebooks state updated:', notebooks.length, 'notebooks')
  }, [notebooks])

  const fetchNotebooks = async () => {
    try {
      console.log('🔍 NotebookModal: Fetching notebooks...')
      const response = await fetch('/api/notebooks')
      console.log('📡 NotebookModal: Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ NotebookModal: Data received:', data)
        console.log('📊 NotebookModal: Raw data structure:', JSON.stringify(data, null, 2))

        // Extract notebooks from the response structure
        let notebooksArray: any[] = []

        if (data?.data?.notebooks && Array.isArray(data.data.notebooks)) {
          notebooksArray = data.data.notebooks
          console.log('📊 NotebookModal: Found notebooks in data.data.notebooks:', notebooksArray.length)
        } else if (data?.notebooks && Array.isArray(data.notebooks)) {
          notebooksArray = data.notebooks
          console.log('📊 NotebookModal: Found notebooks in data.notebooks:', notebooksArray.length)
        } else if (Array.isArray(data)) {
          notebooksArray = data
          console.log('📊 NotebookModal: Found notebooks as direct array:', notebooksArray.length)
        } else {
          console.log('📊 NotebookModal: No notebooks array found in response')
        }

        // Filter out invalid notebooks and ensure required fields
        const validNotebooks = notebooksArray.filter(notebook =>
          notebook &&
          typeof notebook === 'object' &&
          notebook.id &&
          notebook.name
        )

        console.log('📊 NotebookModal: Valid notebooks after filtering:', validNotebooks.length)
        console.log('📋 NotebookModal: Notebook names:', validNotebooks.map(n => n.name))

        setNotebooks(validNotebooks)
      } else {
        const errorText = await response.text()
        console.error('❌ NotebookModal: API error:', response.status, errorText)

        // Try to parse error message
        let errorMessage = 'Failed to load notebooks'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // If can't parse JSON, use the raw text
          errorMessage = errorText || errorMessage
        }

        // Show user-friendly error message
        if (response.status === 401) {
          alert('❌ Authentication required. Please log in to access your notebooks.')
        } else if (response.status === 500) {
          alert('❌ Server error. Please try again later.')
        } else {
          alert(`❌ Error loading notebooks: ${errorMessage}`)
        }

        // Set empty array on error to prevent crashes
        setNotebooks([])
      }
    } catch (error) {
      console.error('💥 NotebookModal: Network error:', error)

      // Show user-friendly network error message
      alert('❌ Network error. Please check your internet connection and try again.')

      // Set empty array on error to prevent crashes
      setNotebooks([])
    }
  }

  const handleAddToNotebook = async (notebookId: string) => {
    if (!draggedItem) return

    setLoading(true)
    try {
      await onAddToNotebook(notebookId, draggedItem)
      onClose()
    } catch (error) {
      console.error('Error adding to notebook:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('already exists') || errorMessage.includes('já está')) {
        alert('ℹ️ This video is already in the selected notebook.')
      } else if (errorMessage.includes('not found')) {
        alert('❌ Notebook or video not found. Please try again.')
      } else {
        alert(`❌ Error adding video to notebook: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotebook = async () => {
    if (!draggedItem || !newNotebookName.trim()) return

    setLoading(true)
    try {
      await onCreateNotebook(newNotebookName.trim(), newNotebookDescription.trim(), draggedItem)
      setNewNotebookName('')
      setNewNotebookDescription('')
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      console.error('Error creating notebook:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('already exists') || errorMessage.includes('já existe')) {
        alert('ℹ️ A notebook with this name already exists. Please choose a different name.')
      } else if (errorMessage.includes('required') || errorMessage.includes('obrigatório')) {
        alert('❌ Notebook name is required. Please enter a name.')
      } else {
        alert(`❌ Error creating notebook: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !draggedItem) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Notebook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add to Notebook</h2>
              <p className="text-sm text-gray-600">
                {draggedItem.type === 'video' ? 'Video' : 'Playlist'}: {draggedItem.title}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!showCreateForm ? (
            <>
              <div className="space-y-3 mb-4">
                <h3 className="font-medium text-gray-900">Select a notebook:</h3>
                {notebooks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📓</div>
                    <p className="text-sm text-gray-500 mb-2">No notebooks found.</p>
                    <p className="text-xs text-gray-400">Create your first notebook to get started!</p>
                  </div>
                ) : (
                  notebooks
                    .filter(notebook => notebook && notebook.id && notebook.name) // Filter out invalid notebooks
                    .map((notebook) => {
                      console.log('🎨 NotebookModal: Rendering notebook:', notebook.id, notebook.name)
                      return (
                        <button
                          key={notebook.id}
                          onClick={() => handleAddToNotebook(notebook.id)}
                          disabled={loading}
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: notebook.color || '#3b82f6' }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {notebook.name || 'Notebook sem nome'}
                              </div>
                              {notebook.description && (
                                <div className="text-sm text-gray-600 truncate">{notebook.description}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })
                )}
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create new notebook
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Create new notebook:</h3>

              <div>
                <Label>Name *</Label>
                <Input
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="Enter notebook name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newNotebookDescription}
                  onChange={(e) => setNewNotebookDescription(e.target.value)}
                  placeholder="Enter notebook description (optional)"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNotebook}
                  disabled={loading || !newNotebookName.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create & Add'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
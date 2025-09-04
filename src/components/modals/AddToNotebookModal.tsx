'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Notebook, X, Check } from 'lucide-react'

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

interface AddToNotebookModalProps {
  isOpen: boolean
  onClose: () => void
  draggedItem: DraggedItem | null
  onAddToNotebook: (notebookId: string, item: DraggedItem) => Promise<void>
  onCreateNotebook: (name: string, description: string, item: DraggedItem) => Promise<void>
}

export default function AddToNotebookModal({
  isOpen,
  onClose,
  draggedItem,
  onAddToNotebook,
  onCreateNotebook
}: AddToNotebookModalProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [newNotebookDescription, setNewNotebookDescription] = useState('')
  const [selectedNotebooks, setSelectedNotebooks] = useState<Set<string>>(new Set())
  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(false)

  useEffect(() => {
    if (isOpen && draggedItem) {
      fetchNotebooks()
      setSelectedNotebooks(new Set())
      setShowCreateForm(false)
      setNewNotebookName('')
      setNewNotebookDescription('')
    }
  }, [isOpen, draggedItem])

  const fetchNotebooks = async () => {
    try {
      setIsLoadingNotebooks(true)
      const response = await fetch('/api/notebooks')

      if (response.ok) {
        const data = await response.json()

        // Extract notebooks from the response structure
        let notebooksArray: any[] = []

        if (data?.data?.notebooks && Array.isArray(data.data.notebooks)) {
          notebooksArray = data.data.notebooks
        } else if (data?.notebooks && Array.isArray(data.notebooks)) {
          notebooksArray = data.notebooks
        } else if (Array.isArray(data)) {
          notebooksArray = data
        }

        // Filter out invalid notebooks and ensure required fields
        const validNotebooks = notebooksArray.filter(notebook =>
          notebook &&
          typeof notebook === 'object' &&
          notebook.id &&
          notebook.name
        )

        setNotebooks(validNotebooks)
      } else {
        const errorText = await response.text()
        console.error('Error loading notebooks:', response.status, errorText)

        // Show user-friendly error message
        if (response.status === 401) {
          alert('❌ Authentication required. Please log in to access your notebooks.')
        } else if (response.status === 500) {
          alert('❌ Server error. Please try again later.')
        } else {
          alert(`❌ Error loading notebooks: ${errorText}`)
        }

        setNotebooks([])
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('❌ Network error. Please check your internet connection and try again.')
      setNotebooks([])
    } finally {
      setIsLoadingNotebooks(false)
    }
  }

  const handleNotebookToggle = (notebookId: string) => {
    const newSelected = new Set(selectedNotebooks)
    if (newSelected.has(notebookId)) {
      newSelected.delete(notebookId)
    } else {
      newSelected.add(notebookId)
    }
    setSelectedNotebooks(newSelected)
  }

  const handleAddToSelectedNotebooks = async () => {
    if (!draggedItem || selectedNotebooks.size === 0) return

    setLoading(true)
    try {
      const promises = Array.from(selectedNotebooks).map(notebookId =>
        onAddToNotebook(notebookId, draggedItem)
      )

      await Promise.all(promises)

      // Show success message
      const itemType = draggedItem.type === 'video' ? 'Video' : 'Playlist'
      alert(`✅ ${itemType} added to ${selectedNotebooks.size} notebook${selectedNotebooks.size > 1 ? 's' : ''} successfully!`)

      onClose()
    } catch (error) {
      console.error('Error adding to notebooks:', error)
      // Error handling is done in the individual onAddToNotebook calls
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotebook = async () => {
    if (!draggedItem || !newNotebookName.trim()) return

    setLoading(true)
    try {
      await onCreateNotebook(newNotebookName.trim(), newNotebookDescription.trim(), draggedItem)

      // Show success message
      const itemType = draggedItem.type === 'video' ? 'Video' : 'Playlist'
      alert(`✅ ${itemType} added to new notebook "${newNotebookName}" successfully!`)

      setNewNotebookName('')
      setNewNotebookDescription('')
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      console.error('Error creating notebook:', error)
      // Error handling is done in onCreateNotebook
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedNotebooks(new Set())
    setShowCreateForm(false)
    setNewNotebookName('')
    setNewNotebookDescription('')
    onClose()
  }

  if (!isOpen || !draggedItem) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
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
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {!showCreateForm ? (
            <>
              {/* Existing Notebooks */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Select notebooks:</h3>
                  {selectedNotebooks.size > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedNotebooks.size} selected
                    </span>
                  )}
                </div>

                {isLoadingNotebooks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading notebooks...</p>
                  </div>
                ) : notebooks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📓</div>
                    <p className="text-sm text-gray-500 mb-2">No notebooks found.</p>
                    <p className="text-xs text-gray-400">Create your first notebook to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notebooks.map((notebook) => {
                      const isSelected = selectedNotebooks.has(notebook.id)
                      return (
                        <button
                          key={notebook.id}
                          onClick={() => handleNotebookToggle(notebook.id)}
                          disabled={loading}
                          className={`
                            w-full p-3 text-left border rounded-lg transition-all duration-200
                            ${isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center">
                              {isSelected ? (
                                <Check className="w-5 h-5 text-blue-600" />
                              ) : (
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: notebook.color || '#3b82f6' }}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {notebook.name}
                              </div>
                              {notebook.description && (
                                <div className="text-sm text-gray-600 truncate">
                                  {notebook.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {selectedNotebooks.size > 0 && (
                  <Button
                    onClick={handleAddToSelectedNotebooks}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Adding...' : `Add to ${selectedNotebooks.size} Notebook${selectedNotebooks.size > 1 ? 's' : ''}`}
                  </Button>
                )}

                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create new notebook
                </Button>
              </div>
            </>
          ) : (
            /* Create New Notebook Form */
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
                  Back
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
      </div>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Plus } from 'lucide-react'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface Tag {
  id: string
  name: string
}

interface TagModalProps {
  isOpen: boolean
  onClose: () => void
  draggedItem: DraggedItem | null
  onAddTags: (tagNames: string[], item: DraggedItem) => void
  onCreateTag: (tagName: string, item: DraggedItem) => void
}

export default function TagModal({
  isOpen,
  onClose,
  draggedItem,
  onAddTags,
  onCreateTag
}: TagModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTags()
      setSelectedTags([])
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleAddTags = async () => {
    if (!draggedItem || selectedTags.length === 0) return

    setLoading(true)
    try {
      await onAddTags(selectedTags, draggedItem)
      onClose()
    } catch (error) {
      console.error('Error adding tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!draggedItem || !newTagName.trim()) return

    setLoading(true)
    try {
      await onCreateTag(newTagName.trim(), draggedItem)
      setNewTagName('')
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      console.error('Error creating tag:', error)
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
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Tags</h2>
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
                <h3 className="font-medium text-gray-900">Select tags:</h3>
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags found. Create your first tag!</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`p-2 text-left border rounded-lg transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedTags.includes(tag.id) ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">#{tag.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create new tag
                </button>

                {selectedTags.length > 0 && (
                  <Button
                    onClick={handleAddTags}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Adding...' : `Add ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Create new tag:</h3>

              <div>
                <Label>Tag name *</Label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
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
                  onClick={handleCreateTag}
                  disabled={loading || !newTagName.trim()}
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
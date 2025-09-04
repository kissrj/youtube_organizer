'use client'

import { useState } from 'react'

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

interface Tag {
  id: string
  name: string
}

export function useQuickActions() {
  const [notebookModal, setNotebookModal] = useState<{
    isOpen: boolean
    item: DraggedItem | null
  }>({ isOpen: false, item: null })

  const [tagModal, setTagModal] = useState<{
    isOpen: boolean
    item: DraggedItem | null
  }>({ isOpen: false, item: null })

  const handleNotebookDrop = (item: DraggedItem) => {
    setNotebookModal({ isOpen: true, item })
  }

  const handleTagDrop = (item: DraggedItem) => {
    setTagModal({ isOpen: true, item })
  }

  const handleDeleteDrop = async (item: DraggedItem) => {
    try {
      const endpoint = item.type === 'video'
        ? `/api/videos/${item.id}`
        : `/api/playlists/${item.id}`

      const response = await fetch(endpoint, { method: 'DELETE' })

      if (response.ok) {
        // Refresh the page to update the list
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Error deleting ${item.type}: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(`Error deleting ${item.type}`)
    }
  }

  const handleAddToNotebook = async (notebookId: string, item: DraggedItem) => {
    try {
      const endpoint = item.type === 'video'
        ? `/api/notebooks/${notebookId}/videos`
        : `/api/notebooks/${notebookId}/playlists`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [item.type === 'video' ? 'videoId' : 'playlistId']: item.id })
      })

      if (response.ok) {
        alert(`${item.type === 'video' ? 'Video' : 'Playlist'} added to notebook successfully!`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to notebook')
      }
    } catch (error) {
      console.error('Error adding to notebook:', error)
      throw error
    }
  }

  const handleCreateNotebook = async (name: string, description: string, item: DraggedItem) => {
    try {
      // Create the notebook
      const createResponse = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || 'Failed to create notebook')
      }

      const newNotebook = await createResponse.json()

      // Add the item to the new notebook
      await handleAddToNotebook(newNotebook.data.id, item)

    } catch (error) {
      console.error('Error creating notebook:', error)
      throw error
    }
  }

  const handleAddTags = async (tagIds: string[], item: DraggedItem) => {
    try {
      const endpoint = item.type === 'video'
        ? `/api/videos/${item.id}/tags`
        : `/api/playlists/${item.id}/tags`

      const promises = tagIds.map(tagId =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId })
        })
      )

      const results = await Promise.all(promises)
      const failed = results.filter(r => !r.ok)

      if (failed.length > 0) {
        throw new Error(`Failed to add ${failed.length} tag(s)`)
      }

      alert(`Tags added to ${item.type} successfully!`)

    } catch (error) {
      console.error('Error adding tags:', error)
      throw error
    }
  }

  const handleCreateTag = async (tagName: string, item: DraggedItem) => {
    try {
      // Create the tag
      const createResponse = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName })
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || 'Failed to create tag')
      }

      const newTag = await createResponse.json()

      // Add the tag to the item
      await handleAddTags([newTag.id], item)

    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }

  const closeNotebookModal = () => {
    setNotebookModal({ isOpen: false, item: null })
  }

  const closeTagModal = () => {
    setTagModal({ isOpen: false, item: null })
  }

  return {
    // Modal states
    notebookModal,
    tagModal,

    // Handlers
    handleNotebookDrop,
    handleTagDrop,
    handleDeleteDrop,
    handleAddToNotebook,
    handleCreateNotebook,
    handleAddTags,
    handleCreateTag,

    // Modal controls
    closeNotebookModal,
    closeTagModal,
  }
}
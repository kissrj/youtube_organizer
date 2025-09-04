'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthGuard } from '@/components/AuthGuard'

interface Tag {
  id: string
  name: string
  _count: {
    videos: number
    playlists: number
  }
  playlists: Array<{
    playlist: {
      id: string
      title: string
      thumbnailUrl: string
    }
  }>
}

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tagName, setTagName] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tagName.trim()) return

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: tagName.trim() }),
      })

      if (response.ok) {
        setTagName('')
        setShowForm(false)
        fetchTags()
      }
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  const deleteTag = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTags()
      }
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {showForm ? 'Cancel' : 'New Tag'}
        </button>
      </div>

      {/* Formulário para criar tag */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Criar New Tag
          </h2>
          <form onSubmit={createTag} className="flex gap-4">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Nome da tag"
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Criar Tag
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Lista de tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/tags/${tag.id}`)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">#{tag.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTag(tag.id)
                  }}
                  className="text-red-600 hover:text-red-800 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{tag._count.videos} vídeo{tag._count.videos !== 1 ? 's' : ''}</span>
                <span>{tag._count.playlists} playlist{tag._count.playlists !== 1 ? 's' : ''}</span>
              </div>

              {/* Playlists com esta tag */}
              {tag.playlists.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Playlists relacionadas:</h4>
                  <div className="space-y-1">
                    {tag.playlists.slice(0, 2).map((pt) => (
                      <div key={pt.playlist.id} className="flex items-center space-x-2">
                        {pt.playlist.thumbnailUrl && (
                          <Image
                            src={pt.playlist.thumbnailUrl}
                            alt={pt.playlist.title}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded object-cover"
                          />
                        )}
                        <span className="text-xs text-gray-700 truncate">
                          {pt.playlist.title}
                        </span>
                      </div>
                    ))}
                    {tag.playlists.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{tag.playlists.length - 2} mais
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Call to action */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-blue-600 hover:text-blue-800">
                  Ver todos os vídeos →
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma tag encontrada. Crie sua primeira tag para começar a organizar suas playlists.
          </p>
        </div>
      )}
      </div>
    </AuthGuard>
  )
}


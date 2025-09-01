'use client'

import React, { useState, useEffect } from 'react'
import { FeedCard } from './FeedCard'
import { Feed, FeedSortBy, FeedSortOrder } from '@/lib/types'
import { Plus, Video } from 'lucide-react'

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
      console.error('Erro ao carregar feeds:', error)
      setError('Falha ao carregar feeds. Tente novamente.')
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
      }
    } catch (error) {
      console.error('Erro ao criar feed:', error)
      setError('Falha ao criar o feed. Verifique sua conexão e tente novamente.')
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

  const handleDeleteFeed = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este feed?')) return

    try {
      const response = await fetch(`/api/collections/feeds/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFeeds(feeds.filter(feed => feed.id !== id))
      }
    } catch (error) {
      console.error('Erro ao excluir feed:', error)
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
          <h2 className="text-2xl font-bold text-gray-900">Feeds Personalizados</h2>
          <p className="text-gray-600 mt-1">
            Crie feeds personalizados para organizar vídeos por filtros específicos
          </p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Feed
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
            Nenhum feed personalizado criado ainda
          </h3>
          <p className="text-gray-600 mb-6">
            Crie feeds personalizados para organizar vídeos por filtros específicos
          </p>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Primeiro Feed
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onUpdate={handleUpdateFeed}
              onDelete={handleDeleteFeed}
              onVideosClick={onFeedSelect}
            />
          ))}
        </div>
      )}

      {/* Modal de criação */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Criar Novo Feed</h3>
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
                  Título *
                </label>
                <input
                  type="text"
                  value={newFeed.title}
                  onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do feed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newFeed.description}
                  onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={newFeed.sortBy}
                    onChange={(e) => setNewFeed({ ...newFeed, sortBy: e.target.value as FeedSortBy })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="RECENT">Mais Recente</option>
                    <option value="VIEWS">Mais Visualizações</option>
                    <option value="LIKES">Mais Curtidas</option>
                    <option value="COMMENTS">Mais Comentários</option>
                    <option value="DURATION">Duração</option>
                    <option value="RELEVANCE">Relevância</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <select
                    value={newFeed.sortOrder}
                    onChange={(e) => setNewFeed({ ...newFeed, sortOrder: e.target.value as FeedSortOrder })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DESC">Decrescente</option>
                    <option value="ASC">Crescente</option>
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
                  Feed ativo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateFeed}
                  disabled={!newFeed.title.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Criando…' : 'Criar Feed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

'use client'

import React, { useState } from 'react'
import { Feed, FeedSortBy, FeedSortOrder } from '@/lib/types'
import { Trash2, Edit, Save, X, Play, Pause } from 'lucide-react'

interface FeedCardProps {
  feed: Feed
  onUpdate: (id: string, data: Partial<Feed>) => void
  onDelete: (id: string) => void
  onVideosClick: (feed: Feed) => void
}

export function FeedCard({ feed, onUpdate, onDelete, onVideosClick }: FeedCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedFeed, setEditedFeed] = useState({
    title: feed.title,
    description: feed.description || '',
    sortBy: feed.sortBy,
    sortOrder: feed.sortOrder,
    isActive: feed.isActive
  })

  const handleSave = () => {
    onUpdate(feed.id, editedFeed)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedFeed({
      title: feed.title,
      description: feed.description || '',
      sortBy: feed.sortBy,
      sortOrder: feed.sortOrder,
      isActive: feed.isActive
    })
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedFeed.title}
                onChange={(e) => setEditedFeed({ ...editedFeed, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título do feed"
              />
              <textarea
                value={editedFeed.description}
                onChange={(e) => setEditedFeed({ ...editedFeed, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição opcional"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{feed.title}</h3>
              {feed.description && (
                <p className="text-gray-600 text-sm">{feed.description}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!feed.isActive && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              Inativo
            </span>
          )}
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Salvar"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                title="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onVideosClick(feed)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Ver vídeos"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(feed.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={editedFeed.sortBy}
                onChange={(e) => setEditedFeed({ ...editedFeed, sortBy: e.target.value as FeedSortBy })}
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
                value={editedFeed.sortOrder}
                onChange={(e) => setEditedFeed({ ...editedFeed, sortOrder: e.target.value as FeedSortOrder })}
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
              id={`active-${feed.id}`}
              checked={editedFeed.isActive}
              onChange={(e) => setEditedFeed({ ...editedFeed, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor={`active-${feed.id}`} className="ml-2 text-sm text-gray-700">
              Feed ativo
            </label>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Ordenar: {getSortByLabel(feed.sortBy)} {getSortOrderLabel(feed.sortOrder)}</span>
            <span>Limit: {feed.limit}</span>
          </div>
          <span className="text-xs">
            Criado em {new Date(feed.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )}
    </div>
  )
}

function getSortByLabel(sortBy: FeedSortBy): string {
  const labels = {
    RECENT: 'Recente',
    VIEWS: 'Visualizações',
    LIKES: 'Curtidas',
    COMMENTS: 'Comentários',
    DURATION: 'Duração',
    RELEVANCE: 'Relevância'
  }
  return labels[sortBy]
}

function getSortOrderLabel(sortOrder: FeedSortOrder): string {
  return sortOrder === 'DESC' ? '↓' : '↑'
}

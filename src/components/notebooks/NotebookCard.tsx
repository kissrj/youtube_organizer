// src/components/notebooks/NotebookCard.tsx
'use client'

import React from 'react'
import { Collection } from '@/lib/types'
import { NotebookIcon } from './NotebookIcon'
import { Folder, MoreVertical, Edit, Trash2, Play, Users, List, Rss } from 'lucide-react'

interface NotebookCardProps {
  notebook: Collection
  isSelected: boolean
  onClick: () => void
  onIconChange?: (icon: string) => void
  onColorChange?: (color: string) => void
  onEdit?: () => void
  onDelete?: () => void
  onFeeds?: () => void
}

export function NotebookCard({
  notebook,
  isSelected,
  onClick,
  onIconChange,
  onColorChange,
  onEdit,
  onDelete,
  onFeeds
}: NotebookCardProps) {
  const itemCount = (notebook._count?.videos || 0) + (notebook._count?.channels || 0) + (notebook._count?.playlists || 0)
  const hasChildren = notebook.children && notebook.children.length > 0

  return (
    <div
      className={`notebook-card bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      {/* Header with icon and color */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-105">
            <NotebookIcon
              icon={notebook.icon}
              color={notebook.color}
              onIconChange={() => {}}
              onColorChange={() => {}}
              size="lg"
              editable={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{notebook.name}</h3>
            {notebook.description && (
              <p className="text-sm text-gray-600 truncate">{notebook.description}</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">{notebook._count?.videos || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Videos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{notebook._count?.channels || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Channels</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">{notebook._count?.playlists || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Playlists</div>
          </div>
        </div>

        {/* Total count and actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <div className="flex items-center gap-1">
            {onFeeds && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFeeds()
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Manage Feeds"
              >
                <Rss className="w-4 h-4 text-orange-600" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
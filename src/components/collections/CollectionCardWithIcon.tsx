'use client'

import React from 'react'
import { Collection } from '@/lib/types'
import { CollectionIcon } from './CollectionIcon'
import { Folder, MoreVertical, Edit, Trash2, Play, Users, List } from 'lucide-react'
import { iconComponents } from '../icons/iconComponents'

interface CollectionCardWithIconProps {
  collection: Collection
  isSelected: boolean
  onClick: () => void
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  onEdit?: () => void
  onDelete?: () => void
}

export function CollectionCardWithIcon({
  collection,
  isSelected,
  onClick,
  onIconChange,
  onColorChange,
  onEdit,
  onDelete
}: CollectionCardWithIconProps) {
  const itemCount = (collection._count?.videos || 0) + (collection._count?.channels || 0) + (collection._count?.playlists || 0)
  const hasChildren = collection.children && collection.children.length > 0

  const IconComponent = iconComponents[collection.icon || 'folder'] || iconComponents.folder

  return (
    <div
      className={`collection-card bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      {/* Cabeçalho com ícone e cor */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{ backgroundColor: collection.color ? `${collection.color}20` : '#f3f4f6' }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-gray-600 truncate">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">{collection._count?.videos || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Vídeos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{collection._count?.channels || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Canais</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">{collection._count?.playlists || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Playlists</div>
          </div>
        </div>

        {/* Contagem total e ações */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

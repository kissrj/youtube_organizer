// src/components/collections/CollectionItem.tsx
'use client'

import React from 'react'
import { Collection } from '@/lib/types'
import { MoreVertical, Edit, Trash2, Folder, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'

interface CollectionItemProps {
  collection: Collection
  level: number
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onSelect: (collection: Collection) => void
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
  isSelected: boolean
  expandedIds: Set<string>
}

export function CollectionItem({
  collection,
  level,
  isExpanded,
  onToggleExpand,
  onSelect,
  onUpdate,
  onDelete,
  isSelected,
  expandedIds
}: CollectionItemProps) {
  const hasChildren = collection.children && collection.children.length > 0
  const itemCount = (collection._count?.videos || 0) + (collection._count?.channels || 0) + (collection._count?.playlists || 0)

  return (
    <div className="collection-item">
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(collection)}
      >
        {/* Botão de expansão */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(collection.id)
            }}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
          </button>
        )}

        {/* Ícone da coleção */}
        <div className="w-6 h-6 flex items-center justify-center">
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <Folder className="w-4 h-4 text-gray-600" />
          )}
        </div>

        {/* Nome e contagem */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{collection.name}</div>
          {itemCount > 0 && (
            <div className="text-xs text-gray-500">{itemCount} itens</div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(collection.id, collection)
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(collection.id)
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Coleções filhas */}
      {hasChildren && isExpanded && (
        <div className="children">
          {collection.children!.map(child => (
            <CollectionItem
              key={child.id}
              collection={child}
              level={level + 1}
              isExpanded={expandedIds.has(child.id)}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isSelected={isSelected}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Collection } from '@/lib/types'
import { CollectionTree } from './CollectionTree'
import { DraggableCollectionItem } from '../dnd/DraggableCollectionItem'
import { DroppableCollectionArea } from '../dnd/DroppableCollectionArea'
import { DragHandle } from '../dnd/DragHandle'
import { Folder, FolderOpen, Edit, Trash2 } from 'lucide-react'

interface CollectionTreeWithDndProps {
  collections: Collection[]
  onCollectionSelect: (collection: Collection) => void
  onCollectionCreate: (data: any) => void
  onCollectionUpdate: (id: string, data: any) => void
  onCollectionDelete: (id: string) => void
  onCollectionMove: (collectionId: string, newParentId: string, newPosition: number) => void
  onItemMove: (itemId: string, itemType: string, targetCollectionId: string) => void
  selectedCollectionId?: string
  isLoading?: boolean
  error?: string | null
}

export function CollectionTreeWithDnd({
  collections,
  onCollectionSelect,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  onCollectionMove,
  onItemMove,
  selectedCollectionId,
  isLoading = false,
  error = null
}: CollectionTreeWithDndProps) {
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const handleDrop = (itemId: string, targetCollectionId: string) => {
    if (draggedItem) {
      if (draggedItem.type === 'collection') {
        onCollectionMove(draggedItem.id, targetCollectionId, 0)
      } else {
        onItemMove(draggedItem.id, draggedItem.type, targetCollectionId)
      }
      setDraggedItem(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const rootCollections = collections.filter(c => !c.parentId)

  const renderCollectionItem = (collection: Collection, level: number) => (
    <DraggableCollectionItem
      key={collection.id}
      collection={collection}
      onDragStart={(item) => setDraggedItem(item)}
      onDragEnd={() => setDraggedItem(null)}
    >
      <DroppableCollectionArea
        collectionId={collection.id}
        onDrop={handleDrop}
        showDropZone={true}
      >
        <div className="collection-item">
          <div
            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedCollectionId === collection.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => onCollectionSelect(collection)}
          >
            <DragHandle itemId={collection.id} itemType="collection" />

            {/* Botão de expansão */}
            {collection.children && collection.children.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(collection.id)
                }}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
              >
                {expandedIds.has(collection.id) ? (
                  <FolderOpen className="w-3 h-3 text-blue-600" />
                ) : (
                  <Folder className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}

            {/* Nome e contagem */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{collection.name}</div>
              {(collection._count?.videos || 0) + (collection._count?.channels || 0) + (collection._count?.playlists || 0) > 0 && (
                <div className="text-xs text-gray-500">
                  {(collection._count?.videos || 0) + (collection._count?.channels || 0) + (collection._count?.playlists || 0)} itens
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCollectionUpdate(collection.id, collection)
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCollectionDelete(collection.id)
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors text-red-600"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Coleções filhas */}
          {collection.children && collection.children.length > 0 && expandedIds.has(collection.id) && (
            <div className="children">
              {collection.children.map(child => renderCollectionItem(child, level + 1))}
            </div>
          )}
        </div>
      </DroppableCollectionArea>
    </DraggableCollectionItem>
  )

  if (isLoading) {
    return (
      <div className="collection-tree bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="collection-tree bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-red-600 text-center">
          <p>Erro ao carregar coleções: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="collection-tree bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Minhas Coleções</h2>
        <button
          onClick={() => onCollectionCreate({})}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+ Nova Coleção</span>
        </button>
      </div>

      <div className="space-y-1">
        {rootCollections.map(collection => renderCollectionItem(collection, 0))}
      </div>
    </div>
  )
}

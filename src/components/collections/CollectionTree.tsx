// src/components/collections/CollectionTree.tsx
'use client'

import React, { useState } from 'react'
import { Collection } from '@/lib/types'
import { CollectionItem } from './CollectionItem'
import { AddCollectionDialog } from './AddCollectionDialog'

interface CollectionTreeProps {
  collections: Collection[]
  onCollectionSelect: (collection: Collection) => void
  onCollectionCreate: (data: any) => void
  onCollectionUpdate: (id: string, data: any) => void
  onCollectionDelete: (id: string) => void
  selectedCollectionId?: string
  isLoading?: boolean
  error?: string | null
}

export function CollectionTree({
  collections,
  onCollectionSelect,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  selectedCollectionId,
  isLoading = false,
  error = null
}: CollectionTreeProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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

  if (isLoading) {
    return (
      <div className="collection-tree">
        <div className="flex justify-between items-center mb-4 p-4">
          <h2 className="text-lg font-semibold">Minhas Coleções</h2>
          <div className="animate-pulse bg-gray-200 rounded px-3 py-1">
            <span className="text-gray-500">Carregando...</span>
          </div>
        </div>
        <div className="space-y-1 p-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-2 bg-gray-50 rounded animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="collection-tree">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="collection-tree bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Minhas Coleções</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+ Nova Coleção</span>
        </button>
      </div>

      <div className="space-y-1 p-4">
        {rootCollections.map(collection => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            level={0}
            isExpanded={expandedIds.has(collection.id)}
            onToggleExpand={toggleExpand}
            onSelect={onCollectionSelect}
            onUpdate={onCollectionUpdate}
            onDelete={onCollectionDelete}
            isSelected={selectedCollectionId === collection.id}
            expandedIds={expandedIds}
          />
        ))}
      </div>

      <AddCollectionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={onCollectionCreate}
      />
    </div>
  )
}

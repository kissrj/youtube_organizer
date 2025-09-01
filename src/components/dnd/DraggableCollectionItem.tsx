'use client'

import React from 'react'
import { Collection } from '@/lib/types'

// Type definitions for react-dnd
type UseDragType = (spec: any) => [{ isDragging: boolean }, React.RefObject<any>]

// Dynamic import
let useDrag: UseDragType | null = null

try {
  const dnd = require('react-dnd')
  useDrag = dnd.useDrag
} catch (error) {
  console.warn('react-dnd not installed yet')
}

interface DraggableCollectionItemProps {
  collection: Collection
  children: React.ReactNode
  isExpanded?: boolean
  isSelected?: boolean
  onDragStart?: (collection: Collection) => void
  onDragEnd?: () => void
}

export function DraggableCollectionItem({
  collection,
  children,
  isExpanded = false,
  isSelected = false,
  onDragStart,
  onDragEnd
}: DraggableCollectionItemProps) {
  // Fallback if react-dnd isn't available
  if (!useDrag) {
    return <div className="draggable-collection-item">{children}</div>
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'collection',
    item: {
      id: collection.id,
      type: 'collection',
      name: collection.name,
      parentId: collection.parentId
    },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: () => {
      onDragEnd?.()
    }
  }))

  return (
    <div
      ref={drag}
      className={`draggable-collection-item transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ cursor: 'move' }}
      onMouseEnter={() => onDragStart?.(collection)}
    >
      {children}
    </div>
  )
}

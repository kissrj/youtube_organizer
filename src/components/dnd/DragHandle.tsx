'use client'

import React from 'react'
import { GripVertical } from 'lucide-react'

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

interface DragHandleProps {
  itemId: string
  itemType: 'collection' | 'video' | 'channel' | 'playlist'
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function DragHandle({
  itemId,
  itemType,
  onDragStart,
  onDragEnd
}: DragHandleProps) {
  // Fallback if react-dnd isn't available
  if (!useDrag) {
    return (
      <div className="drag-handle cursor-grab">
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
    )
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: { id: itemId, type: itemType },
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
      className={`drag-handle cursor-grab transition-colors ${
        isDragging ? 'cursor-grabbing opacity-50' : 'hover:bg-gray-200'
      }`}
      onMouseDown={onDragStart}
    >
      <GripVertical className="w-4 h-4 text-gray-500" />
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Collection } from '@/lib/types'
import { PlusCircle } from 'lucide-react'

// Type definitions for react-dnd
type UseDropType = (spec: any) => [{ isOver: boolean; canDrop: boolean }, React.RefObject<any>]

// Dynamic import
let useDrop: UseDropType | null = null

try {
  const dnd = require('react-dnd')
  useDrop = dnd.useDrop
} catch (error) {
  console.warn('react-dnd not installed yet')
}

interface DroppableCollectionAreaProps {
  collectionId: string
  children: React.ReactNode
  onDrop: (itemId: string, targetCollectionId: string) => void
  canDrop?: boolean
  isOver?: boolean
  showDropZone?: boolean
}

export function DroppableCollectionArea({
  collectionId,
  children,
  onDrop,
  canDrop = true,
  isOver = false,
  showDropZone = true
}: DroppableCollectionAreaProps) {
  // Fallback if react-dnd isn't available
  if (!useDrop) {
    return <div className="droppable-area">{children}</div>
  }

  const [{ isOver: isDragOver }, drop] = useDrop(() => ({
    accept: ['collection', 'video', 'channel', 'playlist'],
    drop: (item: any, monitor: any) => {
      console.log('🎯 COLLECTION DROP - Detailed Debug:', {
        item,
        targetCollectionId: collectionId,
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        clientOffset: monitor.getClientOffset(),
        timestamp: new Date().toISOString()
      })
      
      onDrop(item.id, collectionId)
      return { success: true, collectionId }
    },
    hover: (item: any, monitor: any) => {
      console.log('🔄 HOVER over collection:', {
        item: item.id,
        collection: collectionId,
        isOver: monitor.isOver()
      })
    },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (item: any) => {
      const canAccept = canDrop && item.id !== collectionId
      console.log('🔍 Collection can drop check:', {
        itemId: item.id,
        collectionId,
        canDrop,
        canAccept
      })
      return canAccept
    }
  }))

  const [isHovered, setIsHovered] = useState(false)

  const showDropIndicator = isDragOver || isOver || isHovered

  return (
    <div
      ref={drop}
      className={`droppable-area relative ${
        showDropIndicator ? 'bg-blue-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {showDropZone && showDropIndicator && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center bg-blue-50 bg-opacity-50">
          <div className="flex items-center gap-2 text-blue-600">
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Soltar aqui</span>
          </div>
        </div>
      )}
    </div>
  )
}

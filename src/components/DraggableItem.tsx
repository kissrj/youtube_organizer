'use client'

import React from 'react'
import { useDrag } from 'react-dnd'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface DraggableItemProps {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
  children: React.ReactNode
  className?: string
}

export default function DraggableItem({
  id,
  type,
  title,
  youtubeId,
  children,
  className = ''
}: DraggableItemProps) {
  const dragItem: DraggedItem = {
    id,
    type,
    title,
    youtubeId
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: type, // Use o tipo real do item (video ou playlist)
    item: () => {
      console.log('🚀 DRAG START - Detailed Debug:', {
        item: dragItem,
        type,
        timestamp: new Date().toISOString()
      })
      return dragItem
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      const didDrop = monitor.didDrop()

      console.log('🎯 DRAG END - Detailed Debug:', {
        item: dragItem,
        didDrop,
        dropResult,
        clientOffset: monitor.getClientOffset(),
        differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
        sourceClientOffset: monitor.getSourceClientOffset(),
        timestamp: new Date().toISOString()
      })

      if (!didDrop) {
        console.log('🚫 Drag was cancelled or dropped outside valid drop zone')
      } else if (dropResult) {
        console.log('✅ Drag completed successfully:', dropResult)
      }
    },
  }), [dragItem, type, id, title, youtubeId])


  return (
    <div
      ref={drag as any}
      className={`
        ${isDragging ? 'opacity-70 scale-105 shadow-2xl' : 'opacity-100'}
        cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        ${isDragging ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${className}
      `}
      style={{
        transform: isDragging ? 'rotate(3deg) scale(1.02)' : 'none',
      }}
    >
      {children}
    </div>
  )
}
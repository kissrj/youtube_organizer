'use client'

import React from 'react'
import { DragDropIndicator } from './DragDropIndicator'

// Type definitions for react-dnd
type UseDragType = (spec: any) => [{ isDragging: boolean }, React.RefObject<any>]
type UseDropType = (spec: any) => [{ isOver: boolean; canDrop: boolean }, React.RefObject<any>]

// Dynamic imports
let useDrag: UseDragType | null = null
let useDrop: UseDropType | null = null

try {
  const dnd = require('react-dnd')
  useDrag = dnd.useDrag
  useDrop = dnd.useDrop
} catch (error) {
  console.warn('react-dnd not installed yet')
}

interface DragDropContainerProps {
  id: string
  children: React.ReactNode
  onDrop: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void
  type: 'collection' | 'video' | 'channel' | 'playlist'
  showDropZones?: boolean
}

export function DragDropContainer({
  id,
  children,
  onDrop,
  type,
  showDropZones = true
}: DragDropContainerProps) {
  // Fallback if react-dnd isn't available
  if (!useDrag || !useDrop) {
    return <div className="relative">{children}</div>
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: () => {
      console.log('🚀 DRAG START - Container:', { id, type })
      return { id, type }
    },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      console.log('🎯 DRAG END - Container:', {
        item,
        didDrop: monitor.didDrop(),
        dropResult: monitor.getDropResult()
      })
    }
  }))

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: type,
    drop: (item: any, monitor: any) => {
      console.log('🎯 CONTAINER DROP:', {
        draggedItem: item,
        targetId: id,
        targetType: type,
        isOver: monitor.isOver()
      })
      
      if (item.id !== id) {
        onDrop(item.id, id, 'inside')
      }
      return { success: true, targetId: id }
    },
    hover: (item: any, monitor: any) => {
      if (item.id !== id) {
        console.log('🔄 HOVER over container:', {
          draggedId: item.id,
          targetId: id
        })
      }
    },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (item: any) => {
      const canAccept = item.id !== id
      console.log('🔍 Container can drop check:', {
        draggedId: item.id,
        targetId: id,
        canAccept
      })
      return canAccept
    }
  }))

  return (
    <div ref={drop} className="relative">
      {showDropZones && (
        <>
          <DragDropIndicator
            position="top"
            isActive={isOver && canDrop}
            onDrop={() => onDrop('', id, 'before')}
          />
          <DragDropIndicator
            position="bottom"
            isActive={isOver && canDrop}
            onDrop={() => onDrop('', id, 'after')}
          />
        </>
      )}
      <div ref={drag} className={`transition-all duration-200 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  )
}

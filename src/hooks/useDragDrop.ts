import { useState, useCallback } from 'react'

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

interface DragDropItem {
  id: string
  type: 'collection' | 'video' | 'channel' | 'playlist'
  name?: string
  parentId?: string
}

interface DragDropResult {
  isDragging: boolean
  isOver: boolean
  canDrop: boolean
  drag: any
  drop: any
  item: DragDropItem | null
}

export function useDragDrop(
  itemType: string,
  item: DragDropItem,
  onDrop?: (targetId: string) => void
): DragDropResult {
  const [currentItem, setCurrentItem] = useState<DragDropItem | null>(null)

  // Fallback if react-dnd isn't available
  if (!useDrag || !useDrop) {
    return {
      isDragging: false,
      isOver: false,
      canDrop: false,
      drag: null,
      drop: null,
      item: currentItem
    }
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item,
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: () => {
      setCurrentItem(null)
    }
  }))

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: itemType,
    drop: (droppedItem: DragDropItem) => {
      if (onDrop && droppedItem.id !== item.id) {
        onDrop(item.id)
      }
    },
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (droppedItem: DragDropItem) => droppedItem.id !== item.id
  }))

  return {
    isDragging,
    isOver,
    canDrop,
    drag,
    drop,
    item: currentItem
  }
}

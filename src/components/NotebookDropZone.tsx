'use client'

import React, { useState } from 'react'
import { useDrop } from 'react-dnd'
import { Notebook, Plus } from 'lucide-react'
import AddToNotebookModal from '@/components/modals/AddToNotebookModal'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface NotebookDropZoneProps {
  onAddToNotebook: (notebookId: string, item: DraggedItem) => Promise<void>
  onCreateNotebook: (name: string, description: string, item: DraggedItem) => Promise<void>
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function NotebookDropZone({
  onAddToNotebook,
  onCreateNotebook,
  className = '',
  size = 'md'
}: NotebookDropZoneProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['video', 'playlist'],
    drop: (item: DraggedItem, monitor) => {
      console.log('🎯 NotebookDropZone: Drop detected!', { item })
      if (monitor.canDrop()) {
        console.log('✅ NotebookDropZone: Opening modal for', item.type)
        setDraggedItem(item)
        setIsModalOpen(true)
      }
      return { success: true, acceptedType: item.type }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (item: DraggedItem) => ['video', 'playlist'].includes(item.type)
  }), [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setDraggedItem(null)
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <>
      <div
        ref={drop as any}
        className={`
          relative group cursor-pointer transition-all duration-200 ease-out
          ${isOver ? 'scale-110' : 'hover:scale-105'}
          ${canDrop ? 'ring-2 ring-blue-400 ring-opacity-60' : ''}
          ${className}
        `}
        title="Drop here to add to notebook"
      >
        {/* Main Icon */}
        <div className={`
          ${sizeClasses[size]}
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-200 flex items-center justify-center
          border-2 border-white/20 backdrop-blur-sm
          bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500
        `}>
          <Notebook className={`${iconSizeClasses[size]} text-white`} />
        </div>

        {/* Hover Indicator */}
        {isOver && (
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
        )}

        {/* Drop Indicator */}
        <div className="
          absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full
          flex items-center justify-center text-white text-xs font-bold
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          shadow-lg border-2 border-white
        ">
          <Plus className="w-3 h-3" />
        </div>

        {/* Tooltip */}
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover:opacity-100 transition-all duration-200
          pointer-events-none z-50
        ">
          <div className="
            bg-black/90 backdrop-blur-sm text-white text-xs
            px-2 py-1 rounded shadow-lg whitespace-nowrap
            border border-white/10
          ">
            Add to Notebook
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddToNotebookModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        draggedItem={draggedItem}
        onAddToNotebook={onAddToNotebook}
        onCreateNotebook={onCreateNotebook}
      />
    </>
  )
}
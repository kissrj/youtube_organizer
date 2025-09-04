'use client'

import React, { useState } from 'react'
import { useDrop } from 'react-dnd'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AnimatedNotebook, AnimatedTag, AnimatedTrash } from '@/components/icons/AnimatedIcons'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface QuickActionsBarProps {
  onNotebookDrop: (item: DraggedItem) => void
  onTagDrop: (item: DraggedItem) => void
  onDeleteDrop: (item: DraggedItem) => void
  className?: string
  variant?: 'fixed' | 'inline'
}

interface DropZoneProps {
  children: React.ReactNode
  onDrop: (item: DraggedItem) => void
  accept: string[]
  className?: string
}

function DropZone({ children, onDrop, accept, className = '' }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept,
    drop: (item: DraggedItem, monitor) => {
      console.log('🎯 DROP ZONE - Detailed Debug:', {
        item,
        acceptedTypes: accept,
        canDrop: accept.includes(item.type),
        isOver: monitor.isOver(),
        clientOffset: monitor.getClientOffset(),
        timestamp: new Date().toISOString()
      })
      
      if (accept.includes(item.type)) {
        console.log('✅ Item type accepted, calling onDrop')
        onDrop(item)
      } else {
        console.warn('❌ Item type not accepted:', item.type, 'Accepted:', accept)
      }
      
      return { success: true, acceptedType: item.type }
    },
    hover: (item: DraggedItem, monitor) => {
      console.log('🔄 HOVER over drop zone:', {
        item: item.type,
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (item: DraggedItem) => {
      const canAccept = accept.includes(item.type)
      console.log('🔍 Can drop check:', { itemType: item.type, accept, canAccept })
      return canAccept
    }
  }), [accept, onDrop])

  return (
    <div
      ref={drop as any}
      className={`
        relative transition-all duration-300 ease-out
        ${isOver ? 'scale-125 shadow-2xl' : ''}
        ${canDrop ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
        ${className}
      `}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded-full animate-pulse" />
      )}
      {canDrop && !isOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-full animate-pulse" />
      )}
    </div>
  )
}

export default function QuickActionsBar({
  onNotebookDrop,
  onTagDrop,
  onDeleteDrop,
  className = '',
  variant = 'fixed'
}: QuickActionsBarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    item: DraggedItem | null
  }>({ open: false, item: null })

  const handleDeleteDrop = (item: DraggedItem) => {
    console.log('🗑️ Delete drop initiated:', item)
    setDeleteConfirm({ open: true, item })
  }

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      console.log('✅ Delete confirmed:', deleteConfirm.item)
      onDeleteDrop(deleteConfirm.item)
    }
    setDeleteConfirm({ open: false, item: null })
  }

  const acceptedTypes = ['video', 'playlist']

  const wrapperClass =
    variant === 'fixed'
      ? [
          'fixed top-1/2 right-8 -translate-y-1/2 z-[9999]',
          'flex flex-col pointer-events-none',
          // Responsive gaps: base → xl (retain large spacing at xl)
          'gap-8 sm:gap-12 md:gap-20 lg:gap-32 xl:gap-[25rem]',
          className,
        ].join(' ')
      : [
          'relative z-[1] flex flex-row items-center justify-center',
          // Responsive gaps for inline under title
          'gap-4 sm:gap-8 md:gap-16 lg:gap-24 xl:gap-[18.75rem]',
          className,
        ].join(' ')

  const wrapperStyle: React.CSSProperties | undefined =
    variant === 'fixed'
      ? { position: 'fixed', top: '50%', right: '32px', transform: 'translateY(-50%)', zIndex: 9999 as any }
      : undefined

  return (
    <>
      <div className={wrapperClass} style={wrapperStyle}>
        {/* Notebooks Drop Zone */}
        <DropZone
          onDrop={onNotebookDrop}
          accept={acceptedTypes}
          className="group pointer-events-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 border-2 border-white/20">
            <AnimatedNotebook className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="qa-tooltip bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap font-medium">
              <span className="text-white font-semibold" style={{color:'#fff', textShadow:'0 1px 1px rgba(0,0,0,0.2)'}}>
                Add to Notebook
              </span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-blue-600"></div>
            </div>
          </div>
        </DropZone>

        {/* Tags Drop Zone */}
        <DropZone
          onDrop={onTagDrop}
          accept={acceptedTypes}
          className="group pointer-events-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 border-2 border-white/20">
            <AnimatedTag className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="qa-tooltip bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap font-medium">
              <span className="text-white font-semibold" style={{color:'#fff', textShadow:'0 1px 1px rgba(0,0,0,0.2)'}}>
                Add Tags
              </span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-green-600"></div>
            </div>
          </div>
        </DropZone>

        {/* Trash Drop Zone */}
        <DropZone
          onDrop={handleDeleteDrop}
          accept={acceptedTypes}
          className="group pointer-events-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 border-2 border-white/20">
            <AnimatedTrash className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="qa-tooltip bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap font-medium">
              <span className="text-white font-semibold" style={{color:'#fff', textShadow:'0 1px 1px rgba(0,0,0,0.2)'}}>
                Delete Item
              </span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-red-600"></div>
            </div>
          </div>
        </DropZone>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Confirm Deletion"
        description={
          deleteConfirm.item?.type === 'playlist'
            ? `Are you sure you want to delete the playlist "${deleteConfirm.item.title}"? This will only remove the playlist itself, videos that belong to other notebooks will be preserved.`
            : `Are you sure you want to delete the video "${deleteConfirm.item?.title}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm({ open: false, item: null })}
      />
    </>
  )
}

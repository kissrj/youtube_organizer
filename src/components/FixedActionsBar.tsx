'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AnimatedNotebook, AnimatedTag, AnimatedTrash } from '@/components/icons/AnimatedIcons'
import AddToNotebookModal from '@/components/modals/AddToNotebookModal'

interface DraggedItem {
  id: string
  type: 'video' | 'playlist'
  title: string
  youtubeId?: string
}

interface FixedActionsBarProps {
  onNotebookDrop: (notebookId: string, item: DraggedItem) => Promise<void>
  onCreateNotebook: (name: string, description: string, item: DraggedItem) => Promise<void>
  onTagDrop: (item: DraggedItem) => void
  onDeleteDrop: (item: DraggedItem) => void
  className?: string
}

interface DropZoneProps {
  onDrop: (item: DraggedItem) => void
  accept: string[]
  className?: string
  tooltip: string
  gradient: string
  icon: React.ReactNode
}

function DropZone({ onDrop, accept, className = '', tooltip, gradient, icon }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept,
    drop: (item: DraggedItem, monitor) => {
      if (accept.includes(item.type)) {
        onDrop(item)
      }
      return { success: true, acceptedType: item.type }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: (item: DraggedItem) => accept.includes(item.type)
  }), [accept, onDrop])

  return (
    <div
      ref={drop as any}
      className={`
        relative group pointer-events-auto transition-all duration-300 ease-out
        ${isOver ? 'scale-125 shadow-2xl' : 'hover:scale-110'}
        ${canDrop ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
        ${className}
      `}
    >
      {/* Main Action Button */}
      <div className={`
        w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl hover:shadow-3xl
        transition-all duration-300 flex items-center justify-center cursor-pointer
        border-2 border-white/20 backdrop-blur-sm
        ${gradient}
      `}>
        <div className="group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </div>
      </div>

      {/* Tooltip */}
      <div className="
        absolute right-full mr-3 md:mr-4 top-1/2 -translate-y-1/2
        opacity-0 group-hover:opacity-100 transition-all duration-300
        pointer-events-none z-50
      ">
        <div className="
          bg-black/90 backdrop-blur-sm text-white text-xs md:text-sm
          px-3 py-2 rounded-lg shadow-xl whitespace-nowrap font-medium
          border border-white/10
        ">
          {tooltip}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/90"></div>
        </div>
      </div>

      {/* Hover Effects */}
      {isOver && (
        <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
      )}
      {canDrop && !isOver && (
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
      )}

      {/* Drag Indicator */}
      <div className="
        absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full
        flex items-center justify-center text-white text-xs font-bold
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        shadow-lg border-2 border-white
      ">
        +
      </div>
    </div>
  )
}

export default function FixedActionsBar({
  onNotebookDrop,
  onCreateNotebook,
  onTagDrop,
  onDeleteDrop,
  className = ''
}: FixedActionsBarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    item: DraggedItem | null
  }>({ open: false, item: null })

  const [notebookModal, setNotebookModal] = useState<{
    open: boolean
    item: DraggedItem | null
  }>({ open: false, item: null })

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')

  const handleNotebookDrop = (item: DraggedItem) => {
    setNotebookModal({ open: true, item })
  }

  const handleDeleteDrop = (item: DraggedItem) => {
    setDeleteConfirm({ open: true, item })
  }

  const confirmDelete = () => {
    if (deleteConfirm.item) {
      onDeleteDrop(deleteConfirm.item)
    }
    setDeleteConfirm({ open: false, item: null })
  }

  const closeNotebookModal = () => {
    setNotebookModal({ open: false, item: null })
  }

  // Scroll detection for auto-hide/show
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const direction = currentScrollY > lastScrollY ? 'down' : 'up'

    // Show bar when scrolling up or at top
    if (direction !== scrollDirection) {
      setScrollDirection(direction)
      if (direction === 'up' || currentScrollY < 100) {
        setIsVisible(true)
      } else if (currentScrollY > 200) {
        // Hide when scrolling down and not at top
        setIsVisible(false)
      }
    }

    setLastScrollY(currentScrollY)
  }, [lastScrollY, scrollDirection])

  useEffect(() => {
    let ticking = false

    const updateScroll = () => {
      handleScroll()
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [handleScroll])

  // Show bar on mouse movement near right edge
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isNearRightEdge = e.clientX > window.innerWidth - 120
      const isInMiddle = e.clientY > 100 && e.clientY < window.innerHeight - 100

      if (isNearRightEdge && isInMiddle) {
        setIsVisible(true)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const acceptedTypes = ['video', 'playlist']

  return (
    <>
      {/* Fixed Actions Bar */}
      <div className={`
        fixed top-1/2 right-4 md:right-6 lg:right-8 -translate-y-1/2 z-[9999]
        flex flex-col pointer-events-none
        gap-6 md:gap-8 lg:gap-10
        transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}>

        {/* Notebooks Action */}
        <DropZone
          onDrop={handleNotebookDrop}
          accept={acceptedTypes}
          tooltip="Add to Notebook 📓"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
          icon={<AnimatedNotebook className="w-6 h-6 md:w-8 md:h-8 text-white" />}
        />

        {/* Tags Action */}
        <DropZone
          onDrop={onTagDrop}
          accept={acceptedTypes}
          tooltip="Add Tags 🏷️"
          gradient="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
          icon={<AnimatedTag className="w-6 h-6 md:w-8 md:h-8 text-white" />}
        />

        {/* Delete Action */}
        <DropZone
          onDrop={handleDeleteDrop}
          accept={acceptedTypes}
          tooltip="Delete Item 🗑️"
          gradient="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500"
          icon={<AnimatedTrash className="w-6 h-6 md:w-8 md:h-8 text-white" />}
        />

        {/* Scroll Indicator */}
        <div className="
          absolute -left-12 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          pointer-events-none
        ">
          <div className="
            bg-black/80 backdrop-blur-sm text-white text-xs
            px-2 py-1 rounded shadow-lg whitespace-nowrap
            border border-white/10
          ">
            Scroll to show/hide
          </div>
        </div>
      </div>

      {/* Floating Indicator when Hidden */}
      {!isVisible && (
        <div className="
          fixed top-1/2 right-2 -translate-y-1/2 z-[9998]
          w-3 h-12 bg-gradient-to-b from-blue-500 to-red-500
          rounded-full opacity-60 hover:opacity-100
          transition-opacity duration-300 cursor-pointer
          shadow-lg border border-white/20
        "
        onClick={() => setIsVisible(true)}
        title="Show actions bar"
        />
      )}

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

      {/* Add to Notebook Modal */}
      <AddToNotebookModal
        isOpen={notebookModal.open}
        onClose={closeNotebookModal}
        draggedItem={notebookModal.item}
        onAddToNotebook={onNotebookDrop}
        onCreateNotebook={onCreateNotebook}
      />
    </>
  )
}
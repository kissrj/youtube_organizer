'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import QuickActionsBar from './QuickActionsBar'
import NotebookModal from './modals/NotebookModal'
import TagModal from './modals/TagModal'
import { useQuickActions } from '@/hooks/useQuickActions'

interface QuickActionsProviderProps {
  children: React.ReactNode
  portalSelector?: string | null
  barVariant?: 'fixed' | 'inline'
}

export default function QuickActionsProvider({ children, portalSelector = null, barVariant = 'fixed' }: QuickActionsProviderProps) {
  const {
    notebookModal,
    tagModal,
    handleNotebookDrop,
    handleTagDrop,
    handleDeleteDrop,
    handleAddToNotebook,
    handleCreateNotebook,
    handleAddTags,
    handleCreateTag,
    closeNotebookModal,
    closeTagModal,
  } = useQuickActions()

  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (typeof document !== 'undefined' && portalSelector) {
      const el = document.querySelector(portalSelector) as HTMLElement | null
      setPortalEl(el)
    } else {
      setPortalEl(null)
    }
  }, [portalSelector])

  const bar = (
    <QuickActionsBar
      onNotebookDrop={handleNotebookDrop}
      onTagDrop={handleTagDrop}
      onDeleteDrop={handleDeleteDrop}
      variant={barVariant}
    />
  )

  return (
    <DndProvider backend={HTML5Backend}>
      {children}

      {portalEl ? createPortal(bar, portalEl) : bar}

      <NotebookModal
        isOpen={notebookModal.isOpen}
        onClose={closeNotebookModal}
        draggedItem={notebookModal.item}
        onAddToNotebook={handleAddToNotebook}
        onCreateNotebook={handleCreateNotebook}
      />

      <TagModal
        isOpen={tagModal.isOpen}
        onClose={closeTagModal}
        draggedItem={tagModal.item}
        onAddTags={handleAddTags}
        onCreateTag={handleCreateTag}
      />
    </DndProvider>
  )
}

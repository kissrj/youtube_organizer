'use client'

import React from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

// Type definitions for react-dnd (will be available after installation)
type DndProviderType = React.ComponentType<{ backend: any; children: React.ReactNode }>
type HTML5BackendType = any
type TouchBackendType = any

// Dynamic imports to avoid build errors if packages aren't installed yet
let DndProvider: DndProviderType | null = null
let HTML5Backend: HTML5BackendType | null = null
let TouchBackend: TouchBackendType | null = null

try {
  // These will be available after npm install
  const dnd = require('react-dnd')
  const html5 = require('react-dnd-html5-backend')
  const touch = require('react-dnd-touch-backend')

  DndProvider = dnd.DndProvider
  HTML5Backend = html5.HTML5Backend
  TouchBackend = touch.TouchBackend
} catch (error) {
  // Fallback for development
  console.warn('react-dnd packages not installed yet. Please run: npm install react-dnd react-dnd-html5-backend react-dnd-touch-backend')
}

interface DndProviderProps {
  children: React.ReactNode
}

export function DndProviderComponent({ children }: DndProviderProps) {
  const isMobile = useIsMobile()

  // Fallback if packages aren't installed
  if (!DndProvider || !HTML5Backend || !TouchBackend) {
    return <>{children}</>
  }

  const backend = isMobile ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={backend}>
      {children}
    </DndProvider>
  )
}

'use client'

import React from 'react'

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

interface DragDropIndicatorProps {
  position: 'top' | 'bottom' | 'left' | 'right'
  isActive?: boolean
  onDrop?: () => void
}

export function DragDropIndicator({
  position,
  isActive = false,
  onDrop
}: DragDropIndicatorProps) {
  // Fallback if react-dnd isn't available
  if (!useDrag) {
    if (!isActive) return null

    const indicatorClasses = {
      top: 'top-0 left-0 right-0 h-1 bg-blue-500',
      bottom: 'bottom-0 left-0 right-0 h-1 bg-blue-500',
      left: 'left-0 top-0 bottom-0 w-1 bg-blue-500',
      right: 'right-0 top-0 bottom-0 w-1 bg-blue-500'
    }

    return (
      <div
        className={`absolute ${indicatorClasses[position]} transition-all duration-200`}
        onClick={onDrop}
      />
    )
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'indicator',
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  if (!isActive) return null

  const indicatorClasses = {
    top: 'top-0 left-0 right-0 h-1 bg-blue-500',
    bottom: 'bottom-0 left-0 right-0 h-1 bg-blue-500',
    left: 'left-0 top-0 bottom-0 w-1 bg-blue-500',
    right: 'right-0 top-0 bottom-0 w-1 bg-blue-500'
  }

  return (
    <div
      ref={drag}
      className={`absolute ${indicatorClasses[position]} transition-all duration-200 ${
        isDragging ? 'bg-blue-600' : 'bg-blue-500'
      }`}
      onClick={onDrop}
    />
  )
}

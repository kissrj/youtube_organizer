// src/components/notebooks/DefaultNotebookCard.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { DefaultNotebook } from '@/lib/data/default-notebooks'
import { iconComponents } from '../icons/iconComponents'
import { Plus, Sparkles, Play } from 'lucide-react'

interface DefaultNotebookCardProps {
  notebook: DefaultNotebook
  videoCount?: number
  isCreateNew?: boolean
  onClick: () => void
  onCreateNew?: () => void
}

export function DefaultNotebookCard({
  notebook,
  videoCount = 0,
  isCreateNew = false,
  onClick,
  onCreateNew
}: DefaultNotebookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const IconComponent = iconComponents[notebook.icon] || iconComponents.folder

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])
  const handleMouseDown = useCallback(() => setIsPressed(true), [])
  const handleMouseUp = useCallback(() => setIsPressed(false), [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isCreateNew) {
        onCreateNew?.()
      } else {
        onClick()
      }
    }
  }, [isCreateNew, onClick, onCreateNew])

  if (isCreateNew) {
    return (
      <div
        onClick={onCreateNew}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        className={`
          group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300
          hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100
          transition-all duration-300 ease-out cursor-pointer hover-lift
          ${isPressed ? 'scale-95' : ''}
          focus-ring
        `}
        role="button"
        tabIndex={0}
        aria-label="Create new notebook"
      >
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <div className={`
            w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
            flex items-center justify-center mb-4 transition-all duration-300 ease-out
            ${isHovered ? 'scale-110 shadow-lg animate-pulse-glow' : ''}
          `}>
            <Plus className="w-8 h-8 text-white transition-all duration-200 group-hover:rotate-90" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">
            Create New
          </h3>
          <p className="text-gray-600 text-sm group-hover:text-blue-600 transition-colors duration-200">
            Start a new notebook for your content
          </p>
          {isHovered && (
            <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full animate-scale-in">
              Click to create
            </div>
          )}
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl animate-fade-in" />
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      className={`
        group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl
        transition-all duration-300 ease-out cursor-pointer hover-lift
        border border-gray-100 overflow-hidden
        ${isPressed ? 'scale-95 shadow-inner' : ''}
        focus-ring
      `}
      role="button"
      tabIndex={0}
      aria-label={`Open ${notebook.name} notebook with ${videoCount} videos`}
    >
      {/* Gradient background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${notebook.color} opacity-5 group-hover:opacity-15 transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative p-6">
        {/* Header with icon and category badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`
              w-14 h-14 rounded-xl bg-gradient-to-br ${notebook.color}
              flex items-center justify-center shadow-lg transition-all duration-300 ease-out
              ${isHovered ? 'scale-110 rotate-3 shadow-xl animate-pulse-glow' : ''}
            `}
          >
            <IconComponent className="w-7 h-7 text-white drop-shadow-sm transition-all duration-200 group-hover:scale-110" />
          </div>
          <div className={`
            flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full
            text-xs font-medium text-gray-600 shadow-sm transition-all duration-200
            ${isHovered ? 'bg-white shadow-md scale-105' : ''}
          `}>
            <Sparkles className="w-3 h-3" />
            {notebook.category}
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-200 line-clamp-2">
            {notebook.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
            {notebook.description}
          </p>
        </div>

        {/* Footer with stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
              <span className="transition-colors duration-200 group-hover:text-gray-700">
                {videoCount} {videoCount === 1 ? 'video' : 'videos'}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full transition-all duration-200 group-hover:bg-gray-100">
            Default
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Action indicator */}
      {isHovered && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-scale-in">
          <Play className="w-4 h-4 text-gray-600" />
        </div>
      )}

      {/* Ripple effect on click */}
      {isPressed && (
        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-fade-in" />
      )}
    </div>
  )
}
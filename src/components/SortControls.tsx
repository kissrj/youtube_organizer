'use client'

import React from 'react'

export type SortOption = {
  value: string
  label: string
}

export type SortOrder = 'asc' | 'desc'

export interface SortControlsProps {
  sortBy: string
  sortOrder: SortOrder
  onSortByChange: (sortBy: string) => void
  onSortOrderChange: (sortOrder: SortOrder) => void
  sortOptions: SortOption[]
  className?: string
}

export default function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  sortOptions,
  className = ''
}: SortControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted mr-2">Sort by:</span>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="px-3 py-2 bg-surface border border-ui rounded-md text-fg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        className="px-3 py-2 bg-surface border border-ui rounded-md text-fg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  )
}

// Predefined sort options for different contexts
export const VIDEO_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Import Date' },
  { value: 'publishedAt', label: 'Published Date' },
  { value: 'title', label: 'Title' },
  { value: 'viewCount', label: 'Views' },
  { value: 'duration', label: 'Duration' },
]

export const PLAYLIST_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Import Date' },
  { value: 'publishedAt', label: 'Published Date' },
  { value: 'title', label: 'Title' },
  { value: 'itemCount', label: 'Video Count' },
]
'use client'

import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  placeholder?: string
  categories?: Array<{ id: string; name: string }>
  tags?: Array<{ id: string; name: string }>
}

interface SearchFilters {
  categoryId?: string
  tagId?: string
}

export default function SearchBar({
  onSearch,
  placeholder = "Search videos...",
  categories = [],
  tags = []
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  // Execute search when query or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() || Object.keys(filters).length > 0) {
        onSearch(query, filters)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [query, filters, onSearch])

  const clearSearch = () => {
    setQuery('')
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main search bar */}
      <div className="relative">
        <div className="flex items-center bg-surface border border-ui rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="pl-3">
            <Search className="h-5 w-5 text-subtle" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-3 text-fg placeholder:text-subtle bg-transparent border-0 focus:ring-0 focus:outline-none"
          />

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border-l border-ui hover:bg-surface transition-colors ${
              hasActiveFilters ? 'text-blue-600' : 'text-subtle'
            }`}
            title="Advanced filters"
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Clear button */}
          {(query || hasActiveFilters) && (
            <button
              onClick={clearSearch}
              className="p-3 border-l border-ui text-subtle hover:text-foreground hover:bg-surface transition-colors"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="mt-3 bg-surface border border-ui rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter by category */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Category
              </label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  categoryId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 bg-surface border border-ui rounded-md text-fg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by tag */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Tag
              </label>
              <select
                value={filters.tagId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  tagId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 bg-surface border border-ui rounded-md text-fg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-ui">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted">Active filters:</span>

                {filters.categoryId && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-surface border border-ui text-muted">
                    Category: {categories.find(c => c.id === filters.categoryId)?.name}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, categoryId: undefined }))}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {filters.tagId && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-surface border border-ui text-muted">
                    Tag: {tags.find(t => t.id === filters.tagId)?.name}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, tagId: undefined }))}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search tips */}
      {query && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Searching for: <strong className="text-blue-900 dark:text-blue-100">"{query}"</strong>
                {hasActiveFilters && ' with applied filters'}
              </p>
              <div className="mt-2 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Search works in titles, descriptions, channels, and tags</p>
                <p>• Use multiple words for better results</p>
                <p>• Try searching for specific terms like "tutorial", "review", or channel names</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

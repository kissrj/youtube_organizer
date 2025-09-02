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
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="pl-3">
            <Search className="h-5 w-5 text-gray-500" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none"
          />

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border-l border-gray-300 hover:bg-gray-50 transition-colors ${
              hasActiveFilters ? 'text-blue-600' : 'text-gray-500'
            }`}
            title="Advanced filters"
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Clear button */}
          {(query || hasActiveFilters) && (
            <button
              onClick={clearSearch}
              className="p-3 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="mt-3 bg-white border border-gray-300 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter by category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  categoryId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <select
                value={filters.tagId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  tagId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>

                {filters.categoryId && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
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
        <div className="mt-2 text-sm text-gray-600">
          <p>
            💡 Searching for: <strong className="text-gray-900">"{query}"</strong>
            {hasActiveFilters && ' with applied filters'}
          </p>
        </div>
      )}
    </div>
  )
}
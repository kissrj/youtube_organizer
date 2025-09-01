'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  color: string
}

interface Tag {
  id: string
  name: string
}

interface VideoFiltersProps {
  categories: Category[]
  tags: Tag[]
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

export interface FilterState {
  search: string
  categoryId: string
  tagId: string
  dateRange: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  definition: string
  dimension: string
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Data de Importação' },
  { value: 'publishedAt', label: 'Data de Publicação' },
  { value: 'title', label: 'Título' },
  { value: 'channelTitle', label: 'Canal' },
  { value: 'viewCount', label: 'Visualizações' },
  { value: 'likeCount', label: 'Curtidas' },
]

const DATE_RANGES = [
  { value: '', label: 'Todas as datas' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'old', label: 'Mais de 1 ano' },
]

const DEFINITIONS = [
  { value: '', label: 'Todas as definições' },
  { value: 'hd', label: 'HD' },
  { value: 'sd', label: 'SD' },
]

const DIMENSIONS = [
  { value: '', label: 'Todas as dimensões' },
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
]

export function VideoFilters({ categories, tags, onFiltersChange, initialFilters }: VideoFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: '',
    tagId: '',
    dateRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    definition: '',
    dimension: '',
    ...initialFilters,
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      tagId: '',
      dateRange: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      definition: '',
      dimension: '',
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    return value !== ''
  })

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        {/* Barra de busca principal */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por título, canal ou tags..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title={`Ordenar ${filters.sortOrder === 'asc' ? 'crescente' : 'decrescente'}`}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                title="Limpar filtros"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros avançados */}
        {isExpanded && (
          <div className="border-t border-gray-300 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => updateFilter('categoryId', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={filters.tagId}
                  onChange={(e) => updateFilter('tagId', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as tags</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DATE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por definição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualidade
                </label>
                <select
                  value={filters.definition}
                  onChange={(e) => updateFilter('definition', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DEFINITIONS.map(def => (
                    <option key={def.value} value={def.value}>
                      {def.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtros adicionais na segunda linha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Filtro por dimensão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensão
                </label>
                <select
                  value={filters.dimension}
                  onChange={(e) => updateFilter('dimension', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DIMENSIONS.map(dim => (
                    <option key={dim.value} value={dim.value}>
                      {dim.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Espaço reservado para filtros futuros */}
              <div></div>
              <div></div>
            </div>
          </div>
        )}

        {/* Indicador de filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros ativos:</span>

              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Busca: "{filters.search}"
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.categoryId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Categoria: {categories.find(c => c.id === filters.categoryId)?.name}
                  <button
                    onClick={() => updateFilter('categoryId', '')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.tagId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Tag: {tags.find(t => t.id === filters.tagId)?.name}
                  <button
                    onClick={() => updateFilter('tagId', '')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.dateRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Período: {DATE_RANGES.find(r => r.value === filters.dateRange)?.label}
                  <button
                    onClick={() => updateFilter('dateRange', '')}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
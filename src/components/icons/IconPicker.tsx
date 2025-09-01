'use client'

import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { iconComponents, iconCategories } from './iconComponents'

interface IconOption {
  name: string
  component: React.ComponentType<{ className?: string }>
  category: string
}

interface IconPickerProps {
  selectedIcon?: string
  selectedColor?: string
  onIconSelect: (iconName: string) => void
  onColorSelect: (color: string) => void
  onClose: () => void
  className?: string
}

export function IconPicker({
  selectedIcon = 'folder',
  selectedColor = '#3b82f6',
  onIconSelect,
  onColorSelect,
  onClose,
  className = ''
}: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  const filteredIcons = Object.entries(iconCategories)
    .flatMap(([category, icons]) =>
      icons.map(iconName => ({
        name: iconName,
        component: iconComponents[iconName],
        category
      }))
    )
  // Ignore unknown icon names not present in the icon library
  .filter(icon => Boolean(icon.component))
    .filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory
      return matchesSearch && matchesCategory
    })

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
  ]

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Selecionar Ícone e Cor</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ícones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Categories */}
          <div className="w-48 border-r overflow-y-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Categorias</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  Todos
                </button>
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Icons Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-6 gap-4">
        {filteredIcons.map((icon) => (
                <button
          key={`${icon.category}:${icon.name}`}
                  onClick={() => onIconSelect(icon.name)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedIcon === icon.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <icon.component className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-600">
                    {icon.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Cor:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                />
                <span className="text-sm text-gray-600">{selectedColor}</span>
              </div>
            </div>
            <button
              onClick={() => onColorSelect(selectedColor)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>

          {isColorPickerOpen && (
            <div className="mt-3">
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onColorSelect(color)
                      setIsColorPickerOpen(false)
                    }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

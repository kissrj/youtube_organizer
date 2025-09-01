'use client'

import React, { useState } from 'react'
import { IconPicker } from './IconPicker'
import { Edit } from 'lucide-react'
import { iconComponents } from './iconComponents'

interface IconSelectorProps {
  icon?: string
  color?: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function IconSelector({
  icon = 'folder',
  color = '#3b82f6',
  onIconChange,
  onColorChange,
  size = 'md',
  className = ''
}: IconSelectorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const IconComponent = iconComponents[icon] || iconComponents.folder

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        }`}
        onClick={() => setIsPickerOpen(true)}
      >
        <div
          className={`flex items-center justify-center rounded-lg ${sizeClasses[size]}`}
          style={{ backgroundColor: `${color}20` }}
        >
          <IconComponent className={sizeClasses[size]} style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="font-medium">Ícone</div>
          <div className="text-sm text-gray-500">{icon}</div>
        </div>
        <Edit className="w-4 h-4 text-gray-400" />
      </div>

      {isPickerOpen && (
        <IconPicker
          selectedIcon={icon}
          selectedColor={color}
          onIconSelect={(newIcon) => {
            onIconChange(newIcon)
            setIsPickerOpen(false)
          }}
          onColorChange={onColorChange}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  )
}

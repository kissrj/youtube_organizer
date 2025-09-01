'use client'

import React from 'react'
import { IconSelector } from '../icons/IconSelector'
import { iconComponents } from '../icons/iconComponents'

interface CollectionIconProps {
  icon?: string
  color?: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  className?: string
}

export function CollectionIcon({
  icon = 'folder',
  color = '#3b82f6',
  onIconChange,
  onColorChange,
  size = 'md',
  editable = true,
  className = ''
}: CollectionIconProps) {
  const IconComponent = iconComponents[icon] || iconComponents.folder

  if (!editable) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} ${className}`}
        style={{ backgroundColor: `${color}20` }}
      >
        <IconComponent className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} style={{ color }} />
      </div>
    )
  }

  return (
    <IconSelector
      icon={icon}
      color={color}
      onIconChange={onIconChange}
      onColorChange={onColorChange}
      size={size}
      className={className}
    />
  )
}

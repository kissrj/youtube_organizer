// src/components/notebooks/NotebookSettingsWithIcons.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Collection, CollectionSettings as CollectionSettingsType } from '@/lib/types'
import { NotebookIcon } from './NotebookIcon'

interface NotebookSettingsWithIconsProps {
  notebook: Collection
  onUpdate: (settings: Partial<CollectionSettingsType>) => void
  onUpdateIcon: (icon: string) => void
  onUpdateColor: (color: string) => void
  isLoading?: boolean
}

export function NotebookSettingsWithIcons({
  notebook,
  onUpdate,
  onUpdateIcon,
  onUpdateColor,
  isLoading = false
}: NotebookSettingsWithIconsProps) {
  const [settings, setSettings] = useState<CollectionSettingsType | null>(null)
  const [localSettings, setLocalSettings] = useState<Partial<CollectionSettingsType>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (notebook.settings) {
      setSettings(notebook.settings)
      setLocalSettings(notebook.settings)
    }
  }, [notebook.settings])

  const handleSettingChange = (key: keyof CollectionSettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      await onUpdate(localSettings)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="notebook-settings bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="notebook-settings bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Settings not found</div>
      </div>
    )
  }

  return (
    <div className="notebook-settings bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notebook Settings</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Customization Section */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Customization</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 block mb-2">Icon</label>
            <NotebookIcon
              icon={notebook.icon}
              color={notebook.color}
              onIconChange={onUpdateIcon}
              onColorChange={onUpdateColor}
              size="md"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: notebook.color || '#3b82f6' }}
              />
              <span className="text-sm text-gray-600">
                {notebook.color || '#3b82f6'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Feed Settings */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Video Feed</h4>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Hide watched videos</label>
          <input
            type="checkbox"
            checked={localSettings.hideWatched ?? settings.hideWatched}
            onChange={(e) => handleSettingChange('hideWatched', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Hide Shorts videos</label>
          <input
            type="checkbox"
            checked={localSettings.hideShorts ?? settings.hideShorts}
            onChange={(e) => handleSettingChange('hideShorts', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Custom feed</label>
          <input
            type="checkbox"
            checked={localSettings.customFeed ?? settings.customFeed}
            onChange={(e) => handleSettingChange('customFeed', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Notifications</h4>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Notify new videos</label>
          <input
            type="checkbox"
            checked={localSettings.notify ?? settings.notify}
            onChange={(e) => handleSettingChange('notify', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Auto synchronization</label>
          <input
            type="checkbox"
            checked={localSettings.syncEnabled ?? settings.syncEnabled}
            onChange={(e) => handleSettingChange('syncEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sorting Settings */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Sorting</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Sort by</label>
            <select
              value={localSettings.sortBy ?? settings.sortBy}
              onChange={(e) => handleSettingChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="addedAt">Date added</option>
              <option value="publishedAt">Published date</option>
              <option value="title">Title</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Order</label>
            <select
              value={localSettings.sortOrder ?? settings.sortOrder}
              onChange={(e) => handleSettingChange('sortOrder', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Limit */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">Video Limit</h4>

        <div>
          <label className="text-sm text-gray-700 block mb-1">Maximum videos (optional)</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={(localSettings.maxVideos ?? settings.maxVideos) || ''}
            onChange={(e) => handleSettingChange('maxVideos', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="No limit"
          />
        </div>
      </div>
    </div>
  )
}
// src/components/collections/CollectionSettings.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Collection, CollectionSettings as CollectionSettingsType } from '@/lib/types'

interface CollectionSettingsProps {
  collection: Collection
  onUpdate: (settings: Partial<CollectionSettingsType>) => void
  isLoading?: boolean
}

export function CollectionSettings({
  collection,
  onUpdate,
  isLoading = false
}: CollectionSettingsProps) {
  const [settings, setSettings] = useState<CollectionSettingsType | null>(null)
  const [localSettings, setLocalSettings] = useState<Partial<CollectionSettingsType>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (collection.settings) {
      setSettings(collection.settings)
      setLocalSettings(collection.settings)
    }
  }, [collection.settings])

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
      <div className="collection-settings bg-white rounded-lg shadow p-6">
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
      <div className="collection-settings bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Configurações não encontradas</div>
      </div>
    )
  }

  return (
    <div className="collection-settings bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Configurações da Coleção</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Configurações de Feed */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Feed de Vídeos</h4>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Esconder vídeos assistidos</label>
          <input
            type="checkbox"
            checked={localSettings.hideWatched ?? settings.hideWatched}
            onChange={(e) => handleSettingChange('hideWatched', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Esconder vídeos Shorts</label>
          <input
            type="checkbox"
            checked={localSettings.hideShorts ?? settings.hideShorts}
            onChange={(e) => handleSettingChange('hideShorts', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Feed personalizado</label>
          <input
            type="checkbox"
            checked={localSettings.customFeed ?? settings.customFeed}
            onChange={(e) => handleSettingChange('customFeed', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Configurações de Notificação */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Notificações</h4>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Notificar novos vídeos</label>
          <input
            type="checkbox"
            checked={localSettings.notify ?? settings.notify}
            onChange={(e) => handleSettingChange('notify', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Sincronização automática</label>
          <input
            type="checkbox"
            checked={localSettings.syncEnabled ?? settings.syncEnabled}
            onChange={(e) => handleSettingChange('syncEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Configurações de Ordenação */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2">Ordenação</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Ordenar por</label>
            <select
              value={localSettings.sortBy ?? settings.sortBy}
              onChange={(e) => handleSettingChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="addedAt">Data de adição</option>
              <option value="publishedAt">Data de publicação</option>
              <option value="title">Título</option>
              <option value="duration">Duração</option>
              <option value="views">Visualizações</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Ordem</label>
            <select
              value={localSettings.sortOrder ?? settings.sortOrder}
              onChange={(e) => handleSettingChange('sortOrder', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Limite de vídeos */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 border-b pb-2">Limite de Vídeos</h4>

        <div>
          <label className="text-sm text-gray-700 block mb-1">Máximo de vídeos (opcional)</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={localSettings.maxVideos ?? settings.maxVideos || ''}
            onChange={(e) => handleSettingChange('maxVideos', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Sem limite"
          />
        </div>
      </div>
    </div>
  )
}

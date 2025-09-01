'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CollectionCard } from '@/components/collections/CollectionCard'
import { AddCollectionDialog } from '@/components/collections/AddCollectionDialog'
import { CollectionSettingsWithIcons } from '@/components/collections/CollectionSettingsWithIcons'
import { Collection } from '@/lib/types'
import { Plus, Settings, Rss } from 'lucide-react'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        // A API retorna { success: true, data: { collections: [...], total: number, hierarchy: [...] } }
        setCollections(data.data?.collections || [])
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async (data: any) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Coleção criada:', result)
        await loadCollections()
      } else {
        const error = await response.json()
        console.error('Erro ao criar coleção:', error)
      }
    } catch (error) {
      console.error('Erro ao criar coleção:', error)
    }
  }

  const handleUpdateCollection = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Coleção atualizada:', result)
        await loadCollections()
      } else {
        const error = await response.json()
        console.error('Erro ao atualizar coleção:', error)
      }
    } catch (error) {
      console.error('Erro ao atualizar coleção:', error)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção?')) return

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Coleção excluída:', result)
        await loadCollections()
      } else {
        const error = await response.json()
        console.error('Erro ao excluir coleção:', error)
      }
    } catch (error) {
      console.error('Erro ao excluir coleção:', error)
    }
  }

  const handleIconChange = async (icon: string) => {
    if (!selectedCollection) return
    await handleUpdateCollection(selectedCollection.id, { icon })
  }

  const handleColorChange = async (color: string) => {
    if (!selectedCollection) return
    await handleUpdateCollection(selectedCollection.id, { color })
  }

  const handleSettingsUpdate = async (settings: any) => {
    if (!selectedCollection) return
    // Aqui seria implementada a atualização das configurações
    console.log('Atualizando configurações:', settings)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coleções</h1>
            <p className="text-gray-600 mt-1">
              Organize seus vídeos, canais e playlists em coleções personalizáveis
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Coleção
          </button>
        </div>

        {/* Grid de Coleções */}
        {collections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma coleção encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira coleção para começar a organizar seus conteúdos
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Coleção
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                isSelected={selectedCollection?.id === collection.id}
                onClick={() => setSelectedCollection(collection)}
                onIconChange={handleIconChange}
                onColorChange={handleColorChange}
                onEdit={() => {
                  setSelectedCollection(collection)
                  setShowSettings(true)
                }}
                onFeeds={() => {
                  window.location.href = `/collections/${collection.id}/feeds`
                }}
                onDelete={() => handleDeleteCollection(collection.id)}
              />
            ))}
          </div>
        )}

        {/* Diálogo de Criação */}
        <AddCollectionDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleCreateCollection}
        />

        {/* Painel de Configurações */}
        {showSettings && selectedCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações - {selectedCollection.name}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-6">
                <CollectionSettingsWithIcons
                  collection={selectedCollection}
                  onUpdate={handleSettingsUpdate}
                  onUpdateIcon={handleIconChange}
                  onUpdateColor={handleColorChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

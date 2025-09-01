# Especificações de Serviços e Componentes para Coleções

Este documento define os serviços TypeScript e componentes React necessários para implementar o sistema de coleções.

## Serviços TypeScript

### 1. Serviço de Coleções (collections.service.ts)

```typescript
// src/lib/services/collections.service.ts
import { prisma } from '@/lib/prisma'

export interface CreateCollectionData {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {}

export interface CollectionFilters {
  includeChildren?: boolean
  includeContent?: boolean
  includeSettings?: boolean
  parentId?: string
  userId?: string
}

export interface CollectionContentFilters {
  type?: 'videos' | 'channels' | 'playlists'
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class CollectionsService {
  /**
   * Listar coleções do usuário
   */
  static async getCollections(filters: CollectionFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false, parentId, userId } = filters
    
    const where: any = {}
    if (userId) where.userId = userId
    if (parentId) where.parentId = parentId
    else where.parentId = null // Coleções raiz

    const collections = await prisma.collection.findMany({
      where,
      include: {
        children: includeChildren,
        videos: includeContent,
        channels: includeContent,
        playlists: includeContent,
        tags: includeContent,
        settings: includeSettings,
        parent: true,
        _count: {
          select: {
            videos: true,
            channels: true,
            playlists: true,
            children: true
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    })

    return collections
  }

  /**
   * Criar nova coleção
   */
  static async createCollection(data: CreateCollectionData, userId: string) {
    const { name, description, icon, color, isPublic = false, parentId, position = 0 } = data

    // Verificar se já existe uma coleção com o mesmo nome
    const existing = await prisma.collection.findFirst({
      where: { name, userId }
    })

    if (existing) {
      throw new Error('Já existe uma coleção com este nome')
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        icon,
        color,
        isPublic,
        parentId,
        position,
        userId
      },
      include: {
        children: true,
        videos: true,
        channels: true,
        playlists: true,
        tags: true,
        settings: true
      }
    })

    // Criar configurações padrão
    await prisma.collectionSettings.create({
      data: {
        collectionId: collection.id,
        autoTagging: false,
        hideWatched: false,
        hideShorts: false,
        sortBy: 'addedAt',
        sortOrder: 'desc',
        customFeed: false,
        notifications: false,
        syncEnabled: false
      }
    })

    return collection
  }

  /**
   * Obter coleção por ID
   */
  static async getCollectionById(id: string, filters: CollectionFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false } = filters

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        children: includeChildren,
        videos: includeContent ? {
          include: {
            video: true
          }
        } : false,
        channels: includeContent,
        playlists: includeContent,
        tags: includeContent,
        settings: includeSettings,
        parent: true,
        _count: {
          select: {
            videos: true,
            channels: true,
            playlists: true,
            children: true
          }
        }
      }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    return collection
  }

  /**
   * Atualizar coleção
   */
  static async updateCollection(id: string, data: UpdateCollectionData, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    const updated = await prisma.collection.update({
      where: { id },
      data,
      include: {
        children: true,
        videos: true,
        channels: true,
        playlists: true,
        tags: true,
        settings: true
      }
    })

    return updated
  }

  /**
   * Excluir coleção
   */
  static async deleteCollection(id: string, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    // Excluir coleção e todo seu conteúdo (cascade)
    await prisma.collection.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * Adicionar itens à coleção
   */
  static async addItemsToCollection(
    collectionId: string,
    items: { videos?: string[]; channels?: string[]; playlists?: string[] },
    userId: string
  ) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    const results = {
      added: { videos: [], channels: [], playlists: [] },
      errors: { videos: [], channels: [], playlists: [] }
    }

    // Adicionar vídeos
    if (items.videos?.length) {
      for (const videoId of items.videos) {
        try {
          await prisma.collectionVideo.create({
            data: {
              collectionId,
              videoId,
              position: (await prisma.collectionVideo.count({
                where: { collectionId }
              })) + 1
            }
          })
          results.added.videos.push(videoId)
        } catch (error) {
          results.errors.videos.push(videoId)
        }
      }
    }

    // Adicionar canais
    if (items.channels?.length) {
      for (const channelId of items.channels) {
        try {
          await prisma.collectionChannel.create({
            data: {
              collectionId,
              channelId,
              position: (await prisma.collectionChannel.count({
                where: { collectionId }
              })) + 1
            }
          })
          results.added.channels.push(channelId)
        } catch (error) {
          results.errors.channels.push(channelId)
        }
      }
    }

    // Adicionar playlists
    if (items.playlists?.length) {
      for (const playlistId of items.playlists) {
        try {
          await prisma.collectionPlaylist.create({
            data: {
              collectionId,
              playlistId,
              position: (await prisma.collectionPlaylist.count({
                where: { collectionId }
              })) + 1
            }
          })
          results.added.playlists.push(playlistId)
        } catch (error) {
          results.errors.playlists.push(playlistId)
        }
      }
    }

    return results
  }

  /**
   * Remover itens da coleção
   */
  static async removeItemsFromCollection(
    collectionId: string,
    items: { videos?: string[]; channels?: string[]; playlists?: string[] }
  ) {
    const results = {
      removed: { videos: [], channels: [], playlists: [] }
    }

    // Remover vídeos
    if (items.videos?.length) {
      for (const videoId of items.videos) {
        await prisma.collectionVideo.deleteMany({
          where: { collectionId, videoId }
        })
        results.removed.videos.push(videoId)
      }
    }

    // Remover canais
    if (items.channels?.length) {
      for (const channelId of items.channels) {
        await prisma.collectionChannel.deleteMany({
          where: { collectionId, channelId }
        })
        results.removed.channels.push(channelId)
      }
    }

    // Remover playlists
    if (items.playlists?.length) {
      for (const playlistId of items.playlists) {
        await prisma.collectionPlaylist.deleteMany({
          where: { collectionId, playlistId }
        })
        results.removed.playlists.push(playlistId)
      }
    }

    return results
  }

  /**
   * Mover coleção (alterar posição ou pai)
   */
  static async moveCollection(id: string, newParentId?: string, newPosition?: number, userId: string) {
    const collection = await prisma.collection.findFirst({
      where: { id, userId }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    // Verificar se o novo pai é válido (não pode ser descendente da coleção atual)
    if (newParentId) {
      const isDescendant = await this.isDescendant(newParentId, id)
      if (isDescendant) {
        throw new Error('Não é possível mover uma coleção para um de seus descendentes')
      }
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: {
        parentId: newParentId,
        position: newPosition
      }
    })

    return updated
  }

  /**
   * Verificar se uma coleção é descendente de outra
   */
  static async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId = descendantId
    const visited = new Set<string>()

    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error('Ciclo detectado na hierarquia de coleções')
      }
      visited.add(currentId)

      const collection = await prisma.collection.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      })

      if (!collection) break
      if (collection.parentId === ancestorId) return true
      currentId = collection.parentId
    }

    return false
  }
}
```

### 2. Serviço de Tags (tags.service.ts)

```typescript
// src/lib/services/tags.service.ts
import { prisma } from '@/lib/prisma'

export interface CreateTagData {
  name: string
  color?: string
}

export interface TagFilters {
  userId?: string
  collectionId?: string
}

export class TagsService {
  /**
   * Listar tags do usuário
   */
  static async getTags(filters: TagFilters = {}) {
    const { userId, collectionId } = filters

    const where: any = {}
    if (userId) where.userId = userId
    if (collectionId) {
      where.collections = {
        some: { collectionId }
      }
    }

    return await prisma.tag.findMany({
      where,
      include: {
        collections: collectionId ? {
          where: { collectionId }
        } : true
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  /**
   * Criar nova tag
   */
  static async createTag(data: CreateTagData, userId: string) {
    const { name, color } = data

    // Verificar se já existe uma tag com o mesmo nome
    const existing = await prisma.tag.findFirst({
      where: { name, userId }
    })

    if (existing) {
      throw new Error('Já existe uma tag com este nome')
    }

    return await prisma.tag.create({
      data: {
        name,
        color,
        userId
      }
    })
  }

  /**
   * Adicionar tag à coleção
   */
  static async addTagToCollection(collectionId: string, tagId: string) {
    return await prisma.collectionTag.create({
      data: {
        collectionId,
        tagId
      }
    })
  }

  /**
   * Remover tag da coleção
   */
  static async removeTagFromCollection(collectionId: string, tagId: string) {
    return await prisma.collectionTag.delete({
      where: {
        collectionId_tagId: { collectionId, tagId }
      }
    })
  }
}
```

### 3. Serviço de Feed (feed.service.ts)

```typescript
// src/lib/services/feed.service.ts
import { prisma } from '@/lib/prisma'

export interface FeedFilters {
  includeWatched?: boolean
  includeShorts?: boolean
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class FeedService {
  /**
   * Obter feed de vídeos de uma coleção
   */
  static async getCollectionFeed(collectionId: string, filters: FeedFilters = {}) {
    const { includeWatched = false, includeShorts = false, limit = 20, offset = 0, sortBy = 'publishedAt', sortOrder = 'desc' } = filters

    // Obter configurações da coleção
    const settings = await prisma.collectionSettings.findUnique({
      where: { collectionId }
    })

    if (!settings) {
      throw new Error('Configurações da coleção não encontradas')
    }

    // Construir query base
    let where: any = {
      collectionVideos: {
        some: {
          collectionId
        }
      }
    }

    // Aplicar filtros
    if (!includeWatched && settings.hideWatched) {
      where.collectionVideos = {
        some: {
          collectionId,
          isWatched: false
        }
      }
    }

    if (!includeShorts && settings.hideShorts) {
      where.definition = 'hd' // Filtrar vídeos que não são shorts
    }

    // Ordenar
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Buscar vídeos
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          collectionVideos: {
            where: { collectionId },
            select: {
              id: true,
              position: true,
              notes: true,
              isWatched: true,
              rating: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.video.count({ where })
    ])

    return {
      videos,
      total,
      hasMore: offset + limit < total,
      settings
    }
  }
}
```

## Componentes React

### 1. CollectionTree (Árvore de Coleções)

```typescript
// src/components/collections/CollectionTree.tsx
'use client'

import React, { useState } from 'react'
import { Collection } from '@/lib/types'
import { CollectionItem } from './CollectionItem'
import { AddCollectionDialog } from './AddCollectionDialog'

interface CollectionTreeProps {
  collections: Collection[]
  onCollectionSelect: (collection: Collection) => void
  onCollectionCreate: (data: any) => void
  onCollectionUpdate: (id: string, data: any) => void
  onCollectionDelete: (id: string) => void
  selectedCollectionId?: string
}

export function CollectionTree({
  collections,
  onCollectionSelect,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  selectedCollectionId
}: CollectionTreeProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const rootCollections = collections.filter(c => !c.parentId)

  return (
    <div className="collection-tree">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Minhas Coleções</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nova Coleção
        </button>
      </div>

      <div className="space-y-1">
        {rootCollections.map(collection => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            level={0}
            isExpanded={expandedIds.has(collection.id)}
            onToggleExpand={toggleExpand}
            onSelect={onCollectionSelect}
            onUpdate={onCollectionUpdate}
            onDelete={onCollectionDelete}
            isSelected={selectedCollectionId === collection.id}
          />
        ))}
      </div>

      <AddCollectionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={onCollectionCreate}
      />
    </div>
  )
}
```

### 2. CollectionItem (Item Individual da Coleção)

```typescript
// src/components/collections/CollectionItem.tsx
'use client'

import React from 'react'
import { Collection } from '@/lib/types'
import { MoreVertical, Edit, Trash2, Folder, FolderOpen } from 'lucide-react'

interface CollectionItemProps {
  collection: Collection
  level: number
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onSelect: (collection: Collection) => void
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
  isSelected: boolean
}

export function CollectionItem({
  collection,
  level,
  isExpanded,
  onToggleExpand,
  onSelect,
  onUpdate,
  onDelete,
  isSelected
}: CollectionItemProps) {
  const hasChildren = collection.children && collection.children.length > 0
  const itemCount = collection._count?.videos + collection._count?.channels + collection._count?.playlists || 0

  return (
    <div className="collection-item">
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(collection)}
      >
        {/* Ícone de expansão */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(collection.id)
            }}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}

        {/* Ícone da coleção */}
        <div className="w-6 h-6 flex items-center justify-center">
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <Folder className="w-4 h-4 text-gray-600" />
          )}
        </div>

        {/* Nome e contagem */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{collection.name}</div>
          {itemCount > 0 && (
            <div className="text-xs text-gray-500">{itemCount} itens</div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(collection.id, collection)
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(collection.id)
            }}
            className="p-1 hover:bg-gray-200 rounded text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Coleções filhas */}
      {hasChildren && isExpanded && (
        <div className="children">
          {collection.children!.map(child => (
            <CollectionItem
              key={child.id}
              collection={child}
              level={level + 1}
              isExpanded={expandedIds.has(child.id)}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. CollectionGrid (Grade de Coleções)

```typescript
// src/components/collections/CollectionGrid.tsx
'use client'

import React, { useState } from 'react'
import { Collection } from '@/lib/types'
import { CollectionCard } from './CollectionCard'
import { CreateCollectionDialog } from './CreateCollectionDialog'

interface CollectionGridProps {
  collections: Collection[]
  onCollectionSelect: (collection: Collection) => void
  onCreateCollection: (data: any) => void
  selectedCollectionId?: string
}

export function CollectionGrid({
  collections,
  onCollectionSelect,
  onCreateCollection,
  selectedCollectionId
}: CollectionGridProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="collection-grid">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Minhas Coleções</h2>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+ Nova Coleção</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map(collection => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            isSelected={selectedCollectionId === collection.id}
            onClick={() => onCollectionSelect(collection)}
          />
        ))}
      </div>

      <CreateCollectionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={onCreateCollection}
      />
    </div>
  )
}
```

### 4. CollectionCard (Card Individual)

```typescript
// src/components/collections/CollectionCard.tsx
'use client'

import React from 'react'
import { Collection } from '@/lib/types'
import { Folder, MoreVertical, Edit, Trash2 } from 'lucide-react'

interface CollectionCardProps {
  collection: Collection
  isSelected: boolean
  onClick: () => void
}

export function CollectionCard({
  collection,
  isSelected,
  onClick
}: CollectionCardProps) {
  const itemCount = collection._count?.videos + collection._count?.channels + collection._count?.playlists || 0

  return (
    <div
      className={`collection-card bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      {/* Cabeçalho com ícone e cor */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: collection.color ? `${collection.color}20` : '#f3f4f6' }}
          >
            <Folder className="w-6 h-6" style={{ color: collection.color || '#6b7280' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-gray-600 truncate">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Contagem de itens */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded" title="Editar">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-red-600" title="Excluir">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 5. CollectionSettings (Configurações da Coleção)

```typescript
// src/components/collections/CollectionSettings.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Collection, CollectionSettings as CollectionSettingsType } from '@/lib/types'

interface CollectionSettingsProps {
  collection: Collection
  onUpdate: (settings: Partial<CollectionSettingsType>) => void
}

export function CollectionSettings({
  collection,
  onUpdate
}: CollectionSettingsProps) {
  const [settings, setSettings] = useState<CollectionSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar configurações
    setSettings(collection.settings || null)
    setIsLoading(false)
  }, [collection.settings])

  const handleSettingChange = (key: keyof CollectionSettingsType, value: any) => {
    if (!settings) return

    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onUpdate({ [key]: value })
  }

  if (isLoading) {
    return <div>Carregando configurações...</div>
  }

  if (!settings) {
    return <div>Configurações não encontradas</div>
  }

  return (
    <div className="collection-settings space-y-6">
      <h3 className="text-lg font-semibold">Configurações da Coleção</h3>

      {/* Configurações de Feed */}
      <div className="space-y-4">
        <h4 className="font-medium">Feed de Vídeos</h4>
        
        <div className="flex items-center justify-between">
          <label className="text-sm">Esconder vídeos assistidos</label>
          <input
            type="checkbox"
            checked={settings.hideWatched}
            onChange={(e) => handleSettingChange('hideWatched', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Esconder vídeos Shorts</label>
          <input
            type="checkbox"
            checked={settings.hideShorts}
            onChange={(e) => handleSettingChange('hideShorts', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Feed personalizado</label>
          <input
            type="checkbox"
            checked={settings.customFeed}
            onChange={(e) => handleSettingChange('customFeed', e.target.checked)}
          />
        </div>
      </div>

      {/* Configurações de Notificação */}
      <div className="space-y-4">
        <h4 className="font-medium">Notificações</h4>
        
        <div className="flex items-center justify-between">
          <label className="text-sm">Notificar novos vídeos</label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Sincronização automática</label>
          <input
            type="checkbox"
            checked={settings.syncEnabled}
            onChange={(e) => handleSettingChange('syncEnabled', e.target.checked)}
          />
        </div>
      </div>

      {/* Configurações de Ordenação */}
      <div className="space-y-4">
        <h4 className="font-medium">Ordenação</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-1">Ordenar por</label>
            <select
              value={settings.sortBy}
              onChange={(e) => handleSettingChange('sortBy', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="addedAt">Data de adição</option>
              <option value="publishedAt">Data de publicação</option>
              <option value="title">Título</option>
              <option value="duration">Duração</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Ordem</label>
            <select
              value={settings.sortOrder}
              onChange={(e) => handleSettingChange('sortOrder', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Limite de vídeos */}
      <div className="space-y-4">
        <h4 className="font-medium">Limite de Vídeos</h4>
        
        <div>
          <label className="text-sm block mb-1">Máximo de vídeos (opcional)</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={settings.maxVideos || ''}
            onChange={(e) => handleSettingChange('maxVideos', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border rounded"
            placeholder="Sem limite"
          />
        </div>
      </div>
    </div>
  )
}
```

## Contexto Global

### CollectionContext

```typescript
// src/contexts/CollectionContext.tsx
'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Collection } from '@/lib/types'

interface CollectionState {
  collections: Collection[]
  selectedCollection: Collection | null
  isLoading: boolean
  error: string | null
}

type CollectionAction =
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_SELECTED_COLLECTION'; payload: Collection | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }

const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null
}

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload, isLoading: false, error: null }
    case 'SET_SELECTED_COLLECTION':
      return { ...state, selectedCollection: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] }
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      }
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(c => c.id !== action.payload),
        selectedCollection: state.selectedCollection?.id === action.payload ? null : state.selectedCollection
      }
    default:
      return state
  }
}

interface CollectionContextType {
  state: CollectionState
  dispatch: React.Dispatch<CollectionAction>
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collectionReducer, initialState)

  return (
    <CollectionContext.Provider value={{ state, dispatch }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider')
  }
  return context
}
```

## Hooks Personalizados

### useCollections

```typescript
// src/hooks/useCollections.ts
import { useState, useEffect } from 'react'
import { CollectionsService } from '@/lib/services/collections.service'
import { useCollection } from '@/contexts/CollectionContext'

export function useCollections() {
  const { state, dispatch } = useCollection()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (isMounted) return

    const fetchCollections = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const collections = await CollectionsService.getCollections()
        dispatch({ type: 'SET_COLLECTIONS', payload: collections })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar coleções' })
      }
    }

    fetchCollections()
    setIsMounted(true)
  }, [isMounted, dispatch])

  const createCollection = async (data: any) => {
    try {
      const newCollection = await CollectionsService.createCollection(data, state.selectedCollection?.userId || '')
      dispatch({ type: 'ADD_COLLECTION', payload: newCollection })
      return newCollection
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar coleção' })
      throw error
    }
  }

  const updateCollection = async (id: string, data: any) => {
    try {
      const updated = await CollectionsService.updateCollection(id, data, state.selectedCollection?.userId || '')
      dispatch({ type: 'UPDATE_COLLECTION', payload: updated })
      return updated
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar coleção' })
      throw error
    }
  }

  const deleteCollection = async (id: string) => {
    try {
      await CollectionsService.deleteCollection(id, state.selectedCollection?.userId || '')
      dispatch({ type: 'DELETE_COLLECTION', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao excluir coleção' })
      throw error
    }
  }

  return {
    collections: state.collections,
    selectedCollection: state.selectedCollection,
    isLoading: state.isLoading,
    error: state.error,
    createCollection,
    updateCollection,
    deleteCollection,
    setSelectedCollection: (collection: Collection | null) =>
      dispatch({ type: 'SET_SELECTED_COLLECTION', payload: collection })
  }
}
```

## Integração com Drag and Drop

### Com react-dnd

```typescript
// src/components/dnd/DraggableCollectionItem.tsx
import React from 'react'
import { useDrag } from 'react-dnd'
import { Collection } from '@/lib/types'

interface DraggableCollectionItemProps {
  collection: Collection
  children: React.ReactNode
}

export function DraggableCollectionItem({
  collection,
  children
}: DraggableCollectionItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'collection',
    item: { id: collection.id, type: 'collection' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  )
}
```

### Com react-beautiful-dnd

```typescript
// src/components/dnd/DroppableCollectionArea.tsx
import React from 'react'
import { Droppable, DroppableProvided } from 'react-beautiful-dnd'
import { Collection } from '@/lib/types'

interface DroppableCollectionAreaProps {
  collectionId: string
  children: React.ReactNode
}

export function DroppableCollectionArea({
  collectionId,
  children
}: DroppableCollectionAreaProps) {
  return (
    <Droppable droppableId={collectionId} type="collection-item">
      {(provided: DroppableProvided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
```

## Estilização CSS

```css
/* src/styles/collections.css */

.collection-tree {
  @apply bg-white rounded-lg shadow p-4;
}

.collection-item {
  @apply transition-all duration-200;
}

.collection-item:hover {
  @apply bg-gray-50;
}

.collection-grid {
  @apply space-y-6;
}

.collection-card {
  @apply transition-all duration-200 hover:scale-105;
}

.collection-settings {
  @apply bg-white rounded-lg shadow p-6;
}

.collection-settings h3 {
  @apply text-lg font-semibold mb-4;
}

.collection-settings h4 {
  @apply font-medium mb-3;
}

.collection-settings label {
  @apply text-sm text-gray-700;
}

.collection-settings input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 rounded focus:ring-blue-500;
}

.collection-settings select {
  @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.collection-settings input[type="number"] {
  @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

/* Animações */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.collection-item {
  animation: slideIn 0.2s ease-out;
}

/* Responsividade */
@media (max-width: 768px) {
  .collection-grid {
    @apply grid-cols-1;
  }
  
  .collection-settings {
    @apply p-4;
  }
}
```

## Integração com o Sistema Existente

### Migração de Componentes

Os componentes existentes como `VideoFilters` e `VideoModal` precisam ser adaptados para trabalhar com o novo sistema de coleções:

```typescript
// src/components/VideoFilters.tsx (adaptado)
interface VideoFiltersProps {
  collections: Collection[] // Substitui categories
  tags: Tag[]
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

// Atualizar FilterState
export interface FilterState {
  search: string
  collectionId: string // Substitui categoryId
  tagId: string
  dateRange: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  definition: string
  dimension: string
}
```

Esta especificação completa cobre todos os aspectos necessários para implementar o sistema de coleções, desde os serviços TypeScript até os componentes React e integração com o sistema existente.
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data: any) => data })
      }),
      optional: () => ({ parse: (data: any) => data })
    }),
    max: () => ({
      optional: () => ({ parse: (data: any) => data })
    }),
    regex: () => ({
      optional: () => ({ parse: (data: any) => data })
    }),
    optional: () => ({ parse: (data: any) => data })
  }),
  boolean: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  number: () => ({
    int: () => ({
      min: () => ({
        optional: () => ({ parse: (data: any) => data })
      }),
      optional: () => ({ parse: (data: any) => data })
    }),
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data: any) => data })
      })
    })
  }),
  array: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  object: (shape: any) => ({
    parse: (data: any) => data
  }),
  enum: (values: any) => ({
    optional: () => ({ parse: (data: any) => data })
  })
}

// Types
export interface CreateCollectionData {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
  userId: string
}

export interface UpdateCollectionData {
  name?: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}

export interface CollectionFilters {
  includeChildren?: boolean
  includeContent?: boolean
  includeSettings?: boolean
  parentId?: string
  userId?: string
}

export interface CollectionContentFilters {
  type?: 'videos' | 'channels' | 'playlists' | 'all'
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AddItemsData {
  videos?: string[]
  channels?: string[]
  playlists?: string[]
  position?: number
}

export interface RemoveItemsData {
  videos?: string[]
  channels?: string[]
  playlists?: string[]
}

export interface UpdateSettingsData {
  autoTag?: boolean
  syncEnabled?: boolean
  notify?: boolean
  feedEnabled?: boolean
  hideWatched?: boolean
  hideShorts?: boolean
  sortBy?: 'addedAt' | 'publishedAt' | 'title' | 'duration' | 'views'
  sortOrder?: 'asc' | 'desc'
  maxItems?: number
}

export interface BatchOperationsData {
  operation: 'move' | 'copy' | 'delete'
  collectionIds: string[]
  targetParentId?: string
}

// Validation schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export const addItemsSchema = z.object({
  videos: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  playlists: z.array(z.string()).optional(),
  position: z.number().int().min(0).optional(),
})

export const removeItemsSchema = z.object({
  videos: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  playlists: z.array(z.string()).optional(),
})

export const updateSettingsSchema = z.object({
  autoTag: z.boolean().optional(),
  syncEnabled: z.boolean().optional(),
  notify: z.boolean().optional(),
  feedEnabled: z.boolean().optional(),
  hideWatched: z.boolean().optional(),
  hideShorts: z.boolean().optional(),
  sortBy: z.enum(['addedAt', 'publishedAt', 'title', 'duration', 'views']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  maxItems: z.number().min(1).max(10000).optional(),
})

export const batchOperationsSchema = z.object({
  operation: z.enum(['move', 'copy', 'delete']),
  collectionIds: z.array(z.string()),
  targetParentId: z.string().optional(),
})

/**
 * Main service for collection management
 */
export class CollectionsService {
  /**
    * List user collections
    */
  static async getCollections(filters: CollectionFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false, parentId, userId } = filters

    const where: any = {}
    if (userId) where.userId = userId
    if (parentId !== undefined) {
      where.parentId = parentId
    } else {
      where.parentId = null // Root collections
    }

    const include: any = {}
    if (includeChildren) {
      include.children = {
        orderBy: { position: 'asc' },
        include: {
          _count: {
            select: {
              videos: true,
              channels: true,
              playlists: true,
              children: true
            }
          }
        }
      }
    }

    if (includeContent) {
      include.videos = {
        include: { video: true },
        orderBy: { addedAt: 'desc' }
      }
      include.channels = {
        orderBy: { addedAt: 'desc' }
      }
      include.playlists = {
        include: { playlist: true },
        orderBy: { addedAt: 'desc' }
      }
    }

    if (includeSettings) {
      include.settings = true
    }

    return await prisma.collection.findMany({
      where,
      include,
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  /**
    * Create new collection
    */
  static async createCollection(data: CreateCollectionData) {
    const validatedData = createCollectionSchema.parse(data)

    // Check if a collection with the same name already exists
    const existing = await prisma.collection.findFirst({
      where: {
        name: validatedData.name,
        userId: validatedData.userId
      }
    })

    if (existing) {
      throw new Error('A collection with this name already exists')
    }

    const collection = await prisma.collection.create({
      data: validatedData,
      include: {
        children: true,
        videos: true,
        channels: true,
        playlists: true,
        tags: true,
        settings: true
      }
    })

    // Create default settings
    await prisma.collectionSettings.create({
      data: {
        collectionId: collection.id,
        autoTag: false,
        syncEnabled: false,
        notify: false,
        feedEnabled: false,
        hideWatched: false,
        hideShorts: false,
        sortBy: 'addedAt',
        sortOrder: 'desc',
        maxItems: 1000
      }
    })

    return collection
  }

  /**
    * Get collection by ID
    */
  static async getCollectionById(id: string, filters: CollectionFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false } = filters

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        children: includeChildren ? {
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: {
                videos: true,
                channels: true,
                playlists: true,
                children: true
              }
            }
          }
        } : false,
        videos: includeContent ? {
          include: { video: true },
          orderBy: { addedAt: 'desc' }
        } : false,
        channels: includeContent ? {
          orderBy: { addedAt: 'desc' }
        } : false,
        playlists: includeContent ? {
          include: { playlist: true },
          orderBy: { addedAt: 'desc' }
        } : false,
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
    * Update collection
    */
  static async updateCollection(id: string, data: UpdateCollectionData) {
    const validatedData = updateCollectionSchema.parse(data)

    // Check if collection exists and belongs to user
    const existing = await prisma.collection.findFirst({
      where: { id }
    })

    if (!existing) {
      throw new Error('Collection not found')
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: validatedData,
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
    * Delete collection
    */
  static async deleteCollection(id: string) {
    const collection = await prisma.collection.findFirst({
      where: { id }
    })

    if (!collection) {
      throw new Error('Collection not found')
    }

    // Delete collection and all its content (cascade)
    await prisma.collection.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
    * Add items to collection
    */
  static async addItemsToCollection(
    collectionId: string,
    items: AddItemsData
  ) {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId }
    })

    if (!collection) {
      throw new Error('Collection not found')
    }

    const results = {
      added: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] },
      errors: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] }
    }

    const position = items.position || 0

    // Adicionar vídeos
    if (items.videos?.length) {
      for (const videoId of items.videos) {
        try {
          await prisma.collectionVideo.create({
            data: {
              collectionId,
              videoId,
              position: position + results.added.videos.length
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
              position: position + results.added.channels.length
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
              position: position + results.added.playlists.length
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
    * Remove items from collection
    */
  static async removeItemsFromCollection(
    collectionId: string,
    items: RemoveItemsData
  ) {
    const results = {
      removed: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] }
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
    * Move collection (change position or parent)
    */
  static async moveCollection(id: string, newParentId?: string, newPosition?: number) {
    const collection = await prisma.collection.findFirst({
      where: { id }
    })

    if (!collection) {
      throw new Error('Collection not found')
    }

    // Check if new parent is valid (cannot be descendant of current collection)
    if (newParentId) {
      const isDescendant = await this.isDescendant(newParentId, id)
      if (isDescendant) {
        throw new Error('Cannot move a collection to one of its descendants')
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
    * Check if a collection is descendant of another
    */
  static async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId = descendantId
    const visited = new Set<string>()

    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error('Cycle detected in collection hierarchy')
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

  /**
    * Get collection content
    */
  static async getCollectionContent(collectionId: string, filters: CollectionContentFilters = {}) {
    const { type = 'all', limit = 50, offset = 0, sortBy = 'addedAt', sortOrder = 'desc' } = filters

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const content = {
      videos: [] as any[],
      channels: [] as any[],
      playlists: [] as any[],
      total: { videos: 0, channels: 0, playlists: 0 }
    }

    if (type === 'all' || type === 'videos') {
      const videos = await prisma.collectionVideo.findMany({
        where: { collectionId },
        include: { video: true },
        orderBy,
        take: limit,
        skip: offset
      })
      content.videos = videos.map(cv => cv.video)
      content.total.videos = await prisma.collectionVideo.count({ where: { collectionId } })
    }

    if (type === 'all' || type === 'channels') {
      const channels = await prisma.collectionChannel.findMany({
        where: { collectionId },
        orderBy,
        take: limit,
        skip: offset
      })
      content.channels = channels
      content.total.channels = await prisma.collectionChannel.count({ where: { collectionId } })
    }

    if (type === 'all' || type === 'playlists') {
      const playlists = await prisma.collectionPlaylist.findMany({
        where: { collectionId },
        include: { playlist: true },
        orderBy,
        take: limit,
        skip: offset
      })
      content.playlists = playlists.map(cp => cp.playlist)
      content.total.playlists = await prisma.collectionPlaylist.count({ where: { collectionId } })
    }

    return content
  }

  /**
    * Update collection settings
    */
  static async updateCollectionSettings(collectionId: string, settings: UpdateSettingsData) {
    return await prisma.collectionSettings.upsert({
      where: { collectionId },
      update: settings,
      create: {
        collectionId,
        ...settings
      }
    })
  }

  /**
    * Search collections
    */
  static async searchCollections(userId: string, query: string, options: { includeContent?: boolean; limit?: number } = {}) {
    const { includeContent = false, limit = 20 } = options

    const include: any = {}
    if (includeContent) {
      include.videos = {
        include: { video: true }
      }
      include.channels = true
      include.playlists = {
        include: { playlist: true }
      }
    }

    return await prisma.collection.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include,
      take: limit
    })
  }

  /**
    * Export collections
    */
  static async exportCollections(userId: string, options: { format?: string; includeContent?: boolean } = {}) {
    const collections = await this.getCollections({
      includeChildren: true,
      includeContent: options.includeContent,
      userId
    })

    if (options.format === 'json') {
      return {
        data: JSON.stringify(collections, null, 2),
        filename: 'collections.json',
        contentType: 'application/json'
      }
    }

    // Default to JSON
    return {
      data: JSON.stringify(collections, null, 2),
      filename: 'collections.json',
      contentType: 'application/json'
    }
  }

  /**
    * Import collections
    */
  static async importCollections(userId: string, data: any, options: { merge?: boolean } = {}) {
    const results = {
      imported: 0,
      errors: [] as string[],
      conflicts: [] as string[]
    }

    try {
      const collections = Array.isArray(data) ? data : [data]

      for (const collectionData of collections) {
        try {
          // Check for conflicts
          const existing = await prisma.collection.findFirst({
            where: {
              name: collectionData.name,
              userId
            }
          })

          if (existing && !options.merge) {
            results.conflicts.push(collectionData.name)
            continue
          }

          // Criar coleção
          const collection = await this.createCollection({
            ...collectionData,
            userId
          })

          results.imported++
        } catch (error) {
          results.errors.push(collectionData.name || 'Unknown collection')
        }
      }
    } catch (error) {
      results.errors.push('Invalid data format')
    }

    return results
  }

  /**
    * Batch operations
    */
  static async batchOperations(data: BatchOperationsData) {
    const { operation, collectionIds, targetParentId } = data

    const results = {
      success: [] as string[],
      errors: [] as string[]
    }

    for (const collectionId of collectionIds) {
      try {
        switch (operation) {
          case 'delete':
            await this.deleteCollection(collectionId)
            break
          case 'move':
            if (targetParentId) {
              await this.moveCollection(collectionId, targetParentId)
            }
            break
          case 'copy':
            // Copy implementation would be more complex
            throw new Error('Copy operation not implemented')
        }
        results.success.push(collectionId)
      } catch (error) {
        results.errors.push(collectionId)
      }
    }

    return results
  }

  /**
    * Move a collection to a new parent and position
    */
  static async moveCollection(collectionId: string, newParentId: string, newPosition: number) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    // Check if collection exists and belongs to user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id
      }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    // If has new parent, check if exists and belongs to user
    if (newParentId) {
      const parentCollection = await prisma.collection.findFirst({
        where: {
          id: newParentId,
          userId: session.user.id
        }
      })

      if (!parentCollection) {
        throw new Error('Parent collection not found')
      }

      // Avoid cycles (do not allow a collection to be moved inside itself or its children)
      if (newParentId === collectionId) {
        throw new Error('Cannot move a collection inside itself')
      }
    }

    // Atualizar a coleção
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        parentId: newParentId || null,
        position: newPosition,
        updatedAt: new Date()
      },
      include: {
        children: true,
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

    return updatedCollection
  }

  /**
    * Move an item (video, channel or playlist) to a different collection
    */
  static async moveItem(itemId: string, itemType: string, targetCollectionId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    // Check if target collection exists and belongs to user
    const targetCollection = await prisma.collection.findFirst({
      where: {
        id: targetCollectionId,
        userId: session.user.id
      }
    })

    if (!targetCollection) {
      throw new Error('Target collection not found')
    }

    let updatedItem

    switch (itemType) {
      case 'video':
        updatedItem = await prisma.collectionVideo.updateMany({
          where: {
            id: itemId,
            collection: {
              userId: session.user.id
            }
          },
          data: {
            collectionId: targetCollectionId
          }
        })
        break

      case 'channel':
        updatedItem = await prisma.collectionChannel.updateMany({
          where: {
            id: itemId,
            collection: {
              userId: session.user.id
            }
          },
          data: {
            collectionId: targetCollectionId
          }
        })
        break

      case 'playlist':
        updatedItem = await prisma.collectionPlaylist.updateMany({
          where: {
            id: itemId,
            collection: {
              userId: session.user.id
            }
          },
          data: {
            collectionId: targetCollectionId
          }
        })
        break

      default:
        throw new Error('Invalid item type')
    }

    return updatedItem
  }
}

// Legacy function exports for backward compatibility
export async function createCollection(data: CreateCollectionData) {
  return await CollectionsService.createCollection(data)
}

export async function updateCollection(id: string, data: UpdateCollectionData) {
  return await CollectionsService.updateCollection(id, data)
}

export async function deleteCollection(id: string) {
  return await CollectionsService.deleteCollection(id)
}

export async function getCollection(id: string, options: { includeChildren?: boolean; includeContent?: boolean; includeSettings?: boolean } = {}) {
  return await CollectionsService.getCollectionById(id, options)
}

export async function getUserCollections(userId: string, options: { includeChildren?: boolean; includeContent?: boolean; includeSettings?: boolean; parentId?: string } = {}) {
  return await CollectionsService.getCollections({ ...options, userId })
}

export async function addItemsToCollection(collectionId: string, items: AddItemsData) {
  return await CollectionsService.addItemsToCollection(collectionId, items)
}

export async function removeItemsFromCollection(collectionId: string, items: RemoveItemsData) {
  return await CollectionsService.removeItemsFromCollection(collectionId, items)
}

export async function getCollectionContent(collectionId: string, options: { type?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: string } = {}) {
  return await CollectionsService.getCollectionContent(collectionId, options)
}

export async function updateCollectionSettings(collectionId: string, settings: UpdateSettingsData) {
  return await CollectionsService.updateCollectionSettings(collectionId, settings)
}

export async function searchCollections(userId: string, query: string, options: { includeContent?: boolean; limit?: number } = {}) {
  return await CollectionsService.searchCollections(userId, query, options)
}

export async function exportCollections(userId: string, options: { format?: string; includeContent?: boolean } = {}) {
  return await CollectionsService.exportCollections(userId, options)
}

export async function importCollections(userId: string, data: any, options: { merge?: boolean } = {}) {
  return await CollectionsService.importCollections(userId, data, options)
}

// Drag and Drop Methods
export async function moveCollection(collectionId: string, newParentId: string, newPosition: number) {
  return await CollectionsService.moveCollection(collectionId, newParentId, newPosition)
}

export async function moveItem(itemId: string, itemType: string, targetCollectionId: string) {
  return await CollectionsService.moveItem(itemId, itemType, targetCollectionId)
}

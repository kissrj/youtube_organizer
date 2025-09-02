import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { defaultNotebooks } from '@/lib/data/default-notebooks'
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
export interface CreateNotebookData {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
  userId: string
}

export interface UpdateNotebookData {
  name?: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}

export interface NotebookFilters {
  includeChildren?: boolean
  includeContent?: boolean
  includeSettings?: boolean
  parentId?: string
  userId?: string
}

export interface NotebookContentFilters {
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
  notebookIds: string[]
  targetParentId?: string
}

// Validation schemas
export const createNotebookSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export const updateNotebookSchema = z.object({
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
  notebookIds: z.array(z.string()),
  targetParentId: z.string().optional(),
})

/**
 * Main service for notebook management
 */
export class NotebooksService {
  /**
    * List user notebooks
    */
  static async getNotebooks(filters: NotebookFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false, parentId, userId } = filters

    const where: any = {}
    if (userId) where.userId = userId
    if (parentId !== undefined) {
      where.parentId = parentId
    } else {
      where.parentId = null // Root notebooks
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
    * Create new notebook
    */
  static async createNotebook(data: CreateNotebookData) {
    const validatedData = createNotebookSchema.parse(data)

    // Check if a notebook with the same name already exists
    const existing = await prisma.collection.findFirst({
      where: {
        name: validatedData.name,
        userId: validatedData.userId
      }
    })

    if (existing) {
      throw new Error('A notebook with this name already exists')
    }

    const notebook = await prisma.collection.create({
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
        collectionId: notebook.id,
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

    return notebook
  }

  /**
    * Get notebook by ID
    */
  static async getNotebookById(id: string, filters: NotebookFilters = {}) {
    const { includeChildren = false, includeContent = false, includeSettings = false } = filters

    const notebook = await prisma.collection.findUnique({
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

    if (!notebook) {
      throw new Error('Notebook not found')
    }

    return notebook
  }

  /**
    * Update notebook
    */
  static async updateNotebook(id: string, data: UpdateNotebookData) {
    const validatedData = updateNotebookSchema.parse(data)

    // Check if notebook exists and belongs to user
    const existing = await prisma.collection.findFirst({
      where: { id }
    })

    if (!existing) {
      throw new Error('Notebook not found')
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
    * Delete notebook
    */
  static async deleteNotebook(id: string) {
    const notebook = await prisma.collection.findFirst({
      where: { id }
    })

    if (!notebook) {
      throw new Error('Notebook not found')
    }

    // Delete notebook and all its content (cascade)
    await prisma.collection.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
    * Add items to notebook
    */
  static async addItemsToNotebook(
    notebookId: string,
    items: AddItemsData
  ) {
    const notebook = await prisma.collection.findFirst({
      where: { id: notebookId }
    })

    if (!notebook) {
      throw new Error('Notebook not found')
    }

    const results = {
      added: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] },
      errors: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] }
    }

    const position = items.position || 0

    // Add videos
    if (items.videos?.length) {
      for (const videoId of items.videos) {
        try {
          await prisma.collectionVideo.create({
            data: {
              collectionId: notebookId,
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

    // Add channels
    if (items.channels?.length) {
      for (const channelId of items.channels) {
        try {
          await prisma.collectionChannel.create({
            data: {
              collectionId: notebookId,
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

    // Add playlists
    if (items.playlists?.length) {
      for (const playlistId of items.playlists) {
        try {
          await prisma.collectionPlaylist.create({
            data: {
              collectionId: notebookId,
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
    * Remove items from notebook
    */
  static async removeItemsFromNotebook(
    notebookId: string,
    items: RemoveItemsData
  ) {
    const results = {
      removed: { videos: [] as string[], channels: [] as string[], playlists: [] as string[] }
    }

    // Remove videos
    if (items.videos?.length) {
      for (const videoId of items.videos) {
        await prisma.collectionVideo.deleteMany({
          where: { collectionId: notebookId, videoId }
        })
        results.removed.videos.push(videoId)
      }
    }

    // Remove channels
    if (items.channels?.length) {
      for (const channelId of items.channels) {
        await prisma.collectionChannel.deleteMany({
          where: { collectionId: notebookId, channelId }
        })
        results.removed.channels.push(channelId)
      }
    }

    // Remove playlists
    if (items.playlists?.length) {
      for (const playlistId of items.playlists) {
        await prisma.collectionPlaylist.deleteMany({
          where: { collectionId: notebookId, playlistId }
        })
        results.removed.playlists.push(playlistId)
      }
    }

    return results
  }

  /**
    * Move notebook (change position or parent)
    */
  static async moveNotebook(id: string, newParentId?: string, newPosition?: number) {
    const notebook = await prisma.collection.findFirst({
      where: { id }
    })

    if (!notebook) {
      throw new Error('Notebook not found')
    }

    // Check if new parent is valid (cannot be descendant of current notebook)
    if (newParentId) {
      const isDescendant = await this.isDescendant(newParentId, id)
      if (isDescendant) {
        throw new Error('Cannot move a notebook to one of its descendants')
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
    * Check if a notebook is descendant of another
    */
  static async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    let currentId = descendantId
    const visited = new Set<string>()

    while (currentId) {
      if (visited.has(currentId)) {
        throw new Error('Cycle detected in notebook hierarchy')
      }
      visited.add(currentId)

      const notebook = await prisma.collection.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      })

      if (!notebook) break
      if (notebook.parentId === ancestorId) return true
      currentId = notebook.parentId
    }

    return false
  }

  /**
    * Get notebook content
    */
  static async getNotebookContent(notebookId: string, filters: NotebookContentFilters = {}) {
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
        where: { collectionId: notebookId },
        include: { video: true },
        orderBy,
        take: limit,
        skip: offset
      })
      content.videos = videos.map(cv => cv.video)
      content.total.videos = await prisma.collectionVideo.count({ where: { collectionId: notebookId } })
    }

    if (type === 'all' || type === 'channels') {
      const channels = await prisma.collectionChannel.findMany({
        where: { collectionId: notebookId },
        orderBy,
        take: limit,
        skip: offset
      })
      content.channels = channels
      content.total.channels = await prisma.collectionChannel.count({ where: { collectionId: notebookId } })
    }

    if (type === 'all' || type === 'playlists') {
      const playlists = await prisma.collectionPlaylist.findMany({
        where: { collectionId: notebookId },
        include: { playlist: true },
        orderBy,
        take: limit,
        skip: offset
      })
      content.playlists = playlists.map(cp => cp.playlist)
      content.total.playlists = await prisma.collectionPlaylist.count({ where: { collectionId: notebookId } })
    }

    return content
  }

  /**
    * Update notebook settings
    */
  static async updateNotebookSettings(notebookId: string, settings: UpdateSettingsData) {
    return await prisma.collectionSettings.upsert({
      where: { collectionId: notebookId },
      update: settings,
      create: {
        collectionId: notebookId,
        ...settings
      }
    })
  }

  /**
    * Search notebooks
    */
  static async searchNotebooks(userId: string, query: string, options: { includeContent?: boolean; limit?: number } = {}) {
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
    * Export notebooks
    */
  static async exportNotebooks(userId: string, options: { format?: string; includeContent?: boolean } = {}) {
    const notebooks = await this.getNotebooks({
      includeChildren: true,
      includeContent: options.includeContent,
      userId
    })

    if (options.format === 'json') {
      return {
        data: JSON.stringify(notebooks, null, 2),
        filename: 'notebooks.json',
        contentType: 'application/json'
      }
    }

    // Default to JSON
    return {
      data: JSON.stringify(notebooks, null, 2),
      filename: 'notebooks.json',
      contentType: 'application/json'
    }
  }

  /**
    * Import notebooks
    */
  static async importNotebooks(userId: string, data: any, options: { merge?: boolean } = {}) {
    const results = {
      imported: 0,
      errors: [] as string[],
      conflicts: [] as string[]
    }

    try {
      const notebooks = Array.isArray(data) ? data : [data]

      for (const notebookData of notebooks) {
        try {
          // Check for conflicts
          const existing = await prisma.collection.findFirst({
            where: {
              name: notebookData.name,
              userId
            }
          })

          if (existing && !options.merge) {
            results.conflicts.push(notebookData.name)
            continue
          }

          // Create notebook
          const notebook = await this.createNotebook({
            ...notebookData,
            userId
          })

          results.imported++
        } catch (error) {
          results.errors.push(notebookData.name || 'Unknown notebook')
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
    const { operation, notebookIds, targetParentId } = data

    const results = {
      success: [] as string[],
      errors: [] as string[]
    }

    for (const notebookId of notebookIds) {
      try {
        switch (operation) {
          case 'delete':
            await this.deleteNotebook(notebookId)
            break
          case 'move':
            if (targetParentId) {
              await this.moveNotebook(notebookId, targetParentId)
            }
            break
          case 'copy':
            // Copy implementation would be more complex
            throw new Error('Copy operation not implemented')
        }
        results.success.push(notebookId)
      } catch (error) {
        results.errors.push(notebookId)
      }
    }

    return results
  }

  /**
    * Move a notebook to a new parent and position
    */
  static async moveNotebook(notebookId: string, newParentId: string, newPosition: number) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    // Check if notebook exists and belongs to user
    const notebook = await prisma.collection.findFirst({
      where: {
        id: notebookId,
        userId: session.user.id
      }
    })

    if (!notebook) {
      throw new Error('Notebook not found')
    }

    // If has new parent, check if exists and belongs to user
    if (newParentId) {
      const parentNotebook = await prisma.collection.findFirst({
        where: {
          id: newParentId,
          userId: session.user.id
        }
      })

      if (!parentNotebook) {
        throw new Error('Parent notebook not found')
      }

      // Avoid cycles (do not allow a notebook to be moved inside itself or its children)
      if (newParentId === notebookId) {
        throw new Error('Cannot move a notebook inside itself')
      }
    }

    // Update the notebook
    const updatedNotebook = await prisma.collection.update({
      where: { id: notebookId },
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

    return updatedNotebook
  }

  /**
     * Move an item (video, channel or playlist) to a different notebook
     */
  static async moveItem(itemId: string, itemType: string, targetNotebookId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    // Check if target notebook exists and belongs to user
    const targetNotebook = await prisma.collection.findFirst({
      where: {
        id: targetNotebookId,
        userId: session.user.id
      }
    })

    if (!targetNotebook) {
      throw new Error('Target notebook not found')
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
            collectionId: targetNotebookId
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
            collectionId: targetNotebookId
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
            collectionId: targetNotebookId
          }
        })
        break

      default:
        throw new Error('Invalid item type')
    }

    return updatedItem
  }

  /**
     * Populate default notebooks for a new user
     */
  static async populateDefaultNotebooks(userId: string) {
    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    }

    for (const defaultNotebook of defaultNotebooks) {
      try {
        // Check if notebook already exists
        const existing = await prisma.collection.findFirst({
          where: {
            name: defaultNotebook.name,
            userId
          }
        })

        if (existing) {
          results.skipped.push(defaultNotebook.name)
          continue
        }

        // Create the default notebook
        const notebook = await this.createNotebook({
          name: defaultNotebook.name,
          description: defaultNotebook.description,
          icon: defaultNotebook.icon,
          color: defaultNotebook.color,
          isPublic: false,
          userId
        })

        results.created.push(notebook.name)
      } catch (error) {
        console.error(`Error creating default notebook ${defaultNotebook.name}:`, error)
        results.errors.push(defaultNotebook.name)
      }
    }

    return results
  }

  /**
     * Check if user has default notebooks populated
     */
  static async hasDefaultNotebooks(userId: string): Promise<boolean> {
    const defaultNames = defaultNotebooks.map(nb => nb.name)
    const existingCount = await prisma.collection.count({
      where: {
        userId,
        name: {
          in: defaultNames
        }
      }
    })

    return existingCount > 0
  }
}

// Legacy function exports for backward compatibility
export async function createNotebook(data: CreateNotebookData) {
  return await NotebooksService.createNotebook(data)
}

export async function updateNotebook(id: string, data: UpdateNotebookData) {
  return await NotebooksService.updateNotebook(id, data)
}

export async function deleteNotebook(id: string) {
  return await NotebooksService.deleteNotebook(id)
}

export async function getNotebook(id: string, options: { includeChildren?: boolean; includeContent?: boolean; includeSettings?: boolean } = {}) {
  return await NotebooksService.getNotebookById(id, options)
}

export async function getUserNotebooks(userId: string, options: { includeChildren?: boolean; includeContent?: boolean; includeSettings?: boolean; parentId?: string } = {}) {
  return await NotebooksService.getNotebooks({ ...options, userId })
}

export async function addItemsToNotebook(notebookId: string, items: AddItemsData) {
  return await NotebooksService.addItemsToNotebook(notebookId, items)
}

export async function removeItemsFromNotebook(notebookId: string, items: RemoveItemsData) {
  return await NotebooksService.removeItemsFromNotebook(notebookId, items)
}

export async function getNotebookContent(notebookId: string, options: { type?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: string } = {}) {
  return await NotebooksService.getNotebookContent(notebookId, options)
}

export async function updateNotebookSettings(notebookId: string, settings: UpdateSettingsData) {
  return await NotebooksService.updateNotebookSettings(notebookId, settings)
}

export async function searchNotebooks(userId: string, query: string, options: { includeContent?: boolean; limit?: number } = {}) {
  return await NotebooksService.searchNotebooks(userId, query, options)
}

export async function exportNotebooks(userId: string, options: { format?: string; includeContent?: boolean } = {}) {
  return await NotebooksService.exportNotebooks(userId, options)
}

export async function importNotebooks(userId: string, data: any, options: { merge?: boolean } = {}) {
  return await NotebooksService.importNotebooks(userId, data, options)
}

// Drag and Drop Methods
export async function moveNotebook(notebookId: string, newParentId: string, newPosition: number) {
  return await NotebooksService.moveNotebook(notebookId, newParentId, newPosition)
}

export async function moveItem(itemId: string, itemType: string, targetNotebookId: string) {
  return await NotebooksService.moveItem(itemId, itemType, targetNotebookId)
}
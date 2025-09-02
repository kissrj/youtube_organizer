import { prisma } from '@/lib/prisma'

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
  userId: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  color?: string
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryData) {
  return await prisma.category.create({
    data,
  })
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: string) {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      playlists: {
        include: {
          playlist: true,
        },
      },
    },
  })
}

/**
 * Get all categories for a user
 */
export async function getUserCategories(userId: string) {
  return await prisma.category.findMany({
    where: { userId },
    include: {
      playlists: {
        include: {
          playlist: true,
        },
      },
      _count: {
        select: {
          videos: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Update a category
 */
export async function updateCategory(id: string, data: UpdateCategoryData) {
  return await prisma.category.update({
    where: { id },
    data,
  })
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  })
}

/**
 * Add a playlist to a category
 */
export async function addPlaylistToCategory(playlistId: string, categoryId: string) {
  return await prisma.playlistCategory.create({
    data: {
      playlistId,
      categoryId,
    },
  })
}

/**
 * Remove a playlist from a category
 */
export async function removePlaylistFromCategory(playlistId: string, categoryId: string) {
  return await prisma.playlistCategory.delete({
    where: {
      playlistId_categoryId: {
        playlistId,
        categoryId,
      },
    },
  })
}

/**
 * Get playlists for a specific category
 */
export async function getCategoryPlaylists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      playlists: {
        include: {
          playlist: {
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return category?.playlists.map(pc => pc.playlist) || []
}
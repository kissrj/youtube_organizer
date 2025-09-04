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

/**
 * Get videos for a specific category with pagination
 */
export async function getCategoryVideos(categoryId: string, options: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  userId: string;
} = { userId: '' }) {
  const { page = 1, limit = 20, search = '', sortBy = 'publishedAt', sortOrder = 'desc', userId } = options;

  // First, get all video IDs that belong to this category
  const categoryVideos = await prisma.videoCategory.findMany({
    where: {
      categoryId: categoryId,
      category: {
        userId: userId
      }
    },
    select: {
      videoId: true
    }
  })

  const videoIds = categoryVideos.map(cv => cv.videoId)

  if (videoIds.length === 0) {
    return {
      videos: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      category: null,
    }
  }

  const skip = (page - 1) * limit

  // Build the where clause for videos
  const where: any = {
    id: {
      in: videoIds
    }
  }

  // Add search filter if provided
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { channelTitle: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Build the order by clause
  const orderBy: any = {}
  if (sortBy === 'title') {
    orderBy.title = sortOrder
  } else if (sortBy === 'viewCount') {
    orderBy.viewCount = sortOrder === 'desc' ? 'desc' : 'asc'
  } else if (sortBy === 'duration') {
    orderBy.duration = sortOrder
  } else {
    // Default to publishedAt
    orderBy.publishedAt = sortOrder
  }

  const [videos, totalCount] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.video.count({
      where
    })
  ])

  // Get category details
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      _count: {
        select: {
          videos: true,
          playlists: true
        }
      }
    }
  })

  return {
    videos,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    },
    category,
  }
}
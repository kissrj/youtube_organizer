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
 * Cria uma nova categoria
 */
export async function createCategory(data: CreateCategoryData) {
  return await prisma.category.create({
    data,
  })
}

/**
 * Busca uma categoria por ID
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
 * Busca todas as categorias de um usuário
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
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Atualiza uma categoria
 */
export async function updateCategory(id: string, data: UpdateCategoryData) {
  return await prisma.category.update({
    where: { id },
    data,
  })
}

/**
 * Remove uma categoria
 */
export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  })
}

/**
 * Adiciona uma playlist a uma categoria
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
 * Remove uma playlist de uma categoria
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
 * Busca playlists de uma categoria específica
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
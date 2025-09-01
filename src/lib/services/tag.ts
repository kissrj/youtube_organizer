import { prisma } from '@/lib/prisma'

export interface CreateTagData {
  name: string
  userId: string
}

export interface UpdateTagData {
  name?: string
}

/**
 * Cria uma nova tag
 */
export async function createTag(data: CreateTagData) {
  return await prisma.tag.create({
    data,
  })
}

/**
 * Busca uma tag por ID
 */
export async function getTagById(id: string) {
  return await prisma.tag.findUnique({
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
 * Busca uma tag por nome e usuário
 */
export async function getTagByName(name: string, userId: string) {
  return await prisma.tag.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  })
}

/**
 * Busca todas as tags de um usuário
 */
export async function getUserTags(userId: string) {
  return await prisma.tag.findMany({
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
 * Atualiza uma tag
 */
export async function updateTag(id: string, data: UpdateTagData) {
  return await prisma.tag.update({
    where: { id },
    data,
  })
}

/**
 * Remove uma tag
 */
export async function deleteTag(id: string) {
  return await prisma.tag.delete({
    where: { id },
  })
}

/**
 * Adiciona uma tag a uma playlist
 */
export async function addTagToPlaylist(playlistId: string, tagId: string) {
  return await prisma.playlistTag.create({
    data: {
      playlistId,
      tagId,
    },
  })
}

/**
 * Remove uma tag de uma playlist
 */
export async function removeTagFromPlaylist(playlistId: string, tagId: string) {
  return await prisma.playlistTag.delete({
    where: {
      playlistId_tagId: {
        playlistId,
        tagId,
      },
    },
  })
}

/**
 * Busca playlists por tag
 */
export async function getTagPlaylists(tagId: string) {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: {
      playlists: {
        include: {
          playlist: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return tag?.playlists.map(pt => pt.playlist) || []
}

/**
 * Cria uma tag se não existir, ou retorna a existente
 */
export async function findOrCreateTag(name: string, userId: string) {
  let tag = await getTagByName(name, userId)

  if (!tag) {
    tag = await createTag({ name, userId })
  }

  return tag
}
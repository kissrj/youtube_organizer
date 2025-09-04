import { prisma } from '@/lib/prisma'

// Importar o validador de tags
import { TagValidator } from './autoTags'

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
  // Validar e sanitizar o nome da tag
  const sanitizedName = TagValidator.sanitizeTagName(data.name);

  if (!sanitizedName) {
    throw new Error('Nome da tag inválido. Deve conter apenas letras, números e espaços, com no mínimo 2 caracteres e no máximo 50.');
  }

  // Verificar se já existe uma tag com o mesmo nome (após sanitização)
  const existingTag = await getTagByName(sanitizedName, data.userId);
  if (existingTag) {
    throw new Error('Já existe uma tag com este nome.');
  }

  return await prisma.tag.create({
    data: {
      ...data,
      name: sanitizedName,
    },
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
      _count: {
        select: {
          videos: true,
          playlists: true,
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
 * Busca vídeos associados a uma tag com paginação
 */
export async function getTagVideos(tagId: string, options: {
  page?: number;
  limit?: number;
  userId: string;
} = { userId: '' }) {
  const { page = 1, limit = 20, userId } = options;

  // Primeiro verifica se a tag pertence ao usuário e obtém os dados completos
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId,
    },
    include: {
      _count: {
        select: {
          videos: true,
          playlists: true,
        },
      },
      playlists: {
        include: {
          playlist: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
        },
        take: 5, // Limitar a 5 playlists para preview
      },
    },
  });

  if (!tag) {
    throw new Error('Tag não encontrada ou não pertence ao usuário');
  }

  const skip = (page - 1) * limit;

  const [videos, totalCount] = await Promise.all([
    prisma.video.findMany({
      where: {
        userId,
        tags: {
          some: {
            tagId,
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.video.count({
      where: {
        userId,
        tags: {
          some: {
            tagId,
          },
        },
      },
    }),
  ]);

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
    tag,
  };
}

/**
 * Busca informações detalhadas de uma tag incluindo estatísticas
 */
export async function getTagDetails(tagId: string, userId: string) {
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId,
    },
    include: {
      _count: {
        select: {
          videos: true,
          playlists: true,
        },
      },
      playlists: {
        include: {
          playlist: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
        },
        take: 5, // Limitar a 5 playlists para preview
      },
    },
  });

  if (!tag) {
    throw new Error('Tag não encontrada ou não pertence ao usuário');
  }

  return tag;
}

/**
 * Cria uma tag se não existir, ou retorna a existente
 */
export async function findOrCreateTag(name: string, userId: string) {
  // Validar e sanitizar o nome da tag
  const sanitizedName = TagValidator.sanitizeTagName(name);

  if (!sanitizedName) {
    throw new Error('Nome da tag inválido. Deve conter apenas letras, números e espaços, com no mínimo 2 caracteres e no máximo 50.');
  }

  let tag = await getTagByName(sanitizedName, userId)

  if (!tag) {
    tag = await createTag({ name: sanitizedName, userId })
  }

  return tag
}
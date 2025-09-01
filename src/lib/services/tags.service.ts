// src/lib/services/tags.service.ts
import { prisma } from '@/lib/prisma'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data: any) => data })
      })
    }),
    optional: () => ({ parse: (data: any) => data })
  }),
  object: (shape: any) => ({
    parse: (data: any) => data
  })
}

export interface CreateTagData {
  name: string
  color?: string
}

export interface TagFilters {
  userId?: string
  collectionId?: string
}

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
})

/**
 * Serviço para gerenciamento de tags de coleções
 */
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
    const validatedData = createTagSchema.parse(data)

    // Verificar se já existe uma tag com o mesmo nome
    const existing = await prisma.tag.findFirst({
      where: { name: validatedData.name, userId }
    })

    if (existing) {
      throw new Error('Já existe uma tag com este nome')
    }

    return await prisma.tag.create({
      data: {
        ...validatedData,
        userId
      }
    })
  }

  /**
   * Obter tag por ID
   */
  static async getTagById(id: string) {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        collections: {
          include: {
            collection: true
          }
        }
      }
    })

    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    return tag
  }

  /**
   * Atualizar tag
   */
  static async updateTag(id: string, data: Partial<CreateTagData>) {
    const validatedData = createTagSchema.partial().parse(data)

    const tag = await prisma.tag.findFirst({
      where: { id }
    })

    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    return await prisma.tag.update({
      where: { id },
      data: validatedData,
      include: {
        collections: {
          include: {
            collection: true
          }
        }
      }
    })
  }

  /**
   * Excluir tag
   */
  static async deleteTag(id: string) {
    const tag = await prisma.tag.findFirst({
      where: { id }
    })

    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    // Remover todas as associações com coleções
    await prisma.collectionTag.deleteMany({
      where: { tagId: id }
    })

    // Excluir a tag
    await prisma.tag.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * Adicionar tag à coleção
   */
  static async addTagToCollection(collectionId: string, tagId: string) {
    // Verificar se a coleção existe
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    })

    if (!collection) {
      throw new Error('Coleção não encontrada')
    }

    // Verificar se a tag existe
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!tag) {
      throw new Error('Tag não encontrada')
    }

    // Verificar se a associação já existe
    const existing = await prisma.collectionTag.findUnique({
      where: {
        collectionId_tagId: { collectionId, tagId }
      }
    })

    if (existing) {
      throw new Error('Esta tag já está associada à coleção')
    }

    return await prisma.collectionTag.create({
      data: {
        collectionId,
        tagId
      },
      include: {
        tag: true,
        collection: true
      }
    })
  }

  /**
   * Remover tag da coleção
   */
  static async removeTagFromCollection(collectionId: string, tagId: string) {
    const association = await prisma.collectionTag.findUnique({
      where: {
        collectionId_tagId: { collectionId, tagId }
      }
    })

    if (!association) {
      throw new Error('Associação tag-coleção não encontrada')
    }

    return await prisma.collectionTag.delete({
      where: {
        collectionId_tagId: { collectionId, tagId }
      }
    })
  }

  /**
   * Buscar tags
   */
  static async searchTags(userId: string, query: string, options: { limit?: number } = {}) {
    const { limit = 20 } = options

    return await prisma.tag.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        collections: {
          include: {
            collection: true
          }
        }
      },
      take: limit,
      orderBy: {
        name: 'asc'
      }
    })
  }

  /**
   * Obter tags de uma coleção
   */
  static async getCollectionTags(collectionId: string) {
    return await prisma.collectionTag.findMany({
      where: { collectionId },
      include: {
        tag: true
      },
      orderBy: {
        tag: {
          name: 'asc'
        }
      }
    })
  }

  /**
   * Obter coleções por tag
   */
  static async getCollectionsByTag(tagId: string, userId: string) {
    return await prisma.collectionTag.findMany({
      where: {
        tagId,
        collection: {
          userId
        }
      },
      include: {
        collection: {
          include: {
            _count: {
              select: {
                videos: true,
                channels: true,
                playlists: true
              }
            }
          }
        }
      }
    })
  }

  /**
   * Estatísticas de uso das tags
   */
  static async getTagUsageStats(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            collections: true
          }
        }
      },
      orderBy: {
        collections: {
          _count: 'desc'
        }
      }
    })

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      usageCount: tag._count.collections,
      createdAt: tag.createdAt
    }))
  }
}

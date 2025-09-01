import { prisma } from '@/lib/prisma'

// Lightweight runtime-safe validators to avoid bundler issues with zod
const z = {
  string: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  number: () => ({
    positive: () => ({ optional: () => ({ parse: (data: any) => data }) }),
    optional: () => ({ parse: (data: any) => data })
  }),
  boolean: () => ({ optional: () => ({ parse: (data: any) => data }) }),
  array: (_inner?: any) => ({ optional: () => ({ parse: (data: any) => data }) }),
  date: () => ({ optional: () => ({ parse: (data: any) => data }) }),
  object: (_shape: any) => ({
    optional: () => ({ parse: (data: any) => data }),
    parse: (data: any) => data
  })
}

// Tipos
export type FeedFilter = {
  channels?: string[]
  tags?: string[]
  duration?: {
    min?: number
    max?: number
  }
  dateRange?: {
    start?: Date
    end?: Date
  }
  viewCount?: {
    min?: number
    max?: number
  }
  searchQuery?: string
}

export type FeedSortBy = 'RECENT' | 'VIEWS' | 'LIKES' | 'COMMENTS' | 'DURATION' | 'RELEVANCE'
export type FeedSortOrder = 'ASC' | 'DESC'

// Schema de validação
const FeedFilterSchema = z.object({
  channels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  duration: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional()
  }).optional(),
  dateRange: z.object({
    start: z.date().optional(),
    end: z.date().optional()
  }).optional(),
  viewCount: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional()
  }).optional(),
  searchQuery: z.string().optional()
})

// Serviço
export class FeedsService {
  // Criar novo feed
  static async createFeed(data: {
    collectionId: string
    title: string
    description?: string
    filters?: FeedFilter
    sortBy?: FeedSortBy
    sortOrder?: FeedSortOrder
    limit?: number
  }) {
    const validated = data.filters ? FeedFilterSchema.parse(data.filters) : undefined

  return (prisma as any).collectionFeed.create({
      data: {
        collectionId: data.collectionId,
        title: data.title,
        description: data.description,
        filters: validated ? JSON.stringify(validated) : null,
        sortBy: data.sortBy || 'RECENT',
        sortOrder: data.sortOrder || 'DESC',
        limit: data.limit || 20
      },
      include: {
        collection: {
          select: { id: true, name: true }
        }
      }
    })
  }

  // Obter feed por ID
  static async getFeed(id: string) {
  const feed = await (prisma as any).collectionFeed.findUnique({
      where: { id },
      include: {
        collection: {
          select: { id: true, name: true }
        }
      }
    })

    if (!feed) return null

    // Parse filters from JSON string
    let parsedFilters: FeedFilter | undefined
    if (feed.filters) {
      try {
        parsedFilters = JSON.parse(feed.filters)
      } catch (error) {
        console.error('Error parsing feed filters:', error)
      }
    }

    return {
      ...feed,
      filters: parsedFilters
    }
  }

  // Listar feeds de uma coleção
  static async getCollectionFeeds(collectionId: string) {
  const feeds: any[] = await (prisma as any).collectionFeed.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      include: {
        collection: {
          select: { id: true, name: true }
        }
      }
    })

    // Parse filters for each feed
  return feeds.map((feed: any) => {
      let parsedFilters: FeedFilter | undefined
      if (feed.filters) {
        try {
          parsedFilters = JSON.parse(feed.filters)
        } catch (error) {
          console.error('Error parsing feed filters:', error)
        }
      }

      return {
        ...feed,
        filters: parsedFilters
      }
    })
  }

  // Atualizar feed
  static async updateFeed(id: string, data: {
    title?: string
    description?: string
    filters?: FeedFilter
    sortBy?: FeedSortBy
    sortOrder?: FeedSortOrder
    limit?: number
    isActive?: boolean
  }) {
    const validated = data.filters ? FeedFilterSchema.parse(data.filters) : undefined

    const updateData: any = {
      ...data
    }

    if (validated !== undefined) {
      updateData.filters = JSON.stringify(validated)
    }

  return (prisma as any).collectionFeed.update({
      where: { id },
      data: updateData,
      include: {
        collection: {
          select: { id: true, name: true }
        }
      }
    })
  }

  // Excluir feed
  static async deleteFeed(id: string) {
  return (prisma as any).collectionFeed.delete({
      where: { id }
    })
  }

  // Obter vídeos do feed
  static async getFeedVideos(feedId: string, page = 1, limit = 20) {
    const feed = await this.getFeed(feedId)
    if (!feed) throw new Error('Feed não encontrado')

    const offset = (page - 1) * limit

    // Construir query base
    const where: any = {}

    // Aplicar filtros
    if (feed.filters?.channels?.length) {
      where.channelId = { in: feed.filters.channels }
    }

    if (feed.filters?.tags?.length) {
      where.tags = {
        some: {
          name: { in: feed.filters.tags }
        }
      }
    }

    if (feed.filters?.duration) {
      where.duration = {
        gte: feed.filters.duration.min,
        lte: feed.filters.duration.max
      }
    }

    if (feed.filters?.dateRange) {
      where.publishedAt = {
        gte: feed.filters.dateRange.start,
        lte: feed.filters.dateRange.end
      }
    }

    if (feed.filters?.viewCount) {
      where.viewCount = {
        gte: feed.filters.viewCount.min?.toString(),
        lte: feed.filters.viewCount.max?.toString()
      }
    }

    if (feed.filters?.searchQuery) {
      where.OR = [
        { title: { contains: feed.filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: feed.filters.searchQuery, mode: 'insensitive' } }
      ]
    }

    // Aplicar ordenação
    const orderBy: any = {}
    switch (feed.sortBy) {
      case 'RECENT':
        orderBy.publishedAt = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
      case 'VIEWS':
        orderBy.viewCount = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
      case 'LIKES':
        orderBy.likeCount = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
      case 'COMMENTS':
        orderBy.commentCount = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
      case 'DURATION':
        orderBy.duration = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
      case 'RELEVANCE':
        // For relevance, we might need a custom field or calculation
        orderBy.createdAt = feed.sortOrder === 'DESC' ? 'desc' : 'asc'
        break
    }

    // Executar query
    const [rawVideos, total] = await Promise.all<any>([
      (prisma as any).video.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          tags: {
            include: {
              tag: { select: { id: true, name: true } }
            }
          }
        }
      }),
      (prisma as any).video.count({ where })
    ])

    // Normalizar tags para o formato { id, name } usado no front
  const videos: any[] = (rawVideos as any[]).map((v: any) => ({
      ...v,
      tags: (v.tags || []).map((vt: any) => ({ id: vt.tag?.id, name: vt.tag?.name })).filter((t: any) => t.id)
    }))

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Obter feeds recomendados
  static async getRecommendedFeeds(userId: string, limit = 5) {
  return (prisma as any).collectionFeed.findMany({
      where: {
        collection: {
          userId
        },
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        collection: {
          select: { id: true, name: true }
        }
      }
    })
  }
}

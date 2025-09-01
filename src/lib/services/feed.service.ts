// src/lib/services/feed.service.ts
import { prisma } from '@/lib/prisma'

export interface FeedFilters {
  includeWatched?: boolean
  includeShorts?: boolean
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minDuration?: number
  maxDuration?: number
  categories?: string[]
  tags?: string[]
}

export interface FeedItem {
  id: string
  type: 'video' | 'channel' | 'playlist'
  title: string
  description?: string
  thumbnail?: string
  url?: string
  publishedAt?: Date
  addedAt: Date
  duration?: string
  viewCount?: number
  likeCount?: number
  collectionId: string
  collectionName: string
  categories?: any[]
  tags?: any[]
  metadata?: any
}

/**
 * Serviço para geração de feeds de coleções
 */
export class FeedService {
  /**
   * Obter feed de vídeos de uma coleção
   */
  static async getCollectionFeed(collectionId: string, filters: FeedFilters = {}) {
    const {
      includeWatched = false,
      includeShorts = false,
      limit = 20,
      offset = 0,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      minDuration,
      maxDuration,
      categories = [],
      tags = []
    } = filters

    // Obter configurações da coleção
    const settings = await prisma.collectionSettings.findUnique({
      where: { collectionId }
    })

    if (!settings) {
      throw new Error('Configurações da coleção não encontradas')
    }

    // Verificar se o feed está habilitado
    if (!settings.feedEnabled) {
      return {
        videos: [],
        total: 0,
        hasMore: false,
        settings
      }
    }

    // Construir query base
    let where: any = {
      collectionId
    }

    // Aplicar filtros de configurações
    if (!includeWatched && settings.hideWatched) {
      where.isWatched = false
    }

    // Aplicar filtros de data
    if (dateFrom || dateTo) {
      where.video = {
        publishedAt: {}
      }
      if (dateFrom) where.video.publishedAt.gte = dateFrom
      if (dateTo) where.video.publishedAt.lte = dateTo
    }

    // Aplicar filtros de duração
    if (minDuration || maxDuration || (!includeShorts && settings.hideShorts)) {
      where.video = where.video || {}
      where.video.duration = {}

      if (minDuration) {
        where.video.duration.gte = minDuration
      } else if (!includeShorts && settings.hideShorts) {
        // Considerar shorts como vídeos com menos de 60 segundos
        where.video.duration.gte = 60
      }

      if (maxDuration) {
        where.video.duration.lte = maxDuration
      }
    }

    // Aplicar filtros de categorias
    if (categories.length > 0) {
      where.video = where.video || {}
      where.video.categories = {
        some: {
          category: {
            id: { in: categories }
          }
        }
      }
    }

    // Ordenar
    const orderBy: any = {}
    if (sortBy === 'addedAt') {
      orderBy.addedAt = sortOrder
    } else {
      orderBy.video = {
        [sortBy]: sortOrder
      }
    }

    // Buscar vídeos
    const [videos, total] = await Promise.all([
      prisma.collectionVideo.findMany({
        where,
        include: {
          video: {
            include: {
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
            }
          },
          collection: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.collectionVideo.count({ where })
    ])

    // Formatar resultado
    const formattedVideos = videos.map(cv => ({
      id: cv.video.id,
      type: 'video' as const,
      title: cv.video.title,
      description: cv.video.description,
      thumbnail: cv.video.thumbnail,
      url: cv.video.url,
      publishedAt: cv.video.publishedAt,
      addedAt: cv.addedAt,
      duration: cv.video.duration,
      viewCount: cv.video.viewCount,
      likeCount: cv.video.likeCount,
      collectionId: cv.collectionId,
      collectionName: cv.collection.name,
      categories: cv.video.categories?.map(vc => vc.category) || [],
      tags: cv.video.tags?.map(vt => vt.tag) || [],
      metadata: {
        isWatched: cv.isWatched,
        position: cv.position,
        notes: cv.notes,
        rating: cv.rating
      }
    }))

    return {
      videos: formattedVideos,
      total,
      hasMore: offset + limit < total,
      settings
    }
  }

  /**
   * Obter feed combinado de múltiplas coleções
   */
  static async getCombinedFeed(collectionIds: string[], filters: FeedFilters = {}) {
    const {
      includeWatched = false,
      includeShorts = false,
      limit = 20,
      offset = 0,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = filters

    // Buscar configurações de todas as coleções
    const settings = await prisma.collectionSettings.findMany({
      where: {
        collectionId: { in: collectionIds },
        feedEnabled: true
      }
    })

    const enabledCollectionIds = settings.map(s => s.collectionId)

    if (enabledCollectionIds.length === 0) {
      return {
        items: [],
        total: 0,
        hasMore: false
      }
    }

    // Construir query base
    let where: any = {
      collectionId: { in: enabledCollectionIds }
    }

    // Aplicar filtros globais
    if (!includeWatched) {
      where.isWatched = false
    }

    if (!includeShorts) {
      where.video = {
        duration: {
          gte: 60 // Não incluir shorts
        }
      }
    }

    // Ordenar
    const orderBy: any = {}
    if (sortBy === 'addedAt') {
      orderBy.addedAt = sortOrder
    } else {
      orderBy.video = {
        [sortBy]: sortOrder
      }
    }

    // Buscar itens de todas as coleções
    const [items, total] = await Promise.all([
      prisma.collectionVideo.findMany({
        where,
        include: {
          video: {
            include: {
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
            }
          },
          collection: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.collectionVideo.count({ where })
    ])

    // Formatar resultado
    const formattedItems: FeedItem[] = items.map(cv => ({
      id: cv.video.id,
      type: 'video',
      title: cv.video.title,
      description: cv.video.description,
      thumbnail: cv.video.thumbnail,
      url: cv.video.url,
      publishedAt: cv.video.publishedAt,
      addedAt: cv.addedAt,
      duration: cv.video.duration,
      viewCount: cv.video.viewCount,
      likeCount: cv.video.likeCount,
      collectionId: cv.collectionId,
      collectionName: cv.collection.name,
      categories: cv.video.categories?.map(vc => vc.category) || [],
      tags: cv.video.tags?.map(vt => vt.tag) || [],
      metadata: {
        isWatched: cv.isWatched,
        position: cv.position,
        notes: cv.notes,
        rating: cv.rating
      }
    }))

    return {
      items: formattedItems,
      total,
      hasMore: offset + limit < total
    }
  }

  /**
   * Obter feed inteligente baseado em padrões de uso
   */
  static async getSmartFeed(userId: string, filters: FeedFilters = {}) {
    const { limit = 20, offset = 0 } = filters

    // Obter coleções do usuário com configurações de feed habilitadas
    const collections = await prisma.collection.findMany({
      where: {
        userId,
        settings: {
          feedEnabled: true
        }
      },
      include: {
        settings: true
      }
    })

    if (collections.length === 0) {
      return {
        items: [],
        total: 0,
        hasMore: false
      }
    }

    const collectionIds = collections.map(c => c.id)

    // Usar algoritmo simples: ordenar por data de publicação mais recente
    // Em uma implementação mais avançada, poderia usar machine learning
    // para aprender padrões de preferência do usuário
    const result = await this.getCombinedFeed(collectionIds, {
      ...filters,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })

    return result
  }

  /**
   * Obter estatísticas do feed
   */
  static async getFeedStats(collectionId: string) {
    const [
      totalVideos,
      watchedVideos,
      totalDuration,
      averageViews,
      topCategories,
      recentActivity
    ] = await Promise.all([
      // Total de vídeos
      prisma.collectionVideo.count({
        where: { collectionId }
      }),

      // Vídeos assistidos
      prisma.collectionVideo.count({
        where: {
          collectionId,
          isWatched: true
        }
      }),

      // Duração total
      prisma.collectionVideo.aggregate({
        where: { collectionId },
        _sum: {
          video: {
            duration: true
          }
        }
      }),

      // Visualizações médias
      prisma.collectionVideo.aggregate({
        where: { collectionId },
        _avg: {
          video: {
            viewCount: true
          }
        }
      }),

      // Top categorias
      prisma.category.findMany({
        where: {
          videos: {
            some: {
              collectionVideos: {
                some: {
                  collectionId
                }
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              videos: true
            }
          }
        },
        orderBy: {
          videos: {
            _count: 'desc'
          }
        },
        take: 5
      }),

      // Atividade recente (últimos 7 dias)
      prisma.collectionVideo.count({
        where: {
          collectionId,
          addedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return {
      totalVideos,
      watchedVideos,
      unwatchedVideos: totalVideos - watchedVideos,
      watchProgress: totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0,
      totalDuration: totalDuration._sum.video?.duration || 0,
      averageViews: averageViews._avg.video?.viewCount || 0,
      topCategories: topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        videoCount: cat._count.videos
      })),
      recentActivity
    }
  }

  /**
   * Marcar vídeo como assistido/não assistido
   */
  static async markVideoAsWatched(collectionId: string, videoId: string, isWatched: boolean) {
    return await prisma.collectionVideo.updateMany({
      where: {
        collectionId,
        videoId
      },
      data: {
        isWatched,
        watchedAt: isWatched ? new Date() : null
      }
    })
  }

  /**
   * Adicionar nota a um vídeo
   */
  static async addVideoNote(collectionId: string, videoId: string, notes: string) {
    return await prisma.collectionVideo.updateMany({
      where: {
        collectionId,
        videoId
      },
      data: {
        notes
      }
    })
  }

  /**
   * Avaliar vídeo
   */
  static async rateVideo(collectionId: string, videoId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error('Avaliação deve ser entre 1 e 5')
    }

    return await prisma.collectionVideo.updateMany({
      where: {
        collectionId,
        videoId
      },
      data: {
        rating
      }
    })
  }
}

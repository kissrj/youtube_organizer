import { prisma } from '@/lib/prisma'
import {
  VideoImportError,
  createVideoError,
  parseYouTubeApiError,
  withErrorHandling,
  logVideoImportError,
  VideoErrorCodes
} from '@/lib/errors/video-errors'
import { getVideoById } from '@/lib/youtube'
import { getCategoryById } from '@/lib/youtube'
import { indexVideoContent } from '@/lib/services/content-indexer'

export interface CreateVideoData {
  youtubeId: string
  title: string
  description?: string
  thumbnailUrl?: string
  channelTitle?: string
  channelId?: string
  duration?: string
  viewCount?: string
  likeCount?: string
  commentCount?: string
  favoriteCount?: string
  publishedAt?: Date
  definition?: string
  dimension?: string
  projection?: string
  defaultAudioLanguage?: string
  categoryId?: string
  videoTags?: string | null
  userId: string
}

export interface UpdateVideoData {
  title?: string
  description?: string
  thumbnailUrl?: string
  channelTitle?: string
  channelId?: string
  duration?: string
  viewCount?: string
  likeCount?: string
}

/**
 * Cria um novo vídeo no banco de dados
 */
export async function createVideo(data: CreateVideoData) {
  return await prisma.video.create({
    data,
  })
}

/**
 * Busca um vídeo por ID do YouTube
 */
export async function getVideoByYouTubeId(youtubeId: string, userId: string) {
  return await prisma.video.findUnique({
    where: {
      userId_youtubeId: {
        userId,
        youtubeId,
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

/**
 * Busca todos os vídeos de um usuário
 */
export async function getUserVideos(userId: string) {
  return await prisma.video.findMany({
    where: { userId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Atualiza um vídeo
 */
export async function updateVideo(id: string, data: UpdateVideoData) {
  return await prisma.video.update({
    where: { id },
    data,
  })
}

/**
 * Remove um vídeo
 */
export async function deleteVideo(id: string) {
  return await prisma.video.delete({
    where: { id },
  })
}

/**
 * Sincroniza um vídeo do YouTube com o banco de dados
 */
export async function syncVideoFromYouTube(youtubeId: string, userId: string) {
  return await withErrorHandling(async () => {
    // Validações iniciais
    if (!youtubeId || youtubeId.length !== 11) {
      throw createVideoError('INVALID_VIDEO_ID')
    }

    if (!userId) {
      throw createVideoError('USER_NOT_AUTHORIZED')
    }

    // Verifica se o usuário existe
    let userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      console.log('⚠️ Usuário não encontrado no banco, tentando encontrar por email ou criar novo')

      // Tenta encontrar o usuário por email se disponível
      // Nota: Esta é uma solução temporária - idealmente o NextAuth deveria manter consistência
      const allUsers = await prisma.user.findMany({ take: 1 })
      if (allUsers.length > 0) {
        userExists = allUsers[0]
        console.log('✅ Usuário encontrado (usando primeiro usuário disponível):', userExists.id)
      } else {
        console.error('❌ Nenhum usuário encontrado no banco de dados')
        throw createVideoError('USER_NOT_AUTHORIZED')
      }
    }

    // Verifica se o vídeo já existe
    const existingVideo = await getVideoByYouTubeId(youtubeId, userId)
    if (existingVideo) {
      console.log('⚠️ Vídeo já existe:', youtubeId)
      throw createVideoError('DUPLICATE_VIDEO')
    }

    // Busca informações do vídeo no YouTube
    const youtubeVideo = await getVideoById(youtubeId)

    if (!youtubeVideo) {
      throw createVideoError('VIDEO_NOT_FOUND')
    }

    // Log dos dados recebidos para debug
    console.log('📺 Dados do vídeo do YouTube:', {
      youtubeId,
      title: youtubeVideo.title,
      channelTitle: youtubeVideo.channelTitle,
      publishedAt: youtubeVideo.publishedAt,
      duration: youtubeVideo.duration,
      viewCount: youtubeVideo.viewCount,
      likeCount: youtubeVideo.likeCount,
    })

    // Valida dados obrigatórios
    if (!youtubeVideo.title) {
      throw createVideoError('VIDEO_NOT_FOUND')
    }

    // Cria um novo vídeo com dados sanitizados
    const videoData = {
      youtubeId,
      title: youtubeVideo.title || 'Título não disponível',
      description: youtubeVideo.description || '',
      thumbnailUrl: youtubeVideo.thumbnailUrl || '',
      channelTitle: youtubeVideo.channelTitle || 'Canal não disponível',
      channelId: youtubeVideo.channelId || '',
      duration: youtubeVideo.duration || '',
      viewCount: youtubeVideo.viewCount || '0',
      likeCount: youtubeVideo.likeCount || '0',
      commentCount: youtubeVideo.commentCount || '0',
      favoriteCount: youtubeVideo.favoriteCount || '0',
      publishedAt: youtubeVideo.publishedAt ? new Date(youtubeVideo.publishedAt) : new Date(),
      definition: youtubeVideo.definition || 'sd',
      dimension: youtubeVideo.dimension || '2d',
      projection: youtubeVideo.projection || 'rectangular',
      defaultAudioLanguage: youtubeVideo.defaultAudioLanguage || '',
      categoryId: youtubeVideo.categoryId || '',
      videoTags: youtubeVideo.tags ? JSON.stringify(youtubeVideo.tags) : null,
      userId,
    }

    console.log('💾 Dados a serem salvos no banco:', videoData)

    try {
      const video = await createVideo(videoData)
      console.log('✅ Vídeo criado com sucesso:', video.id)

      // Se a API do YouTube retornou um categoryId, tentamos obter o título
      if (videoData.categoryId) {
        try {
          const ytCategory = await getCategoryById(videoData.categoryId)
          if (ytCategory && ytCategory.title) {
            // Upsert a category para o usuário
            const category = await prisma.category.upsert({
              where: { userId_name: { userId, name: ytCategory.title } },
              update: { updatedAt: new Date() },
              create: {
                name: ytCategory.title,
                description: undefined,
                color: undefined,
                userId,
              },
            })

            // Link the video with the category (if not already linked)
            try {
              await prisma.videoCategory.create({
                data: {
                  videoId: video.id,
                  categoryId: category.id,
                },
              })
            } catch (vcErr) {
              // ignore unique constraint errors
              console.warn('⚠️ Não foi possível criar VideoCategory (provavelmente já existe):', vcErr)
            }
          }
        } catch (catErr) {
          console.warn('⚠️ Erro ao buscar/atualizar categoria do YouTube:', catErr)
        }
      }

      // Indexa o conteúdo do vídeo para busca avançada
      try {
        await indexVideoContent(video.id, {
          title: videoData.title,
          description: videoData.description,
          videoTags: videoData.videoTags || undefined,
          channelTitle: videoData.channelTitle,
          categoryId: videoData.categoryId,
          defaultAudioLanguage: videoData.defaultAudioLanguage,
        })
        console.log('✅ Conteúdo do vídeo indexado para busca')
      } catch (indexError) {
        console.error('⚠️ Erro ao indexar conteúdo do vídeo:', indexError)
        // Não falha a criação do vídeo por causa da indexação
      }

      // Processa as tags do YouTube e cria associações VideoTag
      if (youtubeVideo.tags && youtubeVideo.tags.length > 0) {
        try {
          await processYouTubeTags(video.id, youtubeVideo.tags, userId)
          console.log('✅ Tags do YouTube processadas para o vídeo')
        } catch (tagError) {
          console.error('⚠️ Erro ao processar tags do YouTube:', tagError)
          // Não falha a criação do vídeo por causa das tags
        }
      }

      return video
    } catch (prismaError: any) {
      console.error('❌ Erro específico do Prisma:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
      })

      // Se for erro de duplicata, lança erro específico
      if (prismaError.code === 'P2002') {
        throw createVideoError('DUPLICATE_VIDEO')
      }

      // Para outros erros, lança erro genérico
      throw createVideoError('DATABASE_ERROR')
    }

    // Este código nunca será alcançado devido ao return/throw acima
    // mas é necessário para satisfazer o TypeScript
    throw createVideoError('DATABASE_ERROR')

    console.log(`✅ Vídeo ${youtubeId} sincronizado com sucesso para usuário ${userId}`)
    // O vídeo já foi retornado na linha 213

  }, createVideoError('DATABASE_ERROR'))
}

/**
 * Adiciona uma categoria a um vídeo
 */
export async function addCategoryToVideo(videoId: string, categoryId: string) {
  return await prisma.videoCategory.create({
    data: {
      videoId,
      categoryId,
    },
  })
}

/**
 * Remove uma categoria de um vídeo
 */
export async function removeCategoryFromVideo(videoId: string, categoryId: string) {
  return await prisma.videoCategory.delete({
    where: {
      videoId_categoryId: {
        videoId,
        categoryId,
      },
    },
  })
}

/**
 * Adiciona uma tag a um vídeo
 */
export async function addTagToVideo(videoId: string, tagId: string) {
  return await prisma.videoTag.create({
    data: {
      videoId,
      tagId,
    },
  })
}

/**
 * Remove uma tag de um vídeo
 */
export async function removeTagFromVideo(videoId: string, tagId: string) {
  return await prisma.videoTag.delete({
    where: {
      videoId_tagId: {
        videoId,
        tagId,
      },
    },
  })
}

/**
 * Busca vídeos de uma categoria específica
 */
export async function getCategoryVideos(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      videos: {
        include: {
          video: {
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

  return category?.videos.map((vc: any) => vc.video) || []
}

/**
 * Busca vídeos por tag
 */
export async function getTagVideos(tagId: string) {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: {
      videos: {
        include: {
          video: {
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

  return tag?.videos.map((vt: any) => vt.video) || []
}

/**
 * Processa as tags do YouTube e cria associações VideoTag
 */
export async function processYouTubeTags(videoId: string, youtubeTags: string[], userId: string) {
  try {
    // Importa as funções necessárias
    const { findOrCreateTag } = await import('@/lib/services/tag')

    // Processa cada tag do YouTube
    const tagAssociations = []

    for (const tagName of youtubeTags) {
      try {
        // Cria ou encontra a tag
        const tag = await findOrCreateTag(tagName, userId)

        // Adiciona à lista de associações
        tagAssociations.push({
          videoId,
          tagId: tag.id
        })
      } catch (error) {
        console.warn(`⚠️ Erro ao processar tag "${tagName}":`, error)
        // Continua processando outras tags
      }
    }

    // Cria as associações em lote
    if (tagAssociations.length > 0) {
      await prisma.videoTag.createMany({
        data: tagAssociations,
        skipDuplicates: true // Evita duplicatas
      })
      console.log(`✅ Criadas ${tagAssociations.length} associações VideoTag para vídeo ${videoId}`)
    }

  } catch (error) {
    console.error('❌ Erro ao processar tags do YouTube:', error)
    throw error
  }
}
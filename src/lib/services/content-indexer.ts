import { prisma } from '@/lib/prisma'

export interface VideoMetadata {
  title: string
  description?: string
  videoTags?: string
  channelTitle?: string
  categoryId?: string
  defaultAudioLanguage?: string
}

export interface ContentAnalysis {
  searchContent: string
  keywords: string[]
  language: string
  contentSummary: string
}

/**
 * Analisa e processa o conteúdo de um vídeo para indexação
 */
export function analyzeVideoContent(metadata: VideoMetadata): ContentAnalysis {
  const { title, description, videoTags, channelTitle, categoryId, defaultAudioLanguage } = metadata

  // 1. Criar conteúdo combinado para busca
  const searchParts: string[] = []

  // Adicionar título (mais peso)
  if (title) {
    searchParts.push(title, title.toLowerCase())
  }

  // Adicionar descrição (peso médio)
  if (description) {
    // Limpar descrição removendo URLs e caracteres especiais
    const cleanDescription = description
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/[^\w\s]/g, ' ') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim()

    if (cleanDescription.length > 0) {
      searchParts.push(cleanDescription)
    }
  }

  // Adicionar tags do vídeo
  if (videoTags) {
    try {
      const tags = JSON.parse(videoTags)
      if (Array.isArray(tags)) {
        searchParts.push(...tags)
      }
    } catch (error) {
      // Se não for JSON válido, adicionar como string
      searchParts.push(videoTags)
    }
  }

  // Adicionar nome do canal
  if (channelTitle) {
    searchParts.push(channelTitle)
  }

  // Combinar tudo em um único campo de busca
  const searchContent = searchParts.join(' ').toLowerCase()

  // 2. Extrair palavras-chave
  const keywords = extractKeywords(searchContent)

  // 3. Detectar idioma
  const language = detectLanguage(metadata)

  // 4. Gerar resumo automático
  const contentSummary = generateContentSummary(metadata)

  return {
    searchContent,
    keywords,
    language,
    contentSummary,
  }
}

/**
 * Extrai palavras-chave do conteúdo
 */
function extractKeywords(content: string): string[] {
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3) // Palavras com mais de 3 caracteres
    .filter(word => !isStopWord(word)) // Remover palavras vazias
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remover duplicatas

  // Retornar as 20 palavras mais frequentes
  return words.slice(0, 20)
}

/**
 * Verifica se uma palavra é uma stop word (palavra vazia)
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'e', 'ou', 'mas', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'como'
  ]

  return stopWords.includes(word.toLowerCase())
}

/**
 * Detecta o idioma do vídeo baseado nos metadados
 */
function detectLanguage(metadata: VideoMetadata): string {
  const { defaultAudioLanguage, title, description } = metadata

  // Primeiro, usar o idioma do áudio se disponível
  if (defaultAudioLanguage) {
    return defaultAudioLanguage
  }

  // Detectar baseado no conteúdo
  const content = `${title} ${description || ''}`.toLowerCase()

  // Palavras-chave em português
  const portugueseWords = ['como', 'para', 'mais', 'mas', 'não', 'sim', 'aqui', 'lá', 'hoje', 'ontem']
  const portugueseCount = portugueseWords.filter(word => content.includes(word)).length

  // Palavras-chave em inglês
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']
  const englishCount = englishWords.filter(word => content.includes(word)).length

  // Retornar o idioma com mais correspondências
  return portugueseCount >= englishCount ? 'pt-BR' : 'en'
}

/**
 * Gera um resumo automático do conteúdo do vídeo
 */
function generateContentSummary(metadata: VideoMetadata): string {
  const { title, description, channelTitle } = metadata

  let summary = `Vídeo: ${title}`

  if (channelTitle) {
    summary += ` por ${channelTitle}`
  }

  if (description) {
    // Pegar as primeiras 200 caracteres da descrição
    const shortDescription = description
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/[^\w\s.,!?-]/g, '') // Remove caracteres especiais
      .substring(0, 200)
      .trim()

    if (shortDescription.length > 0) {
      summary += `. ${shortDescription}`
      if (description.length > 200) {
        summary += '...'
      }
    }
  }

  return summary
}

/**
 * Indexa o conteúdo de um vídeo no banco de dados
 */
export async function indexVideoContent(videoId: string, metadata: VideoMetadata): Promise<void> {
  try {
    console.log(`📊 Indexando conteúdo do vídeo: ${videoId}`)

    const analysis = analyzeVideoContent(metadata)

    await prisma.video.update({
      where: { id: videoId },
      data: {
        searchContent: analysis.searchContent,
        contentSummary: analysis.contentSummary,
        keywords: analysis.keywords.join(','),
        language: analysis.language,
        transcriptStatus: 'processing', // Será atualizado quando o transcript for processado
      },
    })

    console.log(`✅ Conteúdo indexado com sucesso para vídeo: ${videoId}`)
    console.log(`📝 Resumo gerado: ${analysis.contentSummary.substring(0, 100)}...`)
    console.log(`🏷️ Palavras-chave: ${analysis.keywords.slice(0, 5).join(', ')}`)

  } catch (error) {
    console.error(`❌ Erro ao indexar conteúdo do vídeo ${videoId}:`, error)
    throw error
  }
}

/**
 * Busca vídeos usando busca avançada no conteúdo indexado
 */
export async function searchVideosByContent(
  userId: string,
  query: string,
  options: {
    limit?: number
    offset?: number
    categoryId?: string
    tagId?: string
  } = {}
): Promise<any[]> {
  const { limit = 20, offset = 0, categoryId, tagId } = options

  // Preparar query de busca
  const searchQuery = query.toLowerCase().trim()

  // Buscar vídeos que contenham a query no conteúdo indexado
  const videos = await prisma.video.findMany({
    where: {
      userId,
      OR: [
        {
          searchContent: {
            contains: searchQuery,
          },
        },
        {
          title: {
            contains: searchQuery,
          },
        },
        {
          description: {
            contains: searchQuery,
          },
        },
        {
          keywords: {
            contains: searchQuery,
          },
        },
      ],
      // Filtros adicionais
      ...(categoryId && {
        categories: {
          some: {
            categoryId,
          },
        },
      }),
      ...(tagId && {
        tags: {
          some: {
            tagId,
          },
        },
      }),
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
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    skip: offset,
  })

  return videos
}

/**
 * Atualiza o status do transcript de um vídeo
 */
export async function updateVideoTranscriptStatus(
  videoId: string,
  status: 'available' | 'unavailable' | 'processing'
): Promise<void> {
  await prisma.video.update({
    where: { id: videoId },
    data: {
      transcriptStatus: status,
    },
  })
}

/**
 * Reindexa todos os vídeos de um usuário
 */
export async function reindexAllUserVideos(userId: string): Promise<void> {
  console.log(`🔄 Reindexando todos os vídeos do usuário: ${userId}`)

  const videos = await prisma.video.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      description: true,
      videoTags: true,
      channelTitle: true,
      categoryId: true,
      defaultAudioLanguage: true,
    },
  })

  console.log(`📊 Encontrados ${videos.length} vídeos para reindexação`)

  for (const video of videos) {
    try {
      await indexVideoContent(video.id, {
        title: video.title,
        description: video.description || undefined,
        videoTags: video.videoTags || undefined,
        channelTitle: video.channelTitle || undefined,
        categoryId: video.categoryId || undefined,
        defaultAudioLanguage: video.defaultAudioLanguage || undefined,
      })
    } catch (error) {
      console.error(`❌ Erro ao reindexar vídeo ${video.id}:`, error)
    }
  }

  console.log(`✅ Reindexação concluída para usuário: ${userId}`)
}
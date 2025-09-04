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
 * Extrai palavras-chave do conteúdo com melhor processamento
 */
function extractKeywords(content: string): string[] {
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2) // Palavras com mais de 2 caracteres
    .filter(word => !isStopWord(word)) // Remover palavras vazias
    .filter(word => /^[a-zA-ZÀ-ÿ0-9]+$/.test(word)) // Apenas letras e números
    .map(word => word.replace(/[^\wÀ-ÿ]/g, '')) // Remover caracteres especiais
    .filter(word => word.length > 2) // Filtrar novamente após limpeza
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remover duplicatas

  // Retornar as 25 palavras mais relevantes (ordenadas por frequência)
  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a) // Ordenar por frequência
    .slice(0, 25)
    .map(([word]) => word)
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
 * Busca vídeos usando busca avançada no conteúdo indexado com melhor lógica
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
  const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 1)

  // Criar condições de busca mais inteligentes
  const searchConditions = []

  // 1. Busca exata no título (maior prioridade)
  searchConditions.push({
    title: {
      contains: searchQuery,
      mode: 'insensitive' as const
    }
  })

  // 2. Busca exata no canal (alta prioridade)
  searchConditions.push({
    channelTitle: {
      contains: searchQuery,
      mode: 'insensitive' as const
    }
  })

  // 3. Busca no conteúdo indexado
  searchConditions.push({
    searchContent: {
      contains: searchQuery,
      mode: 'insensitive' as const
    }
  })

  // 4. Busca em cada termo individual para melhor matching
  for (const term of searchTerms) {
    if (term.length > 2) {
      searchConditions.push(
        {
          title: {
            contains: term,
            mode: 'insensitive' as const
          }
        },
        {
          channelTitle: {
            contains: term,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: term,
            mode: 'insensitive' as const
          }
        },
        {
          searchContent: {
            contains: term,
            mode: 'insensitive' as const
          }
        }
      )
    }
  }

  // 5. Busca em keywords (verificar cada keyword individualmente)
  if (searchTerms.length > 0) {
    const keywordConditions = searchTerms.map(term => ({
      keywords: {
        contains: term,
        mode: 'insensitive' as const
      }
    }))
    searchConditions.push(...keywordConditions)
  }

  // 6. Busca em tags do YouTube (se existirem)
  if (searchTerms.length > 0) {
    const tagConditions = searchTerms.map(term => ({
      videoTags: {
        contains: term,
        mode: 'insensitive' as const
      }
    }))
    searchConditions.push(...tagConditions)
  }

  // Buscar vídeos com a nova lógica
  const videos = await prisma.video.findMany({
    where: {
      userId,
      OR: searchConditions,
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
    orderBy: [
      // Ordenar por relevância: vídeos que contenham a query completa primeiro
      {
        title: {
          contains: searchQuery,
          mode: 'insensitive'
        } ? 'desc' : 'asc'
      },
      // Depois por data de atualização
      {
        updatedAt: 'desc'
      }
    ],
    take: limit,
    skip: offset,
  })

  // Aplicar ranking adicional baseado na relevância
  const rankedVideos = videos.map(video => {
    let relevanceScore = 0
    const title = video.title.toLowerCase()
    const description = (video.description || '').toLowerCase()
    const channelTitle = (video.channelTitle || '').toLowerCase()
    const searchContent = (video.searchContent || '').toLowerCase()

    // Pontuação por match exato no título
    if (title.includes(searchQuery)) relevanceScore += 100
    if (channelTitle.includes(searchQuery)) relevanceScore += 80

    // Pontuação por termos individuais
    for (const term of searchTerms) {
      if (title.includes(term)) relevanceScore += 50
      if (channelTitle.includes(term)) relevanceScore += 40
      if (description.includes(term)) relevanceScore += 20
      if (searchContent.includes(term)) relevanceScore += 10
    }

    return {
      ...video,
      _relevanceScore: relevanceScore
    }
  })

  // Reordenar por pontuação de relevância
  return rankedVideos
    .sort((a, b) => b._relevanceScore - a._relevanceScore)
    .map(({ _relevanceScore, ...video }) => video)
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
 * Reindexa todos os vídeos de um usuário com melhorias
 */
export async function reindexAllUserVideos(userId: string): Promise<{ reindexed: number; errors: number }> {
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

  let reindexed = 0
  let errors = 0

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
      reindexed++
    } catch (error) {
      console.error(`❌ Erro ao reindexar vídeo ${video.id}:`, error)
      errors++
    }
  }

  console.log(`✅ Reindexação concluída: ${reindexed} vídeos reindexados, ${errors} erros`)

  return { reindexed, errors }
}

/**
 * Reindexa um vídeo específico
 */
export async function reindexVideo(videoId: string): Promise<boolean> {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        description: true,
        videoTags: true,
        channelTitle: true,
        categoryId: true,
        defaultAudioLanguage: true,
        userId: true,
      },
    })

    if (!video) {
      console.warn(`⚠️ Vídeo ${videoId} não encontrado para reindexação`)
      return false
    }

    await indexVideoContent(video.id, {
      title: video.title,
      description: video.description || undefined,
      videoTags: video.videoTags || undefined,
      channelTitle: video.channelTitle || undefined,
      categoryId: video.categoryId || undefined,
      defaultAudioLanguage: video.defaultAudioLanguage || undefined,
    })

    console.log(`✅ Vídeo ${videoId} reindexado com sucesso`)
    return true
  } catch (error) {
    console.error(`❌ Erro ao reindexar vídeo ${videoId}:`, error)
    return false
  }
}
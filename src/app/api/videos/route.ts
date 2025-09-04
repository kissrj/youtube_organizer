import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { searchVideosByContent, reindexAllUserVideos } from '@/lib/services/content-indexer'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = session.user.id

    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Parâmetros de filtro
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const dateRange = searchParams.get('dateRange')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const definition = searchParams.get('definition')
    const dimension = searchParams.get('dimension')
    const watchStatus = searchParams.get('watchStatus') // 'watched', 'unwatched', or null for all

    // Construir query base
    let where: any = {
      userId,
      // Only exclude videos that have playlist tags in the videoTags field
      // This prevents showing videos that were incorrectly tagged during import
      NOT: {
        videoTags: {
          contains: 'playlist_'
        }
      }
    }

    // Filtro de busca por texto
    if (search) {
      console.log(`🔍 Iniciando busca para: "${search}"`)

      // Sempre usar busca avançada (mesmo para termos curtos)
      const contentSearchResults = await searchVideosByContent(userId, search, {
        categoryId: categoryId || undefined,
        tagId: tagId || undefined,
        limit: limit * 3, // Buscar mais resultados para ter opções
        offset: 0,
      })

      if (contentSearchResults.length > 0) {
        console.log(`✅ Busca avançada encontrou ${contentSearchResults.length} resultados`)
        const videoIds = contentSearchResults.map(v => v.id)
        where.id = { in: videoIds }

        // Remover filtros de categoria e tag pois já foram aplicados na busca avançada
        delete where.categories
        delete where.tags
      } else {
        // Fallback melhorado: busca mais abrangente
        console.log('⚠️ Busca avançada não encontrou resultados, usando fallback inteligente')

        const searchTerms = search.toLowerCase().split(/\s+/).filter(term => term.length > 1)
        const fallbackConditions = []

        // Busca exata no título e canal
        fallbackConditions.push(
          { title: { contains: search, mode: 'insensitive' } },
          { channelTitle: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        )

        // Busca por termos individuais
        for (const term of searchTerms) {
          if (term.length > 2) {
            fallbackConditions.push(
              { title: { contains: term, mode: 'insensitive' } },
              { channelTitle: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { videoTags: { contains: term, mode: 'insensitive' } }
            )
          }
        }

        where.OR = fallbackConditions
      }
    }

    // Filtro por categoria
    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      }
    }

    // Filtro por tag
    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      }
    }

    // Filtro por período
    if (dateRange) {
      const now = new Date()
      let dateFilter: Date | undefined

      switch (dateRange) {
        case 'today':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        case 'old':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          where.publishedAt = { lt: dateFilter }
          break
        default:
          break
      }

      if (dateFilter && dateRange !== 'old') {
        where.publishedAt = { gte: dateFilter }
      }
    }

    // Filtro por definição
    if (definition) {
      where.definition = definition
    }

    // Filtro por dimensão
    if (dimension) {
      where.dimension = dimension
    }

    // Filtro por status de visualização
    if (watchStatus === 'watched') {
      where.isWatched = true
    } else if (watchStatus === 'unwatched') {
      where.isWatched = false
    }

    // Ordenação
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Buscar vídeos com filtros
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
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
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.video.count({ where }),
    ])

    // Enqueue description population for returned videos (best-effort, async)
    try {
      const { enqueueDescription } = await import('@/lib/description-queue')
      for (const v of videos) {
        if (!v.description) enqueueDescription(v.youtubeId, session.user?.id)
      }
    } catch (err) {
      console.warn('Erro ao enfileirar descrições em lote:', err)
    }

    return NextResponse.json({
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reindex') {
      console.log(`🔄 Iniciando reindexação para usuário: ${session.user.id}`)

      // Executar reindexação em background
      reindexAllUserVideos(session.user.id)
        .then((result) => {
          console.log(`✅ Reindexação concluída: ${result.reindexed} vídeos reindexados, ${result.errors} erros`)
        })
        .catch((error) => {
          console.error('❌ Erro na reindexação:', error)
        })

      return NextResponse.json({
        success: true,
        message: 'Reindexação iniciada em background',
        status: 'running'
      })
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 })

  } catch (error) {
    console.error('Erro na operação POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { searchVideosByContent } from '@/lib/services/content-indexer'

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

    // Construir query base
    let where: any = {
      userId,
    }

    // Filtro de busca por texto
    if (search) {
      // Se a busca for mais específica (mais de 3 caracteres), usar busca avançada por conteúdo
      if (search.length > 3) {
        console.log(`🔍 Usando busca avançada por conteúdo para: "${search}"`)

        // Buscar vídeos usando o sistema de indexação de conteúdo
        const contentSearchResults = await searchVideosByContent(userId, search, {
          categoryId: categoryId || undefined,
          tagId: tagId || undefined,
          limit: limit * 2, // Buscar mais resultados para ter opções
          offset: 0,
        })

        // Se encontrou resultados na busca avançada, usar apenas esses
        if (contentSearchResults.length > 0) {
          const videoIds = contentSearchResults.map(v => v.id)
          where.id = { in: videoIds }

          // Remover filtros de categoria e tag pois já foram aplicados na busca avançada
          delete where.categories
          delete where.tags
        } else {
          // Fallback para busca tradicional se não encontrou nada
          console.log('⚠️ Busca avançada não encontrou resultados, usando busca tradicional')
          where.OR = [
            { title: { contains: search } },
            { channelTitle: { contains: search } },
            { description: { contains: search } },
          ]
        }
      } else {
        // Para buscas curtas, usar busca tradicional
        where.OR = [
          { title: { contains: search } },
          { channelTitle: { contains: search } },
          { description: { contains: search } },
        ]
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
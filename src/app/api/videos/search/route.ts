import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchVideosByContent } from '@/lib/services/content-indexer'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obtém parâmetros da query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('categoryId') || undefined
    const tagId = searchParams.get('tagId') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Valida query
    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Parâmetro de busca "q" é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔍 Buscando vídeos com query: "${query}" para usuário: ${session.user.id}`)

    // Realiza busca avançada
    const videos = await searchVideosByContent(session.user.id, query, {
      limit: Math.min(limit, 100), // Máximo 100 resultados
      offset,
      categoryId,
      tagId,
    })

    console.log(`✅ Encontrados ${videos.length} vídeos para a busca`)

    return NextResponse.json({
      success: true,
      data: videos,
      meta: {
        query,
        total: videos.length,
        limit,
        offset,
      },
    })

  } catch (error) {
    console.error('❌ Erro na busca avançada:', error)

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
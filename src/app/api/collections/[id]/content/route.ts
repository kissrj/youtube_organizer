import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollectionContent,
  getCollection,
} from '@/lib/services/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'addedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const content = await getCollectionContent(id, {
      type,
      limit,
      offset,
      sortBy,
      sortOrder,
    })

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdo da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FeedsService } from '@/lib/services/feeds'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await FeedsService.getFeedVideos(params.id, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao obter vídeos do feed:', error)
    return NextResponse.json(
      { error: 'Erro ao obter vídeos do feed' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const feed = await FeedsService.updateFeed(params.id, body)

    return NextResponse.json(feed)
  } catch (error) {
    console.error('Erro ao atualizar feed:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar feed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await FeedsService.deleteFeed(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir feed:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir feed' },
      { status: 500 }
    )
  }
}

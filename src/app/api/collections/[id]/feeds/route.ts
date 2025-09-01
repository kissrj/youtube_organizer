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

    const feeds = await FeedsService.getCollectionFeeds(params.id)
    return NextResponse.json(feeds)
  } catch (error) {
    console.error('Erro ao obter feeds:', error)
    return NextResponse.json(
      { error: 'Erro ao obter feeds' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const feed = await FeedsService.createFeed({
      collectionId: params.id,
      ...body
    })

    return NextResponse.json(feed, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar feed:', error)
    return NextResponse.json(
      { error: 'Erro ao criar feed' },
      { status: 500 }
    )
  }
}

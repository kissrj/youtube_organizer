import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollectionContent,
  getCollection,
  updateCollectionSettings,
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
    const includeWatched = searchParams.get('includeWatched') === 'true'
    const includeShorts = searchParams.get('includeShorts') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if collection exists and belongs to user
    const collection = await getCollection(id, { includeSettings: true })
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Get videos from collection content
    const content = await getCollectionContent(id, {
      type: 'videos',
      limit,
      offset,
      sortBy: 'addedAt',
      sortOrder: 'desc',
    })

    // Filter based on settings
    let videos = content.videos
    if (!includeWatched) {
      // In a real implementation, you'd check watch history
      // For now, just return all videos
    }

    if (!includeShorts) {
      // Filter out short videos (duration < 60 seconds)
      videos = videos.filter(video => {
        const duration = video.duration || ''
        const match = duration.match(/PT(\d+)M(\d+)S/)
        if (match) {
          const minutes = parseInt(match[1])
          const seconds = parseInt(match[2])
          return minutes * 60 + seconds >= 60
        }
        return true
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        videos,
        total: content.total.videos,
        hasMore: content.total.videos > offset + limit,
        settings: collection.settings,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar feed da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

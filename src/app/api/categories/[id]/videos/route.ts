import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategoryVideos } from '@/lib/services/category'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const result = await getCategoryVideos(categoryId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      userId: session.user.id,
    })

    // Since videos don't have direct playlist relationship, we'll add a placeholder
    // In a future enhancement, we could track which playlist a video came from during import
    const videosWithPlaylist = result.videos.map(video => ({
      ...video,
      playlist: {
        id: 'unknown',
        title: 'Imported Video',
        youtubeId: 'unknown'
      }
    }))

    return NextResponse.json({
      videos: videosWithPlaylist,
      pagination: result.pagination,
      category: result.category,
    })

  } catch (error) {
    console.error('Error fetching category videos:', error)

    if (error instanceof Error && error.message.includes('não encontrada')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
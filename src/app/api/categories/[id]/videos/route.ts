import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // First, get all video IDs that belong to this category directly
    const categoryVideos = await prisma.videoCategory.findMany({
      where: {
        categoryId: categoryId,
        category: {
          userId: session.user.id
        }
      },
      select: {
        videoId: true
      }
    })

    const videoIds = categoryVideos.map(cv => cv.videoId)

    if (videoIds.length === 0) {
      return NextResponse.json([])
    }

    // Build the where clause for videos
    const where: any = {
      id: {
        in: videoIds
      }
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { channelTitle: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build the order by clause
    const orderBy: any = {}
    if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'viewCount') {
      orderBy.viewCount = sortOrder === 'desc' ? 'desc' : 'asc'
    } else if (sortBy === 'duration') {
      orderBy.duration = sortOrder
    } else {
      // Default to publishedAt
      orderBy.publishedAt = sortOrder
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy,
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Since videos don't have direct playlist relationship, we'll add a placeholder
    // In a future enhancement, we could track which playlist a video came from during import
    const videosWithPlaylist = videos.map(video => ({
      ...video,
      playlist: {
        id: 'unknown',
        title: 'Imported Video',
        youtubeId: 'unknown'
      }
    }))

    return NextResponse.json(videosWithPlaylist)

  } catch (error) {
    console.error('Error fetching category videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
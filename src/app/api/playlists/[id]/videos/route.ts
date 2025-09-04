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

    const playlistId = params.id
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // First, verify the playlist exists and belongs to the user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: session.user.id
      }
    })

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }


    // Build the where clause for videos
    // Filter videos that are associated with this playlist
    const where: any = {
      userId: session.user.id,
      playlists: {
        some: {
          playlistId: playlistId
        }
      }
    }

    // Add search filter if provided
    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { channelTitle: { contains: search, mode: 'insensitive' } }
          ]
        }
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




    // Add playlist information to each video
    const videosWithPlaylist = videos.map(video => ({
      ...video,
      playlist: {
        id: playlist.id,
        title: playlist.title,
        youtubeId: playlist.youtubeId
      }
    }))

    return NextResponse.json(videosWithPlaylist)

  } catch (error) {
    console.error('Error fetching playlist videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
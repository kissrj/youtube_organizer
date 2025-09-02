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

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id
      },
      include: {
        playlists: {
          include: {
            playlist: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                itemCount: true
              }
            }
          }
        },
        videos: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            videos: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}
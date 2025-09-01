import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureVideoDescription } from '@/lib/video-description'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await context.params
  let video = await prisma.video.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    // If missing description, enqueue background job to populate it (best-effort)
    if (!video.description) {
      try {
        const { enqueueDescription } = await import('@/lib/description-queue')
        enqueueDescription(video.youtubeId, session.user?.id)
      } catch (err) {
        console.warn('Erro ao enfileirar descrição do vídeo:', err)
      }
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    return NextResponse.json({ error: 'Erro ao buscar vídeo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await context.params

    // Use deleteMany for safety (only deletes if it belongs to the user)
    const result = await prisma.video.deleteMany({ where: { id, userId: session.user.id } })

    if (!result || result.count === 0) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao apagar vídeo:', error)
    return NextResponse.json({ error: 'Erro ao apagar vídeo' }, { status: 500 })
  }
}
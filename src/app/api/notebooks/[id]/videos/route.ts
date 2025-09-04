import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/notebooks/[id]/videos - Adiciona vídeo ao notebook
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 API Notebooks Videos: Starting POST request')

    const session = await getServerSession(authOptions)
    console.log('👤 API Notebooks Videos: Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionKeys: session ? Object.keys(session) : 'no session'
    })

    if (!session?.user?.id) {
      console.log('❌ API Notebooks Videos: No authenticated user')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { videoId } = await request.json()

    console.log('📝 API Notebooks Videos: Request data:', {
      notebookId: id,
      videoId: videoId,
      userId: session.user.id
    })

    if (!videoId) {
      console.log('❌ API Notebooks Videos: Missing videoId')
      return NextResponse.json(
        { error: 'ID do vídeo é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o notebook existe e pertence ao usuário
    console.log('🔍 API Notebooks Videos: Looking for notebook:', id)
    const notebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    console.log('📓 API Notebooks Videos: Notebook query result:', {
      found: !!notebook,
      notebookId: notebook?.id,
      notebookName: notebook?.name,
      notebookUserId: notebook?.userId,
      sessionUserId: session.user.id
    })

    if (!notebook) {
      console.log('❌ API Notebooks Videos: Notebook not found or does not belong to user')
      return NextResponse.json(
        { error: 'Notebook não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o vídeo existe e pertence ao usuário
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o vídeo já está no notebook
    const existingRelation = await prisma.notebookVideo.findFirst({
      where: {
        notebookId: id,
        videoId: videoId
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Vídeo já está neste notebook' },
        { status: 400 }
      )
    }

    // Adicionar vídeo ao notebook
    const relation = await prisma.notebookVideo.create({
      data: {
        notebookId: id,
        videoId: videoId,
        addedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      relation
    })

  } catch (error) {
    console.error('Erro ao adicionar vídeo ao notebook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
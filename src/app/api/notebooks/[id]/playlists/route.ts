import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/notebooks/[id]/playlists - Adiciona playlist ao notebook
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { playlistId } = await request.json()

    if (!playlistId) {
      return NextResponse.json(
        { error: 'ID da playlist é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o notebook existe e pertence ao usuário
    const notebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a playlist existe e pertence ao usuário
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: session.user.id
      }
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a playlist já está no notebook
    const existingRelation = await prisma.notebookPlaylist.findFirst({
      where: {
        notebookId: id,
        playlistId: playlistId
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Playlist já está neste notebook' },
        { status: 400 }
      )
    }

    // Adicionar playlist ao notebook
    const relation = await prisma.notebookPlaylist.create({
      data: {
        notebookId: id,
        playlistId: playlistId,
        addedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      relation
    })

  } catch (error) {
    console.error('Erro ao adicionar playlist ao notebook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addTagToVideo, removeTagFromVideo } from '@/lib/services/video'
import { findOrCreateTag } from '@/lib/services/tag'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { tagId, tagName } = await request.json()

    if (!tagId && !tagName) {
      return NextResponse.json(
        { error: 'ID da tag ou nome da tag é obrigatório' },
        { status: 400 }
      )
    }

    let finalTagId = tagId

    // Se foi fornecido um nome de tag, tenta encontrar ou criar a tag
    if (tagName && !tagId) {
      try {
        const tag = await findOrCreateTag(tagName.trim(), session.user.id)
        finalTagId = tag.id
      } catch (error) {
        console.error('Erro ao criar/encontrar tag:', error)
        return NextResponse.json(
          { error: 'Erro ao processar nome da tag. Verifique se o nome é válido.' },
          { status: 400 }
        )
      }
    }

    // Adiciona a tag ao vídeo
    await addTagToVideo(id, finalTagId)

    return NextResponse.json({
      message: 'Tag adicionada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao adicionar tag ao vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json(
        { error: 'ID da tag é obrigatório' },
        { status: 400 }
      )
    }

    await removeTagFromVideo(id, tagId)

    return NextResponse.json({ message: 'Tag removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover tag do vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
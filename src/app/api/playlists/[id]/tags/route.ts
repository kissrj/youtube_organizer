import { NextRequest, NextResponse } from 'next/server'
import { addTagToPlaylist, removeTagFromPlaylist, findOrCreateTag } from '@/lib/services/tag'

// Por enquanto, usando um userId fixo para demonstração
const DEMO_USER_ID = 'demo-user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { tagName } = await request.json()

    if (!tagName) {
      return NextResponse.json(
        { error: 'Nome da tag é obrigatório' },
        { status: 400 }
      )
    }

    // Primeiro, encontra ou cria a tag
    const tag = await findOrCreateTag(tagName, DEMO_USER_ID)

    // Depois, adiciona a tag à playlist
    const result = await addTagToPlaylist(id, tag.id)
    return NextResponse.json({ ...result, tag })
  } catch (error) {
    console.error('Erro ao adicionar tag à playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json(
        { error: 'ID da tag é obrigatório' },
        { status: 400 }
      )
    }

    await removeTagFromPlaylist(id, tagId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover tag da playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao remover tag' },
      { status: 500 }
    )
  }
}
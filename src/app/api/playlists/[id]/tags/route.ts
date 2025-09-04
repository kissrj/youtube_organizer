import { NextRequest, NextResponse } from 'next/server'
import { addTagToPlaylist, removeTagFromPlaylist } from '@/lib/services/tag'

// Por enquanto, usando um userId fixo para demonstração
const DEMO_USER_ID = 'demo-user'

export async function POST(
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

    // Adiciona a tag à playlist
    const result = await addTagToPlaylist(id, tagId)
    return NextResponse.json({ ...result, success: true })
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
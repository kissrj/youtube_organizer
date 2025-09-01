import { NextRequest, NextResponse } from 'next/server'
import { addPlaylistToCategory, removePlaylistFromCategory } from '@/lib/services/category'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { categoryId } = await request.json()

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      )
    }

    const result = await addPlaylistToCategory(id, categoryId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao adicionar categoria à playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar categoria' },
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
    const { categoryId } = await request.json()

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      )
    }

    await removePlaylistFromCategory(id, categoryId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover categoria da playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao remover categoria' },
      { status: 500 }
    )
  }
}
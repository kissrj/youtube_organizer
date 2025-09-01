import { NextRequest, NextResponse } from 'next/server'
import { deleteTag } from '@/lib/services/tag'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteTag(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir tag:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir tag' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  addItemsToCollection,
  removeItemsFromCollection,
  getCollection,
  addItemsSchema,
  removeItemsSchema,
} from '@/lib/services/collections'

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
    const body = await request.json()
    const validatedData = addItemsSchema.parse(body)

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const result = await addItemsToCollection(id, validatedData)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Itens adicionados com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao adicionar itens:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
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
    const body = await request.json()
    const validatedData = removeItemsSchema.parse(body)

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const result = await removeItemsFromCollection(id, validatedData)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Itens removidos com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao remover itens:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

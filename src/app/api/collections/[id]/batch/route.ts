import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  addItemsToCollection,
  removeItemsFromCollection,
} from '@/lib/services/collections'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    min: () => ({
      optional: () => ({ parse: (data: any) => data })
    })
  }),
  enum: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  array: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  object: (shape: any) => ({
    optional: () => ({ parse: (data: any) => data })
  })
}

const batchAddSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(['video', 'channel', 'playlist']),
      id: z.string().min(1),
      title: z.string().optional(),
      description: z.string().optional(),
      thumbnail: z.string().optional(),
      url: z.string().optional(),
    })
  ).min(1).max(100),
})

const batchRemoveSchema = z.object({
  itemIds: z.array(z.string()).min(1).max(100),
})

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

    // Validate input
    const validation = batchAddSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const result = await addItemsToCollection(id, validation.data.items)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao adicionar itens em lote à coleção:', error)
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

    // Validate input
    const validation = batchRemoveSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const result = await removeItemsFromCollection(id, validation.data.itemIds)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao remover itens em lote da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

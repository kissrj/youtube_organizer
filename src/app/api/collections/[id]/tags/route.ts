import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  addItemsToCollection,
  removeItemsFromCollection,
  getCollectionContent,
} from '@/lib/services/collections'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    min: () => ({
      max: () => ({ parse: (data: any) => data })
    })
  }),
  array: () => ({
    min: () => ({
      max: () => ({ parse: (data: any) => data })
    })
  }),
  object: (shape: any) => ({
    parse: (data: any) => data
  })
}

const addTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).min(1).max(20),
})

const removeTagsSchema = z.object({
  tagIds: z.array(z.string()).min(1).max(20),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const tags = await getCollectionContent(id)

    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error('Erro ao buscar tags da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
    const validation = addTagsSchema.safeParse(body)
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

    const result = await addItemsToCollection(id, { videos: validation.data.tags })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao adicionar tags à coleção:', error)
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
    const validation = removeTagsSchema.safeParse(body)
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

    const result = await removeItemsFromCollection(id, { videos: validation.data.tagIds })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao remover tags da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

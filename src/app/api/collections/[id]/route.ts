import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  updateCollection,
  deleteCollection,
  updateCollectionSchema,
} from '@/lib/services/collections'

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
    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeContent = searchParams.get('includeContent') === 'true'
    const includeSettings = searchParams.get('includeSettings') === 'true'

    const collection = await getCollection(id, {
      includeChildren,
      includeContent,
      includeSettings,
    })

    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: collection,
    })
  } catch (error) {
    console.error('Erro ao buscar coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const validatedData = updateCollectionSchema.parse(body)

    // Check if collection exists and belongs to user
    const existingCollection = await getCollection(id)
    if (!existingCollection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (existingCollection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const collection = await updateCollection(id, validatedData)

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Coleção atualizada com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao atualizar coleção:', error)

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

    // Check if collection exists and belongs to user
    const existingCollection = await getCollection(id)
    if (!existingCollection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (existingCollection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await deleteCollection(id)

    return NextResponse.json({
      success: true,
      message: 'Coleção excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

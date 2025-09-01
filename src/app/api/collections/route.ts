import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createCollection,
  getUserCollections,
  createCollectionSchema,
} from '@/lib/services/collections'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeContent = searchParams.get('includeContent') === 'true'
    const includeSettings = searchParams.get('includeSettings') === 'true'
    const parentId = searchParams.get('parentId') || undefined

    const collections = await getUserCollections(session.user.id, {
      includeChildren,
      includeContent,
      includeSettings,
      parentId,
    })

    // Build hierarchy if requested
    let hierarchy: any[] = []
    if (includeChildren) {
      hierarchy = collections.filter(c => !c.parentId)
    }

    return NextResponse.json({
      success: true,
      data: {
        collections,
        total: collections.length,
        hierarchy,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar coleções:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCollectionSchema.parse(body)

    const collection = await createCollection({
      ...validatedData,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Coleção criada com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao criar coleção:', error)

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

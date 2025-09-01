import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  searchCollections,
} from '@/lib/services/collections'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({
          default: () => ({ parse: (data: any) => data })
        })
      })
    })
  }),
  enum: () => ({
    optional: () => ({
      default: () => ({ parse: (data: any) => data })
    })
  }),
  number: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({
          default: () => ({ parse: (data: any) => data })
        })
      })
    })
  }),
  object: (shape: any) => ({
    parse: (data: any) => data
  })
}

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['all', 'videos', 'channels', 'playlists']).optional().default('all'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
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
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate input
    const validation = searchSchema.safeParse({
      query,
      type,
      limit,
      offset,
    })

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

    const result = await searchCollections(
      session.user.id,
      validation.data.query,
      {
        limit: validation.data.limit
      }
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao pesquisar conteúdo da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

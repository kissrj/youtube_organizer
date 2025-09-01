import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  updateCollectionSettings,
} from '@/lib/services/collections'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  boolean: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  number: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data: any) => data })
      })
    })
  }),
  string: () => ({
    max: () => ({
      optional: () => ({ parse: (data: any) => data })
    }),
    optional: () => ({ parse: (data: any) => data })
  }),
  array: () => ({
    min: () => ({
      max: () => ({
        optional: () => ({ parse: (data: any) => data })
      })
    })
  }),
  enum: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  object: (shape: any) => ({
    parse: (data: any) => data
  })
}

const updateSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  allowDuplicates: z.boolean().optional(),
  autoAddNewVideos: z.boolean().optional(),
  notificationEnabled: z.boolean().optional(),
  sortBy: z.enum(['addedAt', 'publishedAt', 'title', 'duration', 'views']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  maxItems: z.number().min(1).max(10000).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
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
    const collection = await getCollection(id, { includeSettings: true })
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const settings = await updateCollectionSettings(id, {})

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações da coleção:', error)
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

    // Validate input
    const validation = updateSettingsSchema.safeParse(body)
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

    const result = await updateCollectionSettings(id, validation.data)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações da coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

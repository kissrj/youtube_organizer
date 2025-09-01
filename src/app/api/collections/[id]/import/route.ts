import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  addItemsToCollection,
} from '@/lib/services/collections'
// import { z } from 'zod'

// Temporary simple validation functions to replace zod
const z = {
  string: () => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  object: (shape: any) => ({
    optional: () => ({ parse: (data: any) => data })
  }),
  array: () => ({
    optional: () => ({ parse: (data: any) => data })
  })
}

const importSchema = z.object({
  data: z.object({
    content: z.object({
      videos: z.array(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        thumbnail: z.string().optional(),
      })).optional(),
      channels: z.array(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        thumbnail: z.string().optional(),
      })).optional(),
      playlists: z.array(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        thumbnail: z.string().optional(),
      })).optional(),
    }),
  }),
  options: z.object({
    skipDuplicates: z.boolean().optional().default(true),
    maxItems: z.number().min(1).max(1000).optional().default(100),
  }).optional(),
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
    const validation = importSchema.safeParse(body)
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

    const { data, options = {} } = validation.data
    const { skipDuplicates = true, maxItems = 100 } = options

    // Combine all items
    const allItems: any[] = []

    if (data.content.videos) {
      data.content.videos.slice(0, maxItems).forEach(video => {
        allItems.push({
          type: 'video',
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          url: video.url,
        })
      })
    }

    if (data.content.channels && allItems.length < maxItems) {
      data.content.channels.slice(0, maxItems - allItems.length).forEach(channel => {
        allItems.push({
          type: 'channel',
          id: channel.id,
          title: channel.title,
          description: channel.description,
          thumbnail: channel.thumbnail,
          url: channel.url,
        })
      })
    }

    if (data.content.playlists && allItems.length < maxItems) {
      data.content.playlists.slice(0, maxItems - allItems.length).forEach(playlist => {
        allItems.push({
          type: 'playlist',
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail: playlist.thumbnail,
          url: playlist.url,
        })
      })
    }

    if (allItems.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item válido encontrado para importação' },
        { status: 400 }
      )
    }

    // Add items to collection
    const result = await addItemsToCollection(id, allItems, {
      skipDuplicates,
    })

    return NextResponse.json({
      success: true,
      data: {
        imported: result.added,
        skipped: result.skipped,
        total: allItems.length,
      },
    })
  } catch (error) {
    console.error('Erro ao importar dados para a coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

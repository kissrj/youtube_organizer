import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCollection,
  getCollectionContent,
  updateCollectionSettings,
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
    const format = searchParams.get('format') || 'json'
    const includeSettings = searchParams.get('includeSettings') === 'true'

    // Check if collection exists and belongs to user
    const collection = await getCollection(id)
    if (!collection) {
      return NextResponse.json({ error: 'Coleção não encontrada' }, { status: 404 })
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Get all content
    const content = await getCollectionContent(id, {
      type: 'all',
      limit: 10000, // Large limit for export
      offset: 0,
    })

    let exportData: any = {
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      content: {
        videos: content.videos,
        channels: content.channels,
        playlists: content.playlists,
      },
      total: content.total,
    }

    if (includeSettings) {
      const settings = await updateCollectionSettings(id, {})
      exportData.settings = settings
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvContent = generateCSV(exportData)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${collection.name.replace(/[^a-z0-9]/gi, '_')}.csv"`,
        },
      })
    } else {
      // Default JSON format
      return NextResponse.json({
        success: true,
        data: exportData,
      })
    }
  } catch (error) {
    console.error('Erro ao exportar coleção:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any): string {
  const headers = ['Type', 'ID', 'Title', 'Description', 'URL', 'Added At']
  let csv = headers.join(',') + '\n'

  // Add videos
  data.content.videos.forEach((video: any) => {
    csv += [
      'video',
      video.id,
      `"${video.title?.replace(/"/g, '""') || ''}"`,
      `"${video.description?.replace(/"/g, '""') || ''}"`,
      video.url || '',
      video.addedAt || '',
    ].join(',') + '\n'
  })

  // Add channels
  data.content.channels.forEach((channel: any) => {
    csv += [
      'channel',
      channel.id,
      `"${channel.title?.replace(/"/g, '""') || ''}"`,
      `"${channel.description?.replace(/"/g, '""') || ''}"`,
      channel.url || '',
      channel.addedAt || '',
    ].join(',') + '\n'
  })

  // Add playlists
  data.content.playlists.forEach((playlist: any) => {
    csv += [
      'playlist',
      playlist.id,
      `"${playlist.title?.replace(/"/g, '""') || ''}"`,
      `"${playlist.description?.replace(/"/g, '""') || ''}"`,
      playlist.url || '',
      playlist.addedAt || '',
    ].join(',') + '\n'
  })

  return csv
}

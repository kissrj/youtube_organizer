import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlaylistItems } from '@/lib/youtube'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: playlistId } = await params
    const userId = session.user.id

    // Verificar se a playlist existe e pertence ao usuário
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    })

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist não encontrada' }, { status: 404 })
    }

    // Buscar vídeos da playlist no YouTube
    const youtubeVideos = await getPlaylistItems(playlist.youtubeId)

    if (youtubeVideos.length === 0) {
      return NextResponse.json({
        message: 'Nenhum vídeo encontrado na playlist',
        imported: 0,
        skipped: 0,
        errors: 0
      })
    }

    let imported = 0
    let skipped = 0
    let errors = 0
    const results = []

    // Processar cada vídeo
    for (const youtubeVideo of youtubeVideos) {
      try {
        // Verificar se o vídeo já existe
        const existingVideo = await prisma.video.findFirst({
          where: {
            youtubeId: youtubeVideo.videoId,
            userId,
          },
        })

        if (existingVideo) {
          skipped++
          results.push({
            videoId: youtubeVideo.videoId,
            status: 'skipped',
            reason: 'Vídeo já importado'
          })
          continue
        }

        // Buscar informações detalhadas do vídeo
        const videoDetails = await fetchVideoDetails(youtubeVideo.videoId)

        if (!videoDetails) {
          errors++
          results.push({
            videoId: youtubeVideo.videoId,
            status: 'error',
            reason: 'Não foi possível obter detalhes do vídeo'
          })
          continue
        }

        // Criar o vídeo no banco
        const newVideo = await prisma.video.create({
          data: {
            youtubeId: youtubeVideo.videoId,
            title: videoDetails.title,
            description: videoDetails.description,
            thumbnailUrl: videoDetails.thumbnailUrl,
            channelTitle: videoDetails.channelTitle,
            channelId: videoDetails.channelId,
            duration: videoDetails.duration,
            viewCount: videoDetails.viewCount,
            likeCount: videoDetails.likeCount,
            commentCount: videoDetails.commentCount,
            favoriteCount: videoDetails.favoriteCount,
            publishedAt: new Date(videoDetails.publishedAt),
            definition: videoDetails.definition,
            dimension: videoDetails.dimension,
            projection: videoDetails.projection,
            defaultAudioLanguage: videoDetails.defaultAudioLanguage,
            categoryId: videoDetails.categoryId,
            videoTags: videoDetails.tags ? JSON.stringify(videoDetails.tags) : null,
            userId,
          },
        })

        imported++
        results.push({
          videoId: youtubeVideo.videoId,
          status: 'imported',
          video: newVideo
        })

      } catch (error) {
        console.error(`Erro ao importar vídeo ${youtubeVideo.videoId}:`, error)
        errors++
        results.push({
          videoId: youtubeVideo.videoId,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${imported} importados, ${skipped} pulados, ${errors} erros`,
      imported,
      skipped,
      errors,
      total: youtubeVideos.length,
      results
    })

  } catch (error) {
    console.error('Erro ao sincronizar vídeos da playlist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para buscar detalhes de um vídeo
async function fetchVideoDetails(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Erro na API do YouTube')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]
    const snippet = item.snippet
    const contentDetails = item.contentDetails
    const statistics = item.statistics

    return {
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      duration: contentDetails.duration,
      viewCount: statistics.viewCount || '0',
      likeCount: statistics.likeCount || '0',
      commentCount: statistics.commentCount || '0',
      favoriteCount: statistics.favoriteCount || '0',
      publishedAt: snippet.publishedAt,
      definition: contentDetails.definition,
      dimension: contentDetails.dimension,
      projection: contentDetails.projection,
      defaultAudioLanguage: contentDetails.defaultAudioLanguage,
      categoryId: snippet.categoryId,
      tags: snippet.tags || []
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do vídeo:', error)
    return null
  }
}
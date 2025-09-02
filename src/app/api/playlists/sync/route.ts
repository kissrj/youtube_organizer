import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncPlaylistFromYouTube } from '@/lib/services/playlist'
import { getPlaylistItems } from '@/lib/youtube'
import { prisma } from '@/lib/prisma'

// Helper function to sync videos for a playlist
async function syncPlaylistVideos(playlist: any, userId: string) {
  // Buscar vídeos da playlist no YouTube
  const youtubeVideos = await getPlaylistItems(playlist.youtubeId)

  if (youtubeVideos.length === 0) {
    return {
      message: 'No videos found in playlist',
      imported: 0,
      skipped: 0,
      errors: 0,
      total: 0
    }
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
          reason: 'Video already imported'
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
          reason: 'Could not fetch video details'
        })
        continue
      }

      // Prepare video tags including playlist information
      const videoTags = videoDetails.tags || []
      const playlistInfo = {
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        playlistYoutubeId: playlist.youtubeId,
        importedAt: new Date().toISOString(),
        position: youtubeVideos.indexOf(youtubeVideo) // Position in playlist
      }

      // Add playlist info to tags with a simpler format for easier searching
      const updatedTags = [...videoTags, `playlist_${playlist.id}`, `playlist:${JSON.stringify(playlistInfo)}`]

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
          videoTags: JSON.stringify(updatedTags),
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

  return {
    message: `Import completed: ${imported} imported, ${skipped} skipped, ${errors} errors`,
    imported,
    skipped,
    errors,
    total: youtubeVideos.length,
    results
  }
}

// Helper function to fetch video details
async function fetchVideoDetails(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('YouTube API error')
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
    console.error('Error fetching video details:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { youtubeId } = await request.json()

    if (!youtubeId) {
      return NextResponse.json(
        { error: 'ID do YouTube é obrigatório' },
        { status: 400 }
      )
    }

    // Validação básica do ID
    if (typeof youtubeId !== 'string' || youtubeId.trim().length === 0) {
      return NextResponse.json(
        { error: 'ID do YouTube deve ser uma string não vazia' },
        { status: 400 }
      )
    }

    console.log(`🔄 Iniciando sincronização da playlist ${youtubeId} para usuário ${session.user.id}`)

    const playlist = await syncPlaylistFromYouTube(youtubeId.trim(), session.user.id)

    console.log(`✅ Playlist sincronizada com sucesso: ${playlist.title}`)

    // Automatically import videos from the playlist
    console.log(`📥 Iniciando importação automática de vídeos para playlist ${playlist.id}`)

    try {
      const videoSyncResult = await syncPlaylistVideos(playlist, session.user.id)
      console.log(`✅ Vídeos importados automaticamente: ${videoSyncResult.imported} importados, ${videoSyncResult.skipped} pulados, ${videoSyncResult.errors} erros`)

      return NextResponse.json({
        ...playlist,
        videoSyncResult
      })
    } catch (videoSyncError) {
      console.error('❌ Erro ao importar vídeos automaticamente:', videoSyncError)
      // Still return the playlist even if video import fails
      return NextResponse.json({
        ...playlist,
        videoSyncError: 'Failed to auto-import videos'
      })
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar playlist:', error)

    // Retorna a mensagem de erro específica se for um Error
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
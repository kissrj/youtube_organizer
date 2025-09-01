import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

export interface YouTubePlaylist {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  itemCount: number
  publishedAt: string
}

export interface YouTubePlaylistItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoId: string
  publishedAt: string
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  channelId: string
  duration: string
  viewCount: string
  likeCount: string
  commentCount: string
  favoriteCount: string
  publishedAt: string
  definition: string
  dimension: string
  projection: string
  defaultAudioLanguage: string
  categoryId: string
  tags: string[]
}

/**
 * Busca as playlists de um canal específico
 */
export async function getChannelPlaylists(channelId: string): Promise<YouTubePlaylist[]> {
  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      channelId,
      maxResults: 50,
    })

    return response.data.items?.map(item => ({
      id: item.id!,
      title: item.snippet!.title!,
      description: item.snippet!.description || '',
      thumbnailUrl: item.snippet!.thumbnails?.high?.url || item.snippet!.thumbnails?.default?.url || '',
      channelTitle: item.snippet!.channelTitle!,
      itemCount: item.contentDetails!.itemCount || 0,
      publishedAt: item.snippet!.publishedAt!,
    })) || []
  } catch (error) {
    console.error('Erro ao buscar playlists do canal:', error)
    throw new Error('Falha ao buscar playlists do canal')
  }
}

/**
 * Busca uma playlist específica por ID
 */
export async function getPlaylistById(playlistId: string): Promise<YouTubePlaylist | null> {
  try {
    console.log(`📺 Fazendo requisição para YouTube API: ${playlistId}`)

    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      id: [playlistId],
    })

    console.log(`📊 Resposta da API: ${response.data.items?.length || 0} itens encontrados`)

    const item = response.data.items?.[0]
    if (!item) {
      console.log(`❌ Playlist ${playlistId} não encontrada na resposta da API`)
      return null
    }

    const playlist: YouTubePlaylist = {
      id: item.id!,
      title: item.snippet!.title!,
      description: item.snippet!.description || '',
      thumbnailUrl: item.snippet!.thumbnails?.high?.url || item.snippet!.thumbnails?.default?.url || '',
      channelTitle: item.snippet!.channelTitle!,
      itemCount: item.contentDetails!.itemCount || 0,
      publishedAt: item.snippet!.publishedAt!,
    }

    console.log(`✅ Playlist encontrada: "${playlist.title}"`)
    return playlist
  } catch (error: any) {
    console.error('❌ Erro ao buscar playlist:', error)

    // Trata erros específicos da API do YouTube
    if (error.code === 403) {
      throw new Error(
        'Acesso negado à API do YouTube. Verifique se:\n' +
        '• A chave da API está correta\n' +
        '• A quota diária não foi excedida\n' +
        '• A API do YouTube Data v3 está habilitada'
      )
    } else if (error.code === 404) {
      throw new Error('Playlist não encontrada no YouTube')
    } else if (error.code === 400) {
      throw new Error('ID da playlist inválido ou mal formatado')
    } else if (error.message?.includes('quota')) {
      throw new Error(
        'Quota da API do YouTube excedida. Tente novamente amanhã ou ' +
        'considere fazer upgrade do plano da API.'
      )
    } else {
      throw new Error(`Erro na API do YouTube: ${error.message || 'Erro desconhecido'}`)
    }
  }
}

/**
 * Busca os vídeos de uma playlist
 */
export async function getPlaylistItems(playlistId: string): Promise<YouTubePlaylistItem[]> {
  try {
    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: 50,
    })

    return response.data.items?.map(item => ({
      id: item.id!,
      title: item.snippet!.title!,
      description: item.snippet!.description || '',
      thumbnailUrl: item.snippet!.thumbnails?.high?.url || item.snippet!.thumbnails?.default?.url || '',
      videoId: item.snippet!.resourceId!.videoId!,
      publishedAt: item.snippet!.publishedAt!,
    })) || []
  } catch (error) {
    console.error('Erro ao buscar itens da playlist:', error)
    throw new Error('Falha ao buscar itens da playlist')
  }
}

/**
 * Busca informações de um canal por username ou ID
 */
export async function getChannelInfo(identifier: string): Promise<{ id: string; title: string; description: string } | null> {
  try {
    const response = await youtube.channels.list({
      part: ['snippet'],
      forUsername: identifier.startsWith('@') ? identifier.substring(1) : undefined,
      id: identifier.startsWith('@') ? undefined : [identifier],
      maxResults: 1,
    })

    const channel = response.data.items?.[0]
    if (!channel) return null

    return {
      id: channel.id!,
      title: channel.snippet!.title!,
      description: channel.snippet!.description || '',
    }
  } catch (error) {
    console.error('Erro ao buscar informações do canal:', error)
    throw new Error('Falha ao buscar informações do canal')
  }
}

/**
 * Busca um vídeo específico por ID
 */
export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId],
    })

    const item = response.data.items?.[0]
    if (!item) return null

    return {
      id: item.id!,
      title: item.snippet!.title!,
      description: item.snippet!.description || '',
      thumbnailUrl: item.snippet!.thumbnails?.high?.url || item.snippet!.thumbnails?.default?.url || '',
      channelTitle: item.snippet!.channelTitle!,
      channelId: item.snippet!.channelId!,
      duration: item.contentDetails!.duration || '',
      viewCount: item.statistics?.viewCount || '0',
      likeCount: item.statistics?.likeCount || '0',
      commentCount: item.statistics?.commentCount || '0',
      favoriteCount: item.statistics?.favoriteCount || '0',
      publishedAt: item.snippet!.publishedAt!,
      definition: item.contentDetails!.definition || 'sd',
      dimension: item.contentDetails!.dimension || '2d',
      projection: item.contentDetails!.projection || 'rectangular',
      defaultAudioLanguage: item.snippet!.defaultAudioLanguage || '',
      categoryId: item.snippet!.categoryId || '',
      tags: item.snippet!.tags || [],
    }
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    throw new Error('Falha ao buscar vídeo')
  }
}

/**
 * Busca o título de uma categoria do YouTube pelo ID da categoria
 */
export async function getCategoryById(categoryId: string): Promise<{ id: string; title: string } | null> {
  try {
    const response = await youtube.videoCategories.list({
      part: ['snippet'],
      id: [categoryId],
    })

    const item = response.data.items?.[0]
    if (!item) return null

    return {
      id: item.id!,
      title: item.snippet!.title!,
    }
  } catch (error) {
    console.error('Erro ao buscar categoria do YouTube:', error)
    return null
  }
}

/**
 * Valida se uma chave da API do YouTube é válida
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await youtube.channels.list({
      part: ['snippet'],
      id: ['UCBR8-60-B28hp2BmDPdntcQ'], // Canal do YouTube (exemplo)
      maxResults: 1,
    })
    return true
  } catch (error) {
    console.error('Erro ao validar chave da API:', error)
    return false
  }
}
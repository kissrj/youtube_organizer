import { prisma } from '@/lib/prisma'
import { getPlaylistById, getChannelPlaylists } from '@/lib/youtube'
import { createAuthenticatedYouTubeClient, getYouTubeAccount } from '@/lib/youtube-oauth'

export interface CreatePlaylistData {
  youtubeId: string
  title: string
  description?: string
  thumbnailUrl?: string
  channelTitle?: string
  itemCount?: number
  publishedAt?: Date
  userId: string
}

export interface UpdatePlaylistData {
  title?: string
  description?: string
  thumbnailUrl?: string
  channelTitle?: string
  itemCount?: number
  publishedAt?: Date
}

/**
 * Cria uma nova playlist no banco de dados
 */
export async function createPlaylist(data: CreatePlaylistData) {
  return await prisma.playlist.create({
    data,
  })
}

/**
 * Busca uma playlist por ID do YouTube
 */
export async function getPlaylistByYouTubeId(youtubeId: string, userId: string) {
  return await prisma.playlist.findUnique({
    where: {
      userId_youtubeId: {
        userId,
        youtubeId,
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

/**
 * Busca todas as playlists de um usuário
 */
export async function getUserPlaylists(userId: string, options: {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const { sortBy = 'createdAt', sortOrder = 'desc' } = options;

  // Build the order by clause
  const orderBy: any = {};
  if (sortBy === 'title') {
    orderBy.title = sortOrder;
  } else if (sortBy === 'itemCount') {
    orderBy.itemCount = sortOrder === 'desc' ? 'desc' : 'asc';
  } else if (sortBy === 'publishedAt') {
    orderBy.publishedAt = sortOrder;
  } else {
    // Default to createdAt
    orderBy.createdAt = sortOrder;
  }

  return await prisma.playlist.findMany({
    where: { userId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy,
  })
}

/**
 * Atualiza uma playlist
 */
export async function updatePlaylist(id: string, data: UpdatePlaylistData) {
  return await prisma.playlist.update({
    where: { id },
    data,
  })
}

/**
 * Remove uma playlist
 */
export async function deletePlaylist(id: string) {
  return await prisma.playlist.delete({
    where: { id },
  })
}

/**
 * Valida o formato do ID da playlist do YouTube
 */
function validateYouTubePlaylistId(playlistId: string): boolean {
  // Formatos aceitos:
  // - PLxxxxxxxxxxxxxxxxxxxxxxxxx (34 caracteres)
  // - RDxxxxxxxxxxxxxxxxxxxxxxxxx (34 caracteres)
  // - UUxxxxxxxxxxxxxxxxxxxxxxxxx (34 caracteres)
  const playlistRegex = /^[A-Za-z0-9_-]{34}$/
  return playlistRegex.test(playlistId)
}

/**
 * Busca informações de uma playlist usando OAuth ou API key
 */
async function fetchPlaylistInfo(youtubeId: string, userId: string) {
  try {
    // Primeiro, tenta usar OAuth (para playlists privadas)
    const youtubeAccount = await getYouTubeAccount(userId)

    if (youtubeAccount?.accessToken) {
      console.log('🔐 Tentando acessar com OAuth (playlists privadas permitidas)...')
      try {
        const youtube = await createAuthenticatedYouTubeClient(userId)

        const response = await youtube.playlists.list({
          part: ['snippet', 'contentDetails'],
          id: [youtubeId],
        })

        const item = response.data.items?.[0]
        if (item) {
          console.log('✅ Playlist encontrada via OAuth!')
          return {
            id: item.id!,
            title: item.snippet!.title!,
            description: item.snippet!.description || '',
            thumbnailUrl: item.snippet!.thumbnails?.high?.url || item.snippet!.thumbnails?.default?.url || '',
            channelTitle: item.snippet!.channelTitle!,
            itemCount: item.contentDetails!.itemCount || 0,
            publishedAt: item.snippet!.publishedAt!,
          }
        }
      } catch (oauthError) {
        console.log('⚠️  OAuth falhou, tentando com API key...', oauthError)
      }
    }

    // Fallback para API key (apenas playlists públicas)
    console.log('🔑 Tentando acessar com API key (apenas playlists públicas)...')
    return await getPlaylistById(youtubeId)

  } catch (error) {
    console.error('❌ Erro ao buscar informações da playlist:', error)
    return null
  }
}

/**
 * Sincroniza uma playlist do YouTube com o banco de dados
 */
export async function syncPlaylistFromYouTube(youtubeId: string, userId: string) {
  try {
    // Valida o formato do ID da playlist
    if (!validateYouTubePlaylistId(youtubeId)) {
      throw new Error(
        'ID da playlist inválido. Deve ter 34 caracteres alfanuméricos. ' +
        'Exemplo: PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI'
      )
    }

    console.log(`🔍 Buscando playlist ${youtubeId} no YouTube...`)

    // Busca informações da playlist (OAuth primeiro, depois API key)
    const youtubePlaylist = await fetchPlaylistInfo(youtubeId, userId)

    if (!youtubePlaylist) {
      // Verifica se o usuário tem OAuth configurado
      const youtubeAccount = await getYouTubeAccount(userId)
      const hasOAuth = !!youtubeAccount?.accessToken

      if (hasOAuth) {
        throw new Error(
          'Playlist não encontrada. Verifique se:\n' +
          '• O ID da playlist está correto\n' +
          '• A playlist existe\n' +
          '• Você tem permissão para acessá-la\n' +
          '• A playlist não foi excluída'
        )
      } else {
        throw new Error(
          'Playlist não encontrada ou privada. Para acessar playlists privadas:\n' +
          '• Conecte sua conta do YouTube no dashboard\n' +
          '• Ou verifique se a playlist é pública\n' +
          '• Ou confirme se o ID está correto'
        )
      }
    }

    console.log(`✅ Playlist encontrada: "${youtubePlaylist.title}"`)

    // Verifica se a playlist já existe no banco
    const existingPlaylist = await getPlaylistByYouTubeId(youtubeId, userId)

    if (existingPlaylist) {
      console.log('🔄 Atualizando playlist existente...')
      // Atualiza a playlist existente
      const updatedPlaylist = await updatePlaylist(existingPlaylist.id, {
        title: youtubePlaylist.title,
        description: youtubePlaylist.description,
        thumbnailUrl: youtubePlaylist.thumbnailUrl,
        channelTitle: youtubePlaylist.channelTitle,
        itemCount: youtubePlaylist.itemCount,
        publishedAt: new Date(youtubePlaylist.publishedAt),
      })
      console.log('✅ Playlist atualizada com sucesso!')
      return updatedPlaylist
    } else {
      console.log('🆕 Criando nova playlist...')
      // Cria uma nova playlist
      const newPlaylist = await createPlaylist({
        youtubeId,
        title: youtubePlaylist.title,
        description: youtubePlaylist.description,
        thumbnailUrl: youtubePlaylist.thumbnailUrl,
        channelTitle: youtubePlaylist.channelTitle,
        itemCount: youtubePlaylist.itemCount,
        publishedAt: new Date(youtubePlaylist.publishedAt),
        userId,
      })
      console.log('✅ Playlist criada com sucesso!')
      return newPlaylist
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar playlist:', error)

    // Re-throw com mensagem mais clara
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Erro desconhecido ao sincronizar playlist')
    }
  }
}

/**
 * Sincroniza todas as playlists de um canal
 */
export async function syncChannelPlaylists(channelId: string, userId: string) {
  const youtubePlaylists = await getChannelPlaylists(channelId)

  const results = []

  for (const youtubePlaylist of youtubePlaylists) {
    try {
      const playlist = await syncPlaylistFromYouTube(youtubePlaylist.id, userId)
      results.push({ success: true, playlist })
    } catch (error) {
      results.push({
        success: false,
        youtubeId: youtubePlaylist.id,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  return results
}
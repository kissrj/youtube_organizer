import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

// Configuração OAuth do YouTube
const youtubeRedirectUriDefault =
  process.env.YOUTUBE_REDIRECT_URI ||
  (process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/youtube/callback` : undefined)

export function getYouTubeOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri || youtubeRedirectUriDefault
  )
}

/**
 * Verifica se as credenciais do YouTube OAuth estão configuradas
 */
export function validateYouTubeCredentials() {
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET

  if (!clientId || clientId === 'seu-youtube-client-id-aqui') {
    return {
      valid: false,
      error: 'YOUTUBE_CLIENT_ID não configurado ou é placeholder'
    }
  }

  if (!clientSecret || clientSecret === 'seu-youtube-client-secret-aqui') {
    return {
      valid: false,
      error: 'YOUTUBE_CLIENT_SECRET não configurado ou é placeholder'
    }
  }

  return { valid: true }
}

// Escopos necessários para acessar playlists do YouTube
export const youtubeScopes = [
  'https://www.googleapis.com/auth/youtube.readonly', // Ler playlists e vídeos (recomendado)
  // Adicione escopos de escrita somente se necessário:
  // 'https://www.googleapis.com/auth/youtube', // Gerenciar playlists e vídeos (pode exigir verificação)
]

/**
 * Gera URL de autorização OAuth do YouTube
 */
export function generateYouTubeAuthUrl(state?: string, redirectUriOverride?: string) {
  const client = getYouTubeOAuthClient(redirectUriOverride)
  return client.generateAuthUrl({
    access_type: 'offline', // Permite refresh tokens
    scope: youtubeScopes,
    state, // Para proteger contra CSRF
  prompt: 'consent', // Sempre pedir consentimento
  include_granted_scopes: true, // Reutiliza permissões já concedidas
  })
}

/**
 * Troca código de autorização por tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUriOverride?: string) {
  try {
  const client = getYouTubeOAuthClient(redirectUriOverride)
  const { tokens } = await client.getToken(code)
    return tokens
  } catch (error) {
    console.error('Erro ao trocar código por tokens:', error)
    throw new Error('Falha ao obter tokens de acesso')
  }
}

/**
 * Atualiza tokens expirados usando refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
  const client = getYouTubeOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await client.refreshAccessToken()
    return credentials
  } catch (error) {
    console.error('Erro ao atualizar token:', error)
    throw new Error('Falha ao atualizar token de acesso')
  }
}

/**
 * Salva ou atualiza conta YouTube do usuário
 */
export async function saveYouTubeAccount(
  userId: string,
  tokens: any,
  youtubeUserInfo?: any
) {
  try {
    const data = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope,
      youtubeUserId: youtubeUserInfo?.id,
      youtubeUsername: youtubeUserInfo?.username,
      updatedAt: new Date(),
    }

    return await prisma.youTubeAccount.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
        connectedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Erro ao salvar conta YouTube:', error)
    throw new Error('Falha ao salvar conta YouTube')
  }
}

/**
 * Obtém conta YouTube do usuário
 */
export async function getYouTubeAccount(userId: string) {
  try {
    return await prisma.youTubeAccount.findUnique({
      where: { userId },
    })
  } catch (error) {
    console.error('Erro ao buscar conta YouTube:', error)
    return null
  }
}

/**
 * Remove conta YouTube do usuário
 */
export async function disconnectYouTubeAccount(userId: string) {
  try {
    return await prisma.youTubeAccount.delete({
      where: { userId },
    })
  } catch (error) {
    console.error('Erro ao desconectar conta YouTube:', error)
    throw new Error('Falha ao desconectar conta YouTube')
  }
}

/**
 * Verifica se o token está expirado e atualiza se necessário
 */
export async function ensureValidToken(userId: string) {
  const account = await getYouTubeAccount(userId)
  if (!account) {
    throw new Error('Conta YouTube não conectada')
  }

  const now = new Date()
  const expiryDate = account.tokenExpiry

  // Se não há data de expiração ou token já expirou
  if (!expiryDate || expiryDate <= now) {
    if (!account.refreshToken) {
      throw new Error('Token expirado e não há refresh token disponível')
    }

    console.log('🔄 Atualizando token expirado...')
    const newTokens = await refreshAccessToken(account.refreshToken)

    // Salva novos tokens
    await saveYouTubeAccount(userId, {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || account.refreshToken,
      expiry_date: newTokens.expiry_date,
      scope: newTokens.scope,
    })

    return newTokens.access_token
  }

  return account.accessToken
}

/**
 * Cria cliente YouTube autenticado
 */
export async function createAuthenticatedYouTubeClient(userId: string) {
  const accessToken = await ensureValidToken(userId)

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  })
}

/**
 * Busca informações do usuário autenticado no YouTube
 */
export async function getYouTubeUserInfo(accessToken: string) {
  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    })

    const response = await youtube.channels.list({
      part: ['snippet'],
      mine: true, // Busca o canal do usuário autenticado
    })

    const channel = response.data.items?.[0]
    if (!channel) {
      throw new Error('Não foi possível obter informações do canal')
    }

    return {
      id: channel.id,
      title: channel.snippet?.title,
      username: channel.snippet?.customUrl,
      thumbnail: channel.snippet?.thumbnails?.default?.url,
    }
  } catch (error) {
    console.error('Erro ao buscar informações do YouTube:', error)
    throw new Error('Falha ao obter informações do usuário YouTube')
  }
}
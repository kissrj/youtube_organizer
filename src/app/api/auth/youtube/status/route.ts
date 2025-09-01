import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYouTubeAccount } from '@/lib/youtube-oauth'

/**
 * Verifica o status da conexão YouTube do usuário
 * GET /api/auth/youtube/status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const youtubeAccount = await getYouTubeAccount(session.user.id)

    if (!youtubeAccount) {
      return NextResponse.json({
        connected: false,
        message: 'Conta YouTube não conectada'
      })
    }

    // Verifica se o token ainda é válido
    const now = new Date()
    const isTokenValid = youtubeAccount.tokenExpiry && youtubeAccount.tokenExpiry > now

    return NextResponse.json({
      connected: true,
      youtubeUserId: youtubeAccount.youtubeUserId,
      youtubeUsername: youtubeAccount.youtubeUsername,
      connectedAt: youtubeAccount.connectedAt,
      tokenValid: isTokenValid,
      tokenExpiry: youtubeAccount.tokenExpiry,
      scope: youtubeAccount.scope,
    })

  } catch (error) {
    console.error('Erro ao verificar status YouTube:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
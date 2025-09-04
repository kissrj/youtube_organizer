import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYouTubeAccount, validateYouTubeCredentials } from '@/lib/youtube-oauth'

/**
 * Endpoint de teste para verificar a configuração do YouTube
 * GET /api/test-youtube
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Usuário não autenticado',
        authenticated: false
      }, { status: 401 })
    }

    // Verificar credenciais OAuth
    const credentialCheck = validateYouTubeCredentials()

    // Verificar conta YouTube no banco
    const youtubeAccount = await getYouTubeAccount(session.user.id)

    // Verificar se o token é válido
    let tokenValid = false
    if (youtubeAccount?.tokenExpiry) {
      const now = new Date()
      tokenValid = youtubeAccount.tokenExpiry > now
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      credentialsConfigured: credentialCheck.valid,
      credentialsError: credentialCheck.error,
      youtubeAccountExists: !!youtubeAccount,
      youtubeAccount: youtubeAccount ? {
        youtubeUserId: youtubeAccount.youtubeUserId,
        youtubeUsername: youtubeAccount.youtubeUsername,
        connectedAt: youtubeAccount.connectedAt,
        tokenExpiry: youtubeAccount.tokenExpiry,
        tokenValid,
        scope: youtubeAccount.scope
      } : null,
      status: youtubeAccount ? 'connected' : 'not_connected'
    })

  } catch (error) {
    console.error('Erro no teste do YouTube:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
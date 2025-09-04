import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveYouTubeAccount, getYouTubeUserInfo } from '@/lib/youtube-oauth'

/**
 * Callback OAuth do YouTube
 * GET /api/auth/youtube/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')
  const origin = new URL(request.url).origin
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${origin}/api/auth/youtube/callback`

  try {
    // Verifica se houve erro na autorização
    if (error) {
      console.error('Erro na autorização YouTube:', error)
      return NextResponse.redirect(
        new URL('/?error=youtube_auth_failed', request.url)
      )
    }

    // Verifica se o código foi fornecido
    if (!code) {
      console.error('Código de autorização não fornecido')
      return NextResponse.redirect(
        new URL('/?error=youtube_no_code', request.url)
      )
    }

    // Verifica se o state (userId) foi fornecido
    if (!state) {
      console.error('User ID não fornecido no state')
      return NextResponse.redirect(
        new URL('/?error=youtube_no_state', request.url)
      )
    }

    console.log(`🔄 Processando callback OAuth para usuário ${state}`)

    // Troca o código por tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    console.log('✅ Tokens obtidos com sucesso')

    // Busca informações do usuário no YouTube (tolerante a falhas)
    let userInfo: any = null
    try {
      userInfo = await getYouTubeUserInfo(tokens.access_token!)
      console.log(`👤 Usuário YouTube: ${userInfo.title} (${userInfo.id})`)
    } catch (e) {
      console.warn('⚠️ Não foi possível obter info do usuário YouTube agora, salvando apenas tokens.')
    }

    // Salva a conta YouTube no banco, mesmo se userInfo falhar
    await saveYouTubeAccount(state, tokens, userInfo || undefined)
    console.log('💾 Conta YouTube salva com sucesso')

    // Redireciona para o dashboard com sucesso
    return NextResponse.redirect(
      new URL('/?success=youtube_connected', request.url)
    )

  } catch (error) {
    console.error('❌ Erro no callback OAuth do YouTube:', error)

    // Log detalhado para diagnóstico
    console.error('Detalhes do erro:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      code: code ? 'Presente' : 'Ausente',
      state: state ? 'Presente' : 'Ausente',
      error_param: error || 'Nenhum',
      redirectUri: redirectUri
    })

    // Determinar tipo de erro para melhor tratamento
    let errorType = 'youtube_callback_error'
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        errorType = 'youtube_invalid_grant'
      } else if (error.message.includes('redirect_uri_mismatch')) {
        errorType = 'youtube_redirect_uri_mismatch'
      } else if (error.message.includes('access_denied')) {
        errorType = 'youtube_access_denied'
      }
    }

    // Redireciona com erro específico
    return NextResponse.redirect(
      new URL(`/?error=${errorType}&details=${encodeURIComponent(error instanceof Error ? error.message : 'Erro desconhecido')}`, request.url)
    )
  }
}
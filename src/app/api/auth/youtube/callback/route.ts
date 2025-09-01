import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveYouTubeAccount, getYouTubeUserInfo } from '@/lib/youtube-oauth'

/**
 * Callback OAuth do YouTube
 * GET /api/auth/youtube/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

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
  const origin = new URL(request.url).origin
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${origin}/api/auth/youtube/callback`
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
    console.error('Erro no callback OAuth do YouTube:', error)

    // Redireciona com erro
    return NextResponse.redirect(
      new URL('/?error=youtube_callback_error', request.url)
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateYouTubeAuthUrl, validateYouTubeCredentials } from '@/lib/youtube-oauth'

/**
 * Inicia o fluxo de autenticação OAuth do YouTube
 * GET /api/auth/youtube
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verifica se as credenciais do YouTube OAuth estão configuradas
    const credentialCheck = validateYouTubeCredentials()
    if (!credentialCheck.valid) {
      return NextResponse.json(
        {
          error: 'Credenciais YouTube OAuth não configuradas',
          details: credentialCheck.error,
          setup_instructions: {
            step1: 'Acesse https://console.cloud.google.com/',
            step2: 'Selecione seu projeto ou crie um novo',
            step3: 'Habilite a YouTube Data API v3',
            step4: 'Vá para Credenciais > Criar Credenciais > ID do cliente OAuth',
            step5: 'Configure como "Aplicativo Web" e adicione a URI de redirecionamento',
            step6: 'Copie o Client ID e Client Secret para o arquivo .env'
          }
        },
        { status: 400 }
      )
    }

  // Gera URL de autorização OAuth
  // Preferir variável de ambiente para evitar mismatch (ex.: acessar via IP/rede)
  const origin = new URL(request.url).origin
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${origin}/api/auth/youtube/callback`
  const authUrl = generateYouTubeAuthUrl(session.user.id, redirectUri)

    return NextResponse.json({
      authUrl,
      message: 'Redirecione o usuário para esta URL para autorizar o acesso ao YouTube'
    })

  } catch (error) {
    console.error('Erro ao gerar URL de autenticação YouTube:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
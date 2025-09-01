import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncPlaylistFromYouTube } from '@/lib/services/playlist'

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

    console.log(`✅ Sincronização concluída com sucesso para playlist ${youtubeId}`)

    return NextResponse.json(playlist)
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
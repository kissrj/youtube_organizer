import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { reindexAllUserVideos } from '@/lib/services/content-indexer'

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log(`🔄 Iniciando reindexação de conteúdo para usuário: ${session.user.id}`)

    // Executa a reindexação
    await reindexAllUserVideos(session.user.id)

    console.log(`✅ Reindexação concluída com sucesso para usuário: ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Conteúdo reindexado com sucesso',
    })

  } catch (error) {
    console.error('❌ Erro na reindexação:', error)

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
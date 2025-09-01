import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncVideoFromYouTube } from '@/lib/services/video'
import { prisma } from '@/lib/prisma'
import { VideoImportError, logVideoImportError } from '@/lib/errors/video-errors'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { youtubeId } = await request.json()

    if (!youtubeId) {
      return NextResponse.json(
        { error: 'ID do vídeo é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔄 Iniciando sincronização do vídeo ${youtubeId} para usuário ${session.user.id}`)

    const video = await syncVideoFromYouTube(youtubeId, session.user.id)

    console.log(`✅ Vídeo ${youtubeId} sincronizado com sucesso`)

    return NextResponse.json({
      message: 'Vídeo importado com sucesso',
      video
    })
  } catch (error) {
    // Log do erro para debugging
    logVideoImportError(error as VideoImportError, {
      timestamp: new Date().toISOString()
    })

    // Trata erros específicos com mensagens padronizadas
    if (error instanceof VideoImportError) {
      return NextResponse.json(
        { error: error.userMessage },
        { status: error.statusCode }
      )
    }

    // Fallback para erros não tratados
    console.error('❌ Erro não tratado na sincronização de vídeo:', error)
    return NextResponse.json(
      { error: '❌ Erro interno do servidor!\n\nTente novamente em alguns instantes.' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVideoTranscript, getTranscriptText } from '@/lib/services/transcript'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: videoId } = await context.params

    // Verifica se o vídeo existe e pertence ao usuário
  const video = await prisma.video.findFirst({
      where: {
        youtubeId: videoId,
        userId: session.user.id,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    // 1) Cache: se já existe transcript salvo, retorna
    const cachedItems = (() => { try { return JSON.parse((video as any).transcriptJson || 'null') } catch { return null } })()
    const cachedText = (video as any).transcriptText as string | undefined
    const cachedSource = ((video as any).transcriptSource as string | undefined) || 'public'
    if (cachedItems && Array.isArray(cachedItems) && cachedItems.length > 0 && cachedText) {
      return NextResponse.json({
        transcript: cachedItems,
        text: cachedText,
        source: cachedSource,
        videoId,
        itemCount: cachedItems.length,
        textLength: cachedText.length,
        cached: true,
      })
    }

  // 2) Busca o transcript externo (usa idioma preferido se disponível)
    console.log(`🎯 Iniciando busca de transcript para vídeo: ${videoId}`)
  const preferredLang = (video as any).defaultAudioLanguage as string | undefined
  const transcript = await getVideoTranscript(videoId, session.user.id, { preferredLang })

    // Verifica se o transcript tem conteúdo válido
  if (!transcript || transcript.items.length === 0) {
      console.log('⚠️ Transcript vazio ou nulo retornado')
      return NextResponse.json(
        { error: 'Transcript não disponível para este vídeo' },
        { status: 404 }
      )
    }

  const transcriptText = transcript.text

    // Verifica se o texto do transcript não está vazio
    if (!transcriptText || transcriptText.trim().length === 0) {
      console.log('⚠️ Texto do transcript está vazio')
      return NextResponse.json(
        { error: 'Transcript não disponível para este vídeo' },
        { status: 404 }
      )
    }

  console.log(`✅ Transcript obtido com sucesso: ${transcript.items.length} itens, ${transcriptText.length} caracteres`) 

    // Cache: salva transcript e fonte
    try {
      await prisma.video.update({
        where: { id: video.id },
        data: {
          // Campos novos; casting para evitar erro de tipos até aplicar prisma migrate
          ...( {
            transcriptJson: JSON.stringify(transcript.items),
            transcriptText: transcriptText,
            transcriptSource: transcript.source,
            transcriptStatus: 'available',
            transcriptUpdatedAt: new Date(),
          } as any ),
        },
      })
    } catch (e) {
      console.log('⚠️ Falha ao cachear transcript:', e)
    }

    return NextResponse.json({
  transcript: transcript.items,
  text: transcriptText,
  source: transcript.source,
      videoId,
  itemCount: transcript.items.length,
      textLength: transcriptText.length,
    })

  } catch (error) {
    console.error('Erro ao buscar transcript:', error)

    if (error instanceof Error && error.message.includes('Transcript não disponível')) {
      try {
        await prisma.video.update({
          where: { id: (await prisma.video.findFirst({ where: { youtubeId: (new URL(request.url)).pathname.split('/').at(-2) || '' } }))?.id || '' },
          data: { transcriptStatus: 'unavailable' } as any,
        })
      } catch {}
      return NextResponse.json({ error: 'Transcript não disponível para este vídeo' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

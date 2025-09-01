import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateTranscriptSummary, analyzeTranscriptSentiment, extractTopics } from '@/lib/services/ai-summary'
import { getVideoTranscript } from '@/lib/services/transcript'
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
    const { searchParams } = new URL(request.url)

    const includeSentiment = searchParams.get('sentiment') === 'true'
    const includeTopics = searchParams.get('topics') === 'true'
    const maxLength = parseInt(searchParams.get('maxLength') || '500')

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

    // Busca o transcript
  const transcript = await getVideoTranscript(videoId, session.user.id)
  const transcriptText = transcript.text

    if (!transcriptText.trim()) {
      return NextResponse.json({ error: 'Transcript não disponível' }, { status: 404 })
    }

    // Gera o resumo principal
    const summary = await generateTranscriptSummary(transcriptText, {
      maxLength,
      language: 'pt-BR',
    })

    const result: any = {
      summary,
      videoId,
      generatedAt: new Date().toISOString(),
    }

    // Análise de sentimento (opcional)
    if (includeSentiment) {
      try {
        const sentiment = await analyzeTranscriptSentiment(transcriptText)
        result.sentiment = sentiment
      } catch (error) {
        console.error('Erro ao analisar sentimento:', error)
        result.sentiment = null
      }
    }

    // Extração de tópicos (opcional)
    if (includeTopics) {
      try {
        const topics = await extractTopics(transcriptText)
        result.topics = topics
      } catch (error) {
        console.error('Erro ao extrair tópicos:', error)
        result.topics = []
      }
    }

    // Salva o resumo no banco (opcional, para cache)
    // Aqui poderíamos adicionar campos para armazenar resumos

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro ao gerar resumo:', error)

    if (error instanceof Error && error.message.includes('Transcript não disponível')) {
      return NextResponse.json(
        { error: 'Transcript não disponível para gerar resumo' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

  const { id: videoId } = await context.params
    const body = await request.json()

    const {
      customPrompt,
      maxLength = 500,
      language = 'pt-BR',
      focusAreas = []
    } = body

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

    // Busca o transcript
  const transcript = await getVideoTranscript(videoId, session.user.id)
  const transcriptText = transcript.text

    if (!transcriptText.trim()) {
      return NextResponse.json({ error: 'Transcript não disponível' }, { status: 404 })
    }

    // Gera resumo personalizado
    const summary = await generateTranscriptSummary(transcriptText, {
      maxLength,
      language,
      focusAreas,
    })

    return NextResponse.json({
      summary,
      videoId,
      customPrompt: customPrompt || null,
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Erro ao gerar resumo personalizado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
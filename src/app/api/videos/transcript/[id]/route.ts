import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVideoTranscript } from '@/lib/services/transcript'

// Lightweight endpoint that returns a transcript for a YouTube video id
// Does not require the video to exist in DB and does not cache
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const { id: videoId } = context.params

    const transcript = await getVideoTranscript(videoId, userId)
    if (!transcript || transcript.items.length === 0 || !(transcript.text || '').trim()) {
      return NextResponse.json({ error: 'Transcript não disponível para este vídeo' }, { status: 404 })
    }

    return NextResponse.json({
      transcript: transcript.items,
      text: transcript.text,
      source: transcript.source,
      videoId,
      itemCount: transcript.items.length,
      textLength: transcript.text.length,
      cached: false,
    })
  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || ''
    if (msg.includes('Transcript não dispon') || msg.includes('Transcript n')) {
      return NextResponse.json({ error: 'Transcript não disponível para este vídeo' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

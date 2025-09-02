import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 501 })
    }

    const { id: videoId } = context.params

    // Ensure the video exists for this user (so we can cache the transcript)
    const video = await prisma.video.findFirst({ where: { youtubeId: videoId, userId: session.user.id } })
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Call OpenAI Whisper API (verbose_json to get segments with timestamps)
    const openaiForm = new FormData()
    openaiForm.append('model', 'whisper-1')
    openaiForm.append('response_format', 'verbose_json')
    openaiForm.append('file', file as any)

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiForm as any,
    })

    if (!resp.ok) {
      const errData = await resp.text().catch(() => '')
      return NextResponse.json({ error: 'Transcription failed', details: errData }, { status: 502 })
    }

    const data = await resp.json()
    // data.segments: [{ id, start, end, text }]
    const segments = Array.isArray(data?.segments) ? data.segments : []
    if (segments.length === 0) {
      const text = typeof data?.text === 'string' ? data.text : ''
      if (!text.trim()) {
        return NextResponse.json({ error: 'Empty transcription result' }, { status: 422 })
      }
      // No segments available; fallback to single segment (0..text length)
      const items = [{ text, start: 0, duration: Math.max(1, Math.round(text.length / 12)) }]
      await prisma.video.update({
        where: { id: video.id },
        data: {
          ...( {
            transcriptJson: JSON.stringify(items),
            transcriptText: text,
            transcriptSource: 'self',
            transcriptStatus: 'available',
            transcriptUpdatedAt: new Date(),
          } as any ),
        },
      })
      return NextResponse.json({ transcript: items, text, source: 'self', videoId, itemCount: items.length, textLength: text.length, cached: true })
    }

    const items = segments.map((s: any) => ({ text: String(s.text || '').trim(), start: Number(s.start) || 0, duration: Math.max(0, (Number(s.end) || 0) - (Number(s.start) || 0)) }))
    const text = items.map((i: any) => i.text).join(' ')

    await prisma.video.update({
      where: { id: video.id },
      data: {
        ...( {
          transcriptJson: JSON.stringify(items),
          transcriptText: text,
          transcriptSource: 'self',
          transcriptStatus: 'available',
          transcriptUpdatedAt: new Date(),
        } as any ),
      },
    })

    return NextResponse.json({ transcript: items, text, source: 'self', videoId, itemCount: items.length, textLength: text.length, cached: true })

  } catch (error) {
    console.error('Self transcription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


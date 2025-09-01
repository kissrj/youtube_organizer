import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVideoTranscript } from '@/lib/services/transcript'

export async function GET(request: NextRequest, context: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await context.params

  // Dev-only helper: allow forcing an authenticated user id via query to test OAuth fallback
  // Usage: /api/debug/transcript/<id>?asUserId=<userId>
  const url = new URL(request.url)
  const asUserId = url.searchParams.get('asUserId')

  const result: any = {
    videoId,
    attempts: {
      public: null,
      authenticated: null,
    },
  }

  // 1) Try public fetch (no user)
  try {
    const publicTranscript = await getVideoTranscript(videoId as string)
    result.attempts.public = {
      ok: true,
      itemCount: Array.isArray(publicTranscript?.items) ? publicTranscript.items.length : 0,
      textLength: (publicTranscript?.text || '').length,
      source: publicTranscript?.source || null,
      sample: (publicTranscript?.text || '').slice(0, 400),
    }
  } catch (err: any) {
    result.attempts.public = {
      ok: false,
      error: err?.message || String(err),
      stack: err?.stack || null,
    }
  }

  // 2) Try authenticated fetch if session exists OR asUserId provided (dev only)
  try {
    let sessionUserId: string | undefined

    if (asUserId && process.env.NODE_ENV !== 'production') {
      // Use the provided asUserId in development for debugging authenticated fallbacks
      console.log(`🔧 Debug: using forced asUserId=${asUserId}`)
      sessionUserId = asUserId
    } else {
      const session = await getServerSession(authOptions)
      sessionUserId = session?.user?.id
    }

    if (sessionUserId) {
      try {
        const authTranscript = await getVideoTranscript(videoId as string, sessionUserId)
        result.attempts.authenticated = {
          ok: true,
          simulated: !!asUserId,
          userId: sessionUserId,
          itemCount: Array.isArray(authTranscript?.items) ? authTranscript.items.length : 0,
          textLength: (authTranscript?.text || '').length,
          source: authTranscript?.source || null,
          sample: (authTranscript?.text || '').slice(0, 400),
        }
      } catch (err: any) {
        result.attempts.authenticated = {
          ok: false,
          simulated: !!asUserId,
          userId: sessionUserId,
          error: err?.message || String(err),
          stack: err?.stack || null,
        }
      }
    } else {
      result.attempts.authenticated = {
        ok: false,
        error: 'no_session',
        message: 'User not authenticated in this request. Log in and retry.'
      }
    }
  } catch (err: any) {
    result.attempts.authenticated = {
      ok: false,
      error: err?.message || String(err),
      stack: err?.stack || null,
    }
  }

  return NextResponse.json(result)
}

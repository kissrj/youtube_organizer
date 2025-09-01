import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedYouTubeClient, getYouTubeAccount } from '@/lib/youtube-oauth'

async function fetchDescriptionViaYouTubeAPI(videoId: string, userId?: string) {
  if (!userId) throw new Error('no_user')
  const account = await getYouTubeAccount(userId)
  if (!account?.accessToken) throw new Error('no_oauth')
  const youtube = await createAuthenticatedYouTubeClient(userId)
  const res = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  })
  const item = res.data.items?.[0]
  return item?.snippet?.description ?? null
}

async function fetchDescriptionViaScrape(videoId: string) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const resp = await fetch(watchUrl, { headers: { 'User-Agent': 'curl/7.88.1' } })
  if (!resp.ok) throw new Error(`scrape_failed:${resp.status}`)
  const html = await resp.text()
  // Try og:description
  const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
  if (ogMatch) return decodeHtml(ogMatch[1])
  const nameMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  if (nameMatch) return decodeHtml(nameMatch[1])
  return null
}

function decodeHtml(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

export async function POST(request: NextRequest, context: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await context.params
  const url = new URL(request.url)
  const asUserId = url.searchParams.get('asUserId')

  if (process.env.NODE_ENV === 'production' && !asUserId) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const result: any = { ok: false, attempts: {} }

  // Try auth if user provided
  if (asUserId) {
    try {
      const desc = await fetchDescriptionViaYouTubeAPI(videoId, asUserId)
      result.attempts.auth = { ok: true, desc: desc?.slice(0, 4000) ?? null }
      if (desc) {
        await prisma.video.updateMany({ where: { youtubeId: videoId }, data: { description: desc } })
        result.ok = true
        result.saved = true
        return NextResponse.json(result)
      }
    } catch (err: any) {
      result.attempts.auth = { ok: false, error: err?.message || String(err) }
    }
  }

  // Fallback scrape
  try {
    const desc = await fetchDescriptionViaScrape(videoId)
    result.attempts.scrape = { ok: !!desc, desc: desc?.slice(0, 4000) ?? null }
    if (desc) {
      await prisma.video.updateMany({ where: { youtubeId: videoId }, data: { description: desc } })
      result.ok = true
      result.saved = true
      return NextResponse.json(result)
    }
  } catch (err: any) {
    result.attempts.scrape = { ok: false, error: err?.message || String(err) }
  }

  return NextResponse.json(result, { status: 404 })
}

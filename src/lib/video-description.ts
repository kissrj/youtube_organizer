import { prisma } from '@/lib/prisma'
import { createAuthenticatedYouTubeClient, getYouTubeAccount } from '@/lib/youtube-oauth'

async function fetchDescriptionViaYouTubeAPI(videoId: string, userId?: string) {
  if (!userId) throw new Error('no_user')
  const account = await getYouTubeAccount(userId)
  if (!account?.accessToken) throw new Error('no_oauth')
  const youtube = await createAuthenticatedYouTubeClient(userId)
  const res = await youtube.videos.list({ part: ['snippet'], id: [videoId] })
  const item = res.data.items?.[0]
  return item?.snippet?.description ?? null
}

async function fetchDescriptionViaScrape(videoId: string) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const resp = await fetch(watchUrl, { headers: { 'User-Agent': 'curl/7.88.1' } })
  if (!resp.ok) throw new Error(`scrape_failed:${resp.status}`)
  const html = await resp.text()
  const ogMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
  if (ogMatch) return decodeHtml(ogMatch[1])
  const nameMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  if (nameMatch) return decodeHtml(nameMatch[1])
  return null
}

function decodeHtml(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

/**
 * Ensure the given video (by youtubeId) has a description in the DB.
 * If missing, try OAuth YouTube API (using the provided userId) then scrape as fallback.
 * If found, updates the Video.description and returns the description string.
 */
export async function ensureVideoDescription(userId: string | undefined, youtubeId: string) {
  if (!youtubeId) return null

  // Check current DB value
  const existing = await prisma.video.findFirst({ where: { youtubeId }, select: { id: true, description: true } })
  if (existing?.description) return existing.description

  // Try OAuth API first when userId is available
  if (userId) {
    try {
      const desc = await fetchDescriptionViaYouTubeAPI(youtubeId, userId)
      if (desc) {
        await prisma.video.updateMany({ where: { youtubeId }, data: { description: desc } })
        return desc
      }
    } catch (err) {
      // continue to scrape fallback
      console.warn('ensureVideoDescription: auth fetch failed', err)
    }
  }

  // Scrape fallback
  try {
    const desc = await fetchDescriptionViaScrape(youtubeId)
    if (desc) {
      await prisma.video.updateMany({ where: { youtubeId }, data: { description: desc } })
      return desc
    }
  } catch (err) {
    console.warn('ensureVideoDescription: scrape failed', err)
  }

  return null
}

export default ensureVideoDescription

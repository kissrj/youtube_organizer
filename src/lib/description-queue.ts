import ensureVideoDescription from '@/lib/video-description'

const jobs = new Map<string, string | undefined>()
let processing = false

export function enqueueDescription(youtubeId: string, userId?: string) {
  if (!youtubeId) return
  // store userId (may be undefined) — prefer existing userId if present
  if (!jobs.has(youtubeId)) jobs.set(youtubeId, userId)
  if (!processing) void processQueue()
}

async function processQueue() {
  processing = true
  try {
    // Snapshot entries to process
    const entries = Array.from(jobs.entries())
    for (const [youtubeId, userId] of entries) {
      try {
        // best-effort: try to ensure description
        await ensureVideoDescription(userId, youtubeId)
      } catch (err) {
        console.warn('[description-queue] failed for', youtubeId, err)
      } finally {
        jobs.delete(youtubeId)
      }
    }
  } finally {
    processing = false
  }
}

export default { enqueueDescription }

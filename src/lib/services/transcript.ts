import { google } from 'googleapis'
import { YoutubeTranscript } from 'youtube-transcript'
import { createAuthenticatedYouTubeClient } from '@/lib/youtube-oauth'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

export interface TranscriptItem {
  text: string
  start: number
  duration: number
}

export interface TranscriptResult {
  items: TranscriptItem[]
  text: string
  source: 'public' | 'oauth'
}

/**
 * Busca o transcript de um vídeo do YouTube
 */
export async function getVideoTranscript(
  videoId: string,
  userId?: string,
  options?: { preferredLang?: string }
): Promise<TranscriptResult> {
  try {
    console.log(`🔍 Buscando transcript para vídeo: ${videoId}`)

    // Tenta múltiplas abordagens para obter o transcript
  let transcript: any[] | null = null
  let source: 'public' | 'oauth' = 'public'
    let attemptCount = 0
    const maxAttempts = 4

    while (attemptCount < maxAttempts && !transcript) {
      attemptCount++
      console.log(`🔄 Tentativa ${attemptCount}/${maxAttempts}`)

      try {
        // Tentativa 1: Idioma padrão (inglês)
        if (attemptCount === 1) {
          console.log('📚 Tentando buscar transcript (idioma padrão)...')
          if (options?.preferredLang) {
            console.log(`📚 Preferência de idioma: ${options.preferredLang}`)
            try {
              transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: options.preferredLang })
            } catch (e) {
              console.log('❌ Preferência de idioma falhou, tentando sem lang...')
              transcript = await YoutubeTranscript.fetchTranscript(videoId)
            }
          } else {
            transcript = await YoutubeTranscript.fetchTranscript(videoId)
          }
          console.log(`📊 Transcript bruto: ${transcript?.length || 0} itens`)
        }

        // Tentativa 2: Português brasileiro
        if (attemptCount === 2) {
          console.log('🌍 Tentando com português brasileiro (pt-BR)...')
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt-BR' })
          console.log(`📊 Transcript pt-BR: ${transcript?.length || 0} itens`)
        }

        // Tentativa 3: Português
        if (attemptCount === 3) {
          console.log('🌍 Tentando com português (pt)...')
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
          console.log(`📊 Transcript pt: ${transcript?.length || 0} itens`)
        }

        // Tentativa 4: Inglês
        if (attemptCount === 4) {
          console.log('🌍 Tentando com inglês (en)...')
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
          console.log(`📊 Transcript en: ${transcript?.length || 0} itens`)
        }

      } catch (error) {
        console.log(`❌ Tentativa ${attemptCount} falhou:`, error instanceof Error ? error.message : String(error))
      }
    }

    // Se falhar, tentar fallback via timedtext (XML público)
    if (!transcript) {
      const timed = await fetchTranscriptViaTimedText(videoId, options?.preferredLang)
      if (timed && timed.length > 0) {
        return {
          items: timed,
          text: getTranscriptText(timed),
          source: 'public',
        }
      }
    }

    // Verifica se conseguiu obter o transcript via método público
    if (!transcript) {
      console.log('❌ Todas as tentativas públicas falharam')
      // Fallback autenticado: tentar via YouTube Data API (se userId fornecido)
      if (userId) {
        const srtTranscript = await fetchTranscriptViaYouTubeAPI(videoId, userId)
        if (srtTranscript && srtTranscript.length > 0) {
          return {
            items: srtTranscript,
            text: getTranscriptText(srtTranscript),
            source: 'oauth',
          }
        }
      }
      throw new Error('Transcript não encontrado')
    }

    if (transcript.length === 0) {
      console.log('⚠️ Transcript vazio')
      throw new Error('Transcript vazio')
    }

    // Filtra itens válidos (aceita offset ou start)
    const validItems = transcript.filter((item: any) => {
      const hasText = item && item.text && typeof item.text === 'string' && item.text.trim().length > 0
      const hasStart = typeof item.start === 'number' || typeof item.offset === 'number'
      const hasDuration = typeof item.duration === 'number'
      return hasText && hasStart && hasDuration
    })

    if (validItems.length === 0) {
      console.log('⚠️ Nenhum item válido encontrado após filtragem')
      // Fallback via timedtext
  const timed = await fetchTranscriptViaTimedText(videoId, options?.preferredLang)
      if (timed && timed.length > 0) {
        return {
          items: timed,
          text: getTranscriptText(timed),
          source: 'public',
        }
      }
      // Fallback autenticado
      if (userId) {
        const srtTranscript = await fetchTranscriptViaYouTubeAPI(videoId, userId)
        if (srtTranscript && srtTranscript.length > 0) {
          return {
            items: srtTranscript,
            text: getTranscriptText(srtTranscript),
            source: 'oauth',
          }
        }
      }
      throw new Error('Transcript sem conteúdo válido')
    }

    console.log(`✅ Transcript processado com sucesso!`)
    console.log(`📊 Itens válidos: ${validItems.length}`)
    console.log(`📝 Primeiro item: "${validItems[0]?.text?.substring(0, 50)}..."`)

    // Converte para o formato da aplicação
  const resultItems = validItems.map((item: any) => {
      const rawStart = typeof item.start === 'number' ? item.start : item.offset
      const rawDuration = item.duration

      // Normaliza para segundos: se > 1000, assumimos milissegundos
      const startSec = rawStart > 1000 ? rawStart / 1000 : rawStart
      const durSec = rawDuration > 1000 ? rawDuration / 1000 : rawDuration

      return {
        text: String(item.text).trim(),
        start: Math.round(startSec * 100) / 100,
        duration: Math.round(durSec * 100) / 100,
      }
    })

    console.log(`🎯 Transcript final: ${resultItems.length} itens formatados`)
    return {
      items: resultItems,
      text: getTranscriptText(resultItems),
      source,
    }

  } catch (error) {
    console.error('❌ Erro final ao buscar transcript:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Mensagens específicas para diferentes tipos de erro
    if (errorMessage.includes('Transcript não encontrado') ||
        errorMessage.includes('Transcript vazio') ||
        errorMessage.includes('Video unavailable') ||
        errorMessage.includes('No transcript')) {
      throw new Error('Transcript não disponível para este vídeo')
    }

    if (errorMessage.includes('API keys are not supported')) {
      throw new Error('Transcript não disponível para este vídeo')
    }

    throw new Error('Não foi possível obter o transcript deste vídeo')
  }
}

/**
 * Fallback autenticado: baixa legenda via YouTube Data API (requer OAuth do usuário)
 */
async function fetchTranscriptViaYouTubeAPI(videoId: string, userId: string): Promise<TranscriptItem[] | null> {
  try {
    console.log('🔐 Tentando obter transcript via YouTube Data API (OAuth)')
    const yt = await createAuthenticatedYouTubeClient(userId)

    // Lista faixas de legenda disponíveis
    const caps = await yt.captions.list({ part: ['snippet'], videoId })
    const items = caps.data.items || []
    if (items.length === 0) {
      console.log('⚠️ Nenhuma faixa de legenda encontrada via API')
      return null
    }

    // Escolher a melhor faixa (preferir pt-BR > pt > en; evitar ASR quando possível)
    const pickScore = (sn: any) => {
      const lang = (sn.language || '').toLowerCase()
      let score = 0
      if (lang === 'pt-br' || lang === 'pt_br') score += 3
      else if (lang === 'pt') score += 2
      else if (lang.startsWith('en')) score += 1
      if (sn.trackKind === 'standard') score += 2
      return score
    }

    const best = items
      .map((it: any) => ({ id: it.id, snippet: it.snippet }))
      .sort((a: any, b: any) => pickScore(b.snippet) - pickScore(a.snippet))[0]

    if (!best?.id) {
      console.log('⚠️ Não foi possível selecionar uma faixa de legenda')
      return null
    }

    // Download como SRT
    // Observação: algumas versões retornam stream; aqui tentamos obter texto diretamente
    const res: any = await (yt.captions as any).download({ id: best.id, tfmt: 'srt' }, { responseType: 'arraybuffer' })
    const data: any = res?.data

    let srtText = ''
    if (typeof data === 'string') {
      srtText = data
    } else if (data && data instanceof Buffer) {
      srtText = data.toString('utf-8')
    } else if (data && data.type === 'Buffer' && Array.isArray(data.data)) {
      srtText = Buffer.from(data.data).toString('utf-8')
    } else {
      try {
        // Tenta converter qualquer coisa em string
        srtText = String(data)
      } catch {
        srtText = ''
      }
    }

    if (!srtText || srtText.trim().length === 0) {
      console.log('⚠️ Download de SRT retornou vazio')
      return null
    }

    const parsed = parseSRTTranscript(srtText)
    console.log(`✅ Transcript via API parseado: ${parsed.length} itens`)
    return parsed
  } catch (err) {
    console.log('❌ Fallback via YouTube API falhou:', err instanceof Error ? err.message : String(err))
    return null
  }
}

/**
 * Converte transcript SRT para o formato interno
 */
function parseSRTTranscript(srtContent: string): TranscriptItem[] {
  const lines = srtContent.split('\n')
  const transcript: TranscriptItem[] = []

  for (let i = 0; i < lines.length; i++) {
    // Pula linhas vazias e números de sequência
    if (!lines[i].trim() || /^\d+$/.test(lines[i].trim())) {
      continue
    }

    // Verifica se é uma linha de timestamp
    const timestampMatch = lines[i].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/)
    if (timestampMatch) {
      const startTime = parseTimestamp(timestampMatch[1])
      const endTime = parseTimestamp(timestampMatch[2])

      // Próxima linha deve conter o texto
      if (i + 1 < lines.length) {
        const text = lines[i + 1].trim()
        if (text) {
          transcript.push({
            text,
            start: startTime,
            duration: endTime - startTime,
          })
        }
      }
    }
  }

  return transcript
}

/**
 * Converte timestamp SRT (00:00:00,000) para segundos
 */
function parseTimestamp(timestamp: string): number {
  const [time, milliseconds] = timestamp.split(',')
  const [hours, minutes, seconds] = time.split(':').map(Number)

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

/**
 * Junta todos os textos do transcript em uma string
 */
export function getTranscriptText(transcript: TranscriptItem[]): string {
  return transcript.map(item => item.text).join(' ')
}

/**
 * Busca um trecho específico do transcript por tempo
 */
export function getTranscriptAtTime(transcript: TranscriptItem[], timeInSeconds: number): TranscriptItem | null {
  return transcript.find(item =>
    timeInSeconds >= item.start && timeInSeconds <= item.start + item.duration
  ) || null
}

/**
 * Busca trechos do transcript que contenham uma palavra-chave
 */
export function searchTranscript(transcript: TranscriptItem[], keyword: string): TranscriptItem[] {
  const searchTerm = keyword.toLowerCase()
  return transcript.filter(item =>
    item.text.toLowerCase().includes(searchTerm)
  )
}

/**
 * Verifica se um vídeo tem transcript disponível
 */
export async function hasTranscript(videoId: string): Promise<boolean> {
  try {
    const captionsResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    })

    return (captionsResponse.data.items?.length || 0) > 0
  } catch (error) {
    return false
  }
}

/**
 * Fallback público: usa endpoint timedtext (XML) do YouTube
 */
async function fetchTranscriptViaTimedText(videoId: string, preferredLang?: string): Promise<TranscriptItem[] | null> {
  try {
  const langsBase = ['pt-BR', 'pt', 'en', 'es']
  const langs = preferredLang ? [preferredLang, ...langsBase.filter(l => l !== preferredLang)] : langsBase
    const kinds = ['', 'asr']
    for (const lang of langs) {
      for (const kind of kinds) {
        const url = new URL('https://www.youtube.com/api/timedtext')
        url.searchParams.set('v', videoId)
        url.searchParams.set('lang', lang)
        if (kind) url.searchParams.set('kind', kind)

        const res = await fetch(url.toString())
        if (!res.ok) continue
        const text = await res.text()
        const items = parseTimedTextXml(text)
        if (items.length > 0) {
          console.log(`✅ timedtext retornou ${items.length} itens (${lang}${kind ? ', ' + kind : ''})`)
          return items
        }
      }
    }
    return null
  } catch (e) {
    console.log('❌ timedtext fallback falhou:', e instanceof Error ? e.message : String(e))
    return null
  }
}

/**
 * Parse simples do XML de timedtext do YouTube
 */
function parseTimedTextXml(xml: string): TranscriptItem[] {
  if (!xml || !xml.includes('<transcript')) return []
  // Remover quebras e normalizar entidades HTML básicas
  const decode = (s: string) => s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  const regex = /<text([^>]*)>([\s\S]*?)<\/text>/g
  const items: TranscriptItem[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const attrs = match[1]
    const body = decode(match[2])
      .replace(/\s+/g, ' ')
      .trim()
    if (!body) continue

    const startMatch = attrs.match(/start="([0-9.]+)"/)
    const durMatch = attrs.match(/dur="([0-9.]+)"/)
    if (!startMatch || !durMatch) continue
    const start = parseFloat(startMatch[1])
    const duration = parseFloat(durMatch[1])
    if (Number.isNaN(start) || Number.isNaN(duration)) continue
    items.push({ text: body, start, duration })
  }
  return items
}
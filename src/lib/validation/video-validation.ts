/**
 * Validação de entrada para vídeos do YouTube
 */

export interface VideoValidationResult {
  isValid: boolean
  extractedId?: string
  error?: string
  suggestions?: string[]
}

/**
 * Regex patterns para diferentes formatos de URL do YouTube
 */
const YOUTUBE_PATTERNS = {
  // ID direto (11 caracteres)
  VIDEO_ID: /^[A-Za-z0-9_-]{11}$/,

  // URL padrão: https://www.youtube.com/watch?v=VIDEO_ID
  STANDARD_URL: /[?&]v=([A-Za-z0-9_-]{11})/,

  // URL curta: https://youtu.be/VIDEO_ID
  SHORT_URL: /youtu\.be\/([A-Za-z0-9_-]{11})/,

  // URL embed: https://www.youtube.com/embed/VIDEO_ID
  EMBED_URL: /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,

  // URL com lista: https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID
  URL_WITH_LIST: /[?&]v=([A-Za-z0-9_-]{11})[&?]/,
}

/**
 * Extrai o ID do vídeo de diferentes formatos de URL
 */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()

  // Verifica se já é um ID válido
  if (YOUTUBE_PATTERNS.VIDEO_ID.test(trimmed)) {
    return trimmed
  }

  // Tenta extrair de diferentes formatos de URL
  const patterns = [
    YOUTUBE_PATTERNS.STANDARD_URL,
    YOUTUBE_PATTERNS.SHORT_URL,
    YOUTUBE_PATTERNS.EMBED_URL,
    YOUTUBE_PATTERNS.URL_WITH_LIST,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Valida entrada do usuário para vídeos do YouTube
 */
export function validateYouTubeVideoInput(input: string): VideoValidationResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Campo obrigatório: digite um ID ou URL do YouTube',
      suggestions: [
        'Exemplo: dQw4w9WgXcQ',
        'Exemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'Exemplo: https://youtu.be/dQw4w9WgXcQ'
      ]
    }
  }

  const extractedId = extractYouTubeVideoId(trimmed)

  if (!extractedId) {
    return {
      isValid: false,
      error: 'Formato inválido! Use um dos formatos aceitos:',
      suggestions: [
        '• Apenas o ID (11 caracteres): dQw4w9WgXcQ',
        '• URL completa: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '• URL curta: https://youtu.be/dQw4w9WgXcQ',
        '• URL embed: https://www.youtube.com/embed/dQw4w9WgXcQ'
      ]
    }
  }

  // Validações adicionais do ID
  if (extractedId.length !== 11) {
    return {
      isValid: false,
      error: 'ID do vídeo deve ter exatamente 11 caracteres',
      extractedId
    }
  }

  // Verifica se contém apenas caracteres válidos
  if (!YOUTUBE_PATTERNS.VIDEO_ID.test(extractedId)) {
    return {
      isValid: false,
      error: 'ID do vídeo contém caracteres inválidos',
      extractedId
    }
  }

  return {
    isValid: true,
    extractedId
  }
}

/**
 * Valida se uma string é um ID válido do YouTube
 */
export function isValidYouTubeVideoId(id: string): boolean {
  return YOUTUBE_PATTERNS.VIDEO_ID.test(id.trim())
}

/**
 * Formata uma URL do YouTube para exibição
 */
export function formatYouTubeUrl(url: string): string {
  const extractedId = extractYouTubeVideoId(url)
  if (extractedId) {
    return `https://www.youtube.com/watch?v=${extractedId}`
  }
  return url
}

/**
 * Gera uma URL embed do YouTube
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Gera uma URL thumbnail do YouTube
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

/**
 * Validações específicas para diferentes cenários
 */
export const VideoValidators = {
  /**
   * Validação para importação de vídeo
   */
  import: (input: string): VideoValidationResult => {
    const result = validateYouTubeVideoInput(input)

    if (!result.isValid) {
      return result
    }

    // Validações adicionais para importação
    if (result.extractedId!.includes(' ') || result.extractedId!.includes('\n')) {
      return {
        isValid: false,
        error: 'ID do vídeo não pode conter espaços',
        extractedId: result.extractedId
      }
    }

    return result
  },

  /**
   * Validação para busca de vídeo
   */
  search: (input: string): VideoValidationResult => {
    return validateYouTubeVideoInput(input)
  },

  /**
   * Validação para atualização de vídeo
   */
  update: (input: string): VideoValidationResult => {
    const result = validateYouTubeVideoInput(input)

    if (!result.isValid) {
      return result
    }

    // Para atualização, o vídeo deve já existir
    return result
  }
}
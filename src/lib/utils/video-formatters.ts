/**
 * Utilitários para formatação de dados de vídeos do YouTube
 */

/**
 * Formata um número grande para exibição (ex: 1689203943 → "1.6B")
 */
export function formatNumber(num: string | number): string {
  const number = typeof num === 'string' ? parseInt(num) : num

  if (isNaN(number)) return '0'

  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B'
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K'
  }

  return number.toString()
}

/**
 * Formata duração ISO 8601 para exibição (ex: "PT3M34S" → "3:34")
 */
export function formatDuration(duration: string): string {
  if (!duration || !duration.startsWith('PT')) return '0:00'

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Formata data ISO para exibição (ex: "2009-10-25T06:57:33Z" → "25/10/2009")
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

/**
 * Retorna a cor baseada na definição do vídeo
 */
export function getDefinitionColor(definition: string): string {
  switch (definition?.toLowerCase()) {
    case 'hd':
      return 'text-green-600 bg-green-100'
    case 'sd':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Retorna o texto da definição do vídeo
 */
export function getDefinitionText(definition: string): string {
  switch (definition?.toLowerCase()) {
    case 'hd':
      return 'HD'
    case 'sd':
      return 'SD'
    default:
      return 'SD'
  }
}

/**
 * Retorna a cor baseada na dimensão do vídeo
 */
export function getDimensionColor(dimension: string): string {
  switch (dimension?.toLowerCase()) {
    case '3d':
      return 'text-purple-600 bg-purple-100'
    case '2d':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Retorna o texto da dimensão do vídeo
 */
export function getDimensionText(dimension: string): string {
  switch (dimension?.toLowerCase()) {
    case '3d':
      return '3D'
    case '2d':
      return '2D'
    default:
      return '2D'
  }
}

/**
 * Retorna a cor baseada na projeção do vídeo
 */
export function getProjectionColor(projection: string): string {
  switch (projection?.toLowerCase()) {
    case '360':
      return 'text-red-600 bg-red-100'
    case 'rectangular':
      return 'text-indigo-600 bg-indigo-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Retorna o texto da projeção do vídeo
 */
export function getProjectionText(projection: string): string {
  switch (projection?.toLowerCase()) {
    case '360':
      return '360°'
    case 'rectangular':
      return 'Padrão'
    default:
      return 'Padrão'
  }
}

/**
 * Formata tags do vídeo para exibição
 */
export function formatTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return []

  return tags.slice(0, 5) // Limita a 5 tags para não poluir a interface
}

/**
 * Calcula o tempo decorrido desde a publicação
 */
export function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`

    return `${Math.floor(diffInDays / 365)} anos atrás`
  } catch {
    return 'Data inválida'
  }
}

/**
 * Formata estatísticas do vídeo para exibição
 */
export function formatVideoStats(video: any) {
  return {
    views: formatNumber(video.viewCount || '0'),
    likes: formatNumber(video.likeCount || '0'),
    comments: formatNumber(video.commentCount || '0'),
    duration: formatDuration(video.duration || 'PT0S'),
    publishedAt: formatDate(video.publishedAt),
    timeAgo: getTimeAgo(video.publishedAt),
    definition: getDefinitionText(video.definition || 'sd'),
    dimension: getDimensionText(video.dimension || '2d'),
    projection: getProjectionText(video.projection || 'rectangular'),
    tags: formatTags(video.videoTags || []),
  }
}
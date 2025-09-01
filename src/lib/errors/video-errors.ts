/**
 * Tratamento de erros robusto para importação de vídeos do YouTube
 * Este arquivo centraliza todos os tipos de erro e suas mensagens amigáveis
 */

export class VideoImportError extends Error {
  public readonly code: string
  public readonly userMessage: string
  public readonly technicalMessage: string
  public readonly statusCode: number

  constructor(
    code: string,
    userMessage: string,
    technicalMessage: string,
    statusCode: number = 500
  ) {
    super(userMessage)
    this.name = 'VideoImportError'
    this.code = code
    this.userMessage = userMessage
    this.technicalMessage = technicalMessage
    this.statusCode = statusCode
  }
}

/**
 * Tipos de erro específicos para importação de vídeos
 */
export const VideoErrorCodes = {
  // Erros de validação
  INVALID_URL: 'INVALID_URL',
  INVALID_VIDEO_ID: 'INVALID_VIDEO_ID',
  MISSING_API_KEY: 'MISSING_API_KEY',

  // Erros da API do YouTube
  VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
  VIDEO_PRIVATE: 'VIDEO_PRIVATE',
  VIDEO_UNAVAILABLE: 'VIDEO_UNAVAILABLE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  API_KEY_INVALID: 'API_KEY_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Erros de banco de dados
  DUPLICATE_VIDEO: 'DUPLICATE_VIDEO',
  DATABASE_ERROR: 'DATABASE_ERROR',
  USER_NOT_AUTHORIZED: 'USER_NOT_AUTHORIZED',

  // Erros de autenticação OAuth
  OAUTH_TOKEN_EXPIRED: 'OAUTH_TOKEN_EXPIRED',
  OAUTH_TOKEN_INVALID: 'OAUTH_TOKEN_INVALID',
  OAUTH_PERMISSION_DENIED: 'OAUTH_PERMISSION_DENIED',
} as const

/**
 * Mapeamento de códigos de erro para mensagens amigáveis em português
 */
export const ErrorMessages = {
  [VideoErrorCodes.INVALID_URL]: {
    user: '❌ Link inválido!\n\nFormato aceito:\n• Apenas ID (11 caracteres)\n• URL completa do YouTube',
    technical: 'URL fornecida não corresponde ao formato esperado do YouTube'
  },

  [VideoErrorCodes.INVALID_VIDEO_ID]: {
    user: '❌ ID do vídeo inválido!\n\nO ID deve ter exatamente 11 caracteres.',
    technical: 'ID do vídeo não tem o formato correto (deve ter 11 caracteres)'
  },

  [VideoErrorCodes.MISSING_API_KEY]: {
    user: '❌ Chave da API não configurada!\n\nConfigure YOUTUBE_API_KEY no arquivo .env',
    technical: 'Variável de ambiente YOUTUBE_API_KEY não está definida'
  },

  [VideoErrorCodes.VIDEO_NOT_FOUND]: {
    user: '❌ Vídeo não encontrado!\n\nVerifique se:\n• O ID está correto\n• O vídeo não foi excluído\n• Você tem permissão para acessá-lo',
    technical: 'Vídeo não encontrado na API do YouTube'
  },

  [VideoErrorCodes.VIDEO_PRIVATE]: {
    user: '❌ Vídeo privado!\n\nPara acessar vídeos privados:\n• Conecte sua conta do YouTube\n• Peça ao dono para tornar público\n• Ou use apenas vídeos públicos',
    technical: 'Vídeo está marcado como privado na API do YouTube'
  },

  [VideoErrorCodes.VIDEO_UNAVAILABLE]: {
    user: '❌ Vídeo indisponível!\n\nEste vídeo pode estar:\n• Bloqueado no seu país\n• Removido por violação\n• Temporariamente indisponível',
    technical: 'Vídeo está indisponível na API do YouTube'
  },

  [VideoErrorCodes.QUOTA_EXCEEDED]: {
    user: '❌ Limite da API excedido!\n\nA cota diária do YouTube foi atingida.\nTente novamente amanhã ou use OAuth.',
    technical: 'Quota da API do YouTube Data v3 foi excedida'
  },

  [VideoErrorCodes.API_KEY_INVALID]: {
    user: '❌ Chave da API inválida!\n\nVerifique se:\n• A chave está correta\n• Está habilitada para YouTube Data API v3\n• Não foi revogada',
    technical: 'Chave da API do YouTube é inválida ou não autorizada'
  },

  [VideoErrorCodes.NETWORK_ERROR]: {
    user: '❌ Erro de conexão!\n\nVerifique sua conexão com a internet e tente novamente.',
    technical: 'Erro de rede ao conectar com a API do YouTube'
  },

  [VideoErrorCodes.DUPLICATE_VIDEO]: {
    user: 'ℹ️ Vídeo já importado!\n\nEste vídeo já foi adicionado à sua coleção anteriormente.',
    technical: 'Vídeo já existe no banco de dados do usuário'
  },

  [VideoErrorCodes.DATABASE_ERROR]: {
    user: '❌ Erro interno!\n\nOcorreu um problema ao salvar os dados. Tente novamente.',
    technical: 'Erro ao salvar dados no banco de dados'
  },

  [VideoErrorCodes.USER_NOT_AUTHORIZED]: {
    user: '❌ Acesso negado!\n\nVocê precisa estar logado para importar vídeos.',
    technical: 'Usuário não autenticado ou token inválido'
  },

  [VideoErrorCodes.OAUTH_TOKEN_EXPIRED]: {
    user: '❌ Token expirado!\n\nSua conexão com o YouTube expirou. Reconecte sua conta.',
    technical: 'Token OAuth do YouTube expirou'
  },

  [VideoErrorCodes.OAUTH_TOKEN_INVALID]: {
    user: '❌ Token inválido!\n\nReconecte sua conta do YouTube para continuar.',
    technical: 'Token OAuth do YouTube é inválido'
  },

  [VideoErrorCodes.OAUTH_PERMISSION_DENIED]: {
    user: '❌ Permissão negada!\n\nVocê não tem permissão para acessar este vídeo.',
    technical: 'Permissões OAuth insuficientes para acessar o vídeo'
  },
} as const

/**
 * Função para criar erros padronizados
 */
export function createVideoError(
  code: keyof typeof VideoErrorCodes,
  customMessage?: string
): VideoImportError {
  const errorInfo = ErrorMessages[VideoErrorCodes[code]]

  return new VideoImportError(
    VideoErrorCodes[code],
    customMessage || errorInfo.user,
    errorInfo.technical,
    getStatusCodeForError(code)
  )
}

/**
 * Mapeia códigos de erro para códigos HTTP apropriados
 */
function getStatusCodeForError(code: keyof typeof VideoErrorCodes): number {
  const statusMap: Record<keyof typeof VideoErrorCodes, number> = {
    [VideoErrorCodes.INVALID_URL]: 400,
    [VideoErrorCodes.INVALID_VIDEO_ID]: 400,
    [VideoErrorCodes.MISSING_API_KEY]: 500,
    [VideoErrorCodes.VIDEO_NOT_FOUND]: 404,
    [VideoErrorCodes.VIDEO_PRIVATE]: 403,
    [VideoErrorCodes.VIDEO_UNAVAILABLE]: 410,
    [VideoErrorCodes.QUOTA_EXCEEDED]: 429,
    [VideoErrorCodes.API_KEY_INVALID]: 401,
    [VideoErrorCodes.NETWORK_ERROR]: 503,
    [VideoErrorCodes.DUPLICATE_VIDEO]: 409,
    [VideoErrorCodes.DATABASE_ERROR]: 500,
    [VideoErrorCodes.USER_NOT_AUTHORIZED]: 401,
    [VideoErrorCodes.OAUTH_TOKEN_EXPIRED]: 401,
    [VideoErrorCodes.OAUTH_TOKEN_INVALID]: 401,
    [VideoErrorCodes.OAUTH_PERMISSION_DENIED]: 403,
  }

  return statusMap[code] || 500
}

/**
 * Função utilitária para detectar tipo de erro da API do YouTube
 */
export function parseYouTubeApiError(error: any): VideoImportError {
  // Erros específicos da API do Google/YouTube
  if (error?.code === 403) {
    if (error?.message?.includes('quota')) {
      return createVideoError('QUOTA_EXCEEDED')
    }
    if (error?.message?.includes('private')) {
      return createVideoError('VIDEO_PRIVATE')
    }
    return createVideoError('OAUTH_PERMISSION_DENIED')
  }

  if (error?.code === 404) {
    return createVideoError('VIDEO_NOT_FOUND')
  }

  if (error?.code === 401) {
    return createVideoError('API_KEY_INVALID')
  }

  // Erros de rede
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createVideoError('NETWORK_ERROR')
  }

  // Erro genérico
  return createVideoError('DATABASE_ERROR', 'Erro inesperado ao processar vídeo')
}

/**
 * Wrapper para operações que podem falhar
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackError?: VideoImportError
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof VideoImportError) {
      throw error
    }

    // Tenta identificar o tipo de erro
    const parsedError = parseYouTubeApiError(error)
    throw fallbackError || parsedError
  }
}

/**
 * Logger para erros de importação
 */
export function logVideoImportError(error: VideoImportError, context?: any) {
  console.error(`[${error.code}] ${error.technicalMessage}`, {
    userMessage: error.userMessage,
    statusCode: error.statusCode,
    context,
    timestamp: new Date().toISOString(),
  })
}
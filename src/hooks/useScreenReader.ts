import { useCallback, useRef } from 'react'

/**
 * Hook para anúncios acessíveis para screen readers
 * Fornece funções para anunciar mensagens importantes
 */
export function useScreenReader() {
  const announcementRef = useRef<HTMLDivElement | null>(null)

  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
    duration: number = 1000
  ) => {
    // Remove anúncio anterior se existir
    if (announcementRef.current) {
      document.body.removeChild(announcementRef.current)
    }

    // Cria novo elemento de anúncio
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    // Adiciona à página
    document.body.appendChild(announcement)
    announcementRef.current = announcement

    // Define o conteúdo (causa o anúncio)
    announcement.textContent = message

    // Remove após a duração especificada
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement)
        announcementRef.current = null
      }
    }, duration)
  }, [])

  const announceError = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceInfo = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceWarning = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  return {
    announce,
    announceError,
    announceSuccess,
    announceInfo,
    announceWarning,
  }
}

/**
 * Hook para gerenciamento de anúncios de status
 * Útil para indicar loading, sucesso, erro, etc.
 */
export function useStatusAnnouncement() {
  const { announce } = useScreenReader()

  const announceLoading = useCallback((message: string = 'Carregando...') => {
    announce(message, 'polite')
  }, [announce])

  const announceLoaded = useCallback((message: string = 'Conteúdo carregado') => {
    announce(message, 'polite')
  }, [announce])

  const announceSaved = useCallback((message: string = 'Alterações salvas') => {
    announce(message, 'polite')
  }, [announce])

  const announceDeleted = useCallback((message: string = 'Item removido') => {
    announce(message, 'polite')
  }, [announce])

  const announceError = useCallback((message: string = 'Erro ocorreu') => {
    announce(message, 'assertive')
  }, [announce])

  return {
    announceLoading,
    announceLoaded,
    announceSaved,
    announceDeleted,
    announceError,
  }
}
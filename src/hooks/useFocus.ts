import React, { useRef, useEffect, useCallback, useState } from 'react'

/**
 * Hook para gerenciamento de foco acessível
 * Fornece funções para salvar, restaurar e mover o foco
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [])

  const moveFocusTo = useCallback((element: HTMLElement) => {
    if (element && document.contains(element)) {
      element.focus()
    }
  }, [])

  const moveFocusToFirstFocusable = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement
      firstElement.focus()
    }
  }, [])

  const moveFocusToLastFocusable = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      lastElement.focus()
    }
  }, [])

  return {
    saveFocus,
    restoreFocus,
    moveFocusTo,
    moveFocusToFirstFocusable,
    moveFocusToLastFocusable,
  }
}

/**
 * Hook para trap de foco (mantém foco dentro de um container)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  const { moveFocusToFirstFocusable, moveFocusToLastFocusable } = useFocusManagement()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, moveFocusToFirstFocusable, moveFocusToLastFocusable])

  return {
    trapFocus: () => {
      if (containerRef.current) {
        moveFocusToFirstFocusable(containerRef.current)
      }
    },
  }
}

/**
 * Hook para detectar navegação por teclado
 */
export function useKeyboardNavigation() {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detecta navegação por Tab
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false)
    }

    const handleTouchStart = () => {
      setIsKeyboardNavigation(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('touchstart', handleTouchStart)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  return isKeyboardNavigation
}

/**
 * Hook para skip links (links de navegação rápida)
 */
export function useSkipLinks() {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const skipToNavigation = useCallback(() => {
    skipToContent('main-navigation')
  }, [skipToContent])

  const skipToMain = useCallback(() => {
    skipToContent('main-content')
  }, [skipToContent])

  return {
    skipToContent,
    skipToNavigation,
    skipToMain,
  }
}
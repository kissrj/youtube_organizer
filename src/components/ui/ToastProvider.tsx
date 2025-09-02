'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface ToastOptions {
  title?: string
  description?: string
  durationMs?: number
  actionLabel?: string
  onAction?: () => void
  variant?: ToastVariant
}

interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'description' | 'durationMs' | 'variant'>> {
  id: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timeouts = useRef<Record<string, any>>({})

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id))
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id])
      delete timeouts.current[id]
    }
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2)
    const item: ToastItem = {
      id,
      title: options.title ?? '',
      description: options.description ?? '',
      durationMs: options.durationMs ?? 4500,
      variant: options.variant ?? 'default',
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    }
    setItems(prev => [...prev, item])
    timeouts.current[id] = setTimeout(() => remove(id), item.durationMs)
  }, [remove])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container */}
      <div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2 max-w-sm">
        {items.map(item => (
          <div
            key={item.id}
            role="status"
            className={[
              'rounded-lg shadow-lg border px-4 py-3 bg-white',
              'animate-in slide-in-from-bottom fade-in duration-200',
              item.variant === 'success' ? 'border-green-200' : '',
              item.variant === 'error' ? 'border-red-200' : '',
              item.variant === 'warning' ? 'border-yellow-200' : '',
            ].join(' ')}
          >
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                {!!item.title && (
                  <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                )}
                {!!item.description && (
                  <div className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                {item.actionLabel && item.onAction && (
                  <button
                    onClick={() => {
                      try { item.onAction?.() } finally { remove(item.id) }
                    }}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {item.actionLabel}
                  </button>
                )}
                <button
                  aria-label="Fechar"
                  onClick={() => remove(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


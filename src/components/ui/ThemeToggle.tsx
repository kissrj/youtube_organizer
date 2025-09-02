'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button
        aria-label="Alternar tema"
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <Sun className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Alternar tema"
      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
    >
      {isDark ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="text-sm text-gray-700">{isDark ? 'Escuro' : 'Claro'}</span>
    </button>
  )
}


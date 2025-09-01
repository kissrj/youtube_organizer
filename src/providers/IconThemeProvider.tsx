'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface IconTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

interface IconThemeContextType {
  theme: IconTheme
  updateTheme: (theme: Partial<IconTheme>) => void
  resetTheme: () => void
}

const defaultTheme: IconTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  backgroundColor: '#ffffff',
  textColor: '#374151'
}

const IconThemeContext = createContext<IconThemeContextType | undefined>(undefined)

export function IconThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<IconTheme>(defaultTheme)

  const updateTheme = (newTheme: Partial<IconTheme>) => {
    setTheme(prev => ({ ...prev, ...newTheme }))
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
  }

  return (
    <IconThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </IconThemeContext.Provider>
  )
}

export function useIconTheme() {
  const context = useContext(IconThemeContext)
  if (context === undefined) {
    throw new Error('useIconTheme must be used within an IconThemeProvider')
  }
  return context
}

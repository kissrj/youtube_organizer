import React from 'react'
import { renderCompactMarkdown } from '@/lib/utils/markdown-renderer'

interface CompactMarkdownProps {
  text: string
  maxLength?: number
  className?: string
}

/**
 * React component for rendering compact markdown in video cards
 */
export const CompactMarkdown: React.FC<CompactMarkdownProps> = ({
  text,
  maxLength = 150,
  className = "text-gray-600 text-sm"
}) => {
  if (!text) return null

  const processedText = renderCompactMarkdown(text, maxLength)

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  )
}

export default CompactMarkdown
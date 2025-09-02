/**
 * Advanced markdown-like text processor for video descriptions
 * Supports: headers, bold, italic, strikethrough, inline code, links, lists, blockquotes, code blocks, images
 */
export const processMarkdownToHtml = (text: string): string => {
  if (!text) return ''

  // Split into blocks (paragraphs, lists, etc.)
  const blocks = text.split('\n\n')
  const htmlParts: string[] = []

  blocks.forEach((block, blockIndex) => {
    const trimmedBlock = block.trim()

    if (!trimmedBlock) return

    // Handle headers
    if (trimmedBlock.startsWith('#')) {
      const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const content = headerMatch[2]
        const processedContent = processInlineMarkdown(content)

        const className = `font-bold text-gray-900 mt-4 mb-2 ${
          level === 1 ? 'text-xl' :
          level === 2 ? 'text-lg' :
          level === 3 ? 'text-base' : 'text-sm'
        }`

        htmlParts.push(`<h${level} class="${className}"><span>${processedContent}</span></h${level}>`)
        return
      }
    }

    // Handle blockquotes
    if (trimmedBlock.startsWith('>')) {
      const quoteLines = trimmedBlock.split('\n')
      const quoteContent = quoteLines
        .map(line => line.replace(/^>\s*/, ''))
        .join('\n')
        .trim()

      if (quoteContent) {
        const processedContent = processInlineMarkdown(quoteContent)
        const className = "border-l-4 border-gray-300 pl-3 italic text-gray-700 my-3 bg-gray-50 py-2 px-3 rounded-r text-sm"

        htmlParts.push(`<blockquote class="${className}">${processedContent.replace(/\n/g, '<br />')}</blockquote>`)
        return
      }
    }

    // Handle code blocks
    if (trimmedBlock.startsWith('```')) {
      const lines = trimmedBlock.split('\n')
      const firstLine = lines[0]
      const language = firstLine.replace(/^```/, '') || 'text'
      const codeContent = lines.slice(1, -1).join('\n')

      if (codeContent.trim()) {
        let html = '<div class="my-3">'

        if (language !== 'text') {
          html += `<div class="text-xs text-gray-500 mb-1 px-3 py-1 bg-gray-50 border-b rounded-t">${language}</div>`
        }

        html += `<pre class="bg-gray-100 border rounded p-3 overflow-x-auto text-sm font-mono"><code>${codeContent}</code></pre></div>`
        htmlParts.push(html)
        return
      }
    }

    // Handle lists
    if (trimmedBlock.includes('\n- ') || trimmedBlock.includes('\n* ') || /^\d+\.\s/.test(trimmedBlock)) {
      const isOrdered = /^\d+\.\s/.test(trimmedBlock)
      const tagName = isOrdered ? 'ol' : 'ul'
      const listClass = isOrdered ? 'list-decimal' : 'list-disc'

      const listItems = trimmedBlock.split('\n').filter(line => line.trim()).map(line => {
        const cleanLine = line.replace(/^[-*]\s+|^(\d+)\.\s+/, '').trim()
        return cleanLine ? processInlineMarkdown(cleanLine) : null
      }).filter(item => item !== null)

      if (listItems.length > 0) {
        const className = `${listClass} list-inside space-y-1 my-3 ml-4 text-sm`
        const itemsHtml = listItems.map(item => `<li class="text-gray-700">${item}</li>`).join('')

        htmlParts.push(`<${tagName} class="${className}">${itemsHtml}</${tagName}>`)
        return
      }
    }

    // Handle images
    if (trimmedBlock.includes('![')) {
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
      const images: string[] = []
      let processedBlock = trimmedBlock

      processedBlock = processedBlock.replace(imageRegex, (match, alt, src) => {
        if (src && src.trim()) {
          const imageHtml = `<img src="${src}" alt="${alt || 'Image'}" class="max-w-full h-auto rounded-lg shadow-sm my-2" loading="lazy" onerror="this.style.display='none'" />`
          images.push(imageHtml)
          return imageHtml
        }
        return match
      })

      if (images.length > 0) {
        htmlParts.push(`<div class="my-3 text-center">${images.join('')}</div>`)
        return
      }
    }

    // Handle regular paragraphs
    const processedContent = processInlineMarkdown(trimmedBlock)
    htmlParts.push(`<p class="mb-3 last:mb-0 text-gray-700 leading-relaxed text-sm">${processedContent.replace(/\n/g, '<br />')}</p>`)
  })

  return htmlParts.join('')
}

// Process inline markdown elements
const processInlineMarkdown = (text: string): string => {
  return text
    // Bold text **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text *text*
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>')
    // Inline code `code`
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    // Plain URLs
    .replace(
      /(https?:\/\/[^\s]+)/g,
      (match) => {
        const cleanUrl = match.replace(/[.,;:!?]$/, '')
        const displayUrl = cleanUrl.length > 30 ? cleanUrl.substring(0, 27) + '...' : cleanUrl
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline text-xs break-words" title="${cleanUrl}">${displayUrl}</a>`
      }
    )
    // www. URLs without protocol
    .replace(
      /(^|\s)(www\.[^\s]+)/g,
      (match, space, url) => {
        const cleanUrl = url.replace(/[.,;:!?]$/, '')
        const fullUrl = `https://${cleanUrl}`
        const displayUrl = cleanUrl.length > 30 ? cleanUrl.substring(0, 27) + '...' : cleanUrl
        return `${space}<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline text-xs break-words" title="${fullUrl}">${displayUrl}</a>`
      }
    )
}

/**
 * Simplified version for compact displays (like video cards)
 * Only processes basic formatting and links
 */
export const renderCompactMarkdown = (text: string, maxLength: number = 150): string => {
  if (!text) return ''

  // Truncate if too long
  const truncated = text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text

  return processInlineMarkdown(truncated)
}
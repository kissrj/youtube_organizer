
"use client"

import React, { useState } from "react"
import { processMarkdownToHtml } from "@/lib/utils/markdown-renderer"

type Video = {
  id: string
  youtubeId: string
  title: string
  description?: string
  thumbnailUrl?: string
}

interface Props {
  video: Video | null
  onClose: () => void
}

export default function VideoModal({ video, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'video' | 'description'>('video')

  if (!video) return null

  const ytId = video.youtubeId
  const title = video.title || "Video"

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft' && activeTab === 'description') {
      setActiveTab('video')
    } else if (e.key === 'ArrowRight' && activeTab === 'video') {
      setActiveTab('description')
    }
  }

  // Render description using the utility function
  const renderDescription = (text: string) => {
    if (!text) return null

    const htmlContent = processMarkdownToHtml(text)
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="tabpanel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50" role="tablist" aria-label="Video content tabs">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
              activeTab === 'video'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            aria-selected={activeTab === 'video'}
            role="tab"
            aria-controls="video-panel"
            id="video-tab"
          >
            <span className="hidden sm:inline">🎥 Video</span>
            <span className="sm:hidden">🎥</span>
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
              activeTab === 'description'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            aria-selected={activeTab === 'description'}
            role="tab"
            aria-controls="description-panel"
            id="description-tab"
          >
            <span className="hidden sm:inline">📝 Description</span>
            <span className="sm:hidden">📝</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-hidden">
          {activeTab === 'video' && (
            <div
              className="aspect-video w-full bg-black"
              id="video-panel"
              role="tabpanel"
              aria-labelledby="video-tab"
              aria-hidden={activeTab !== 'video'}
            >
              {ytId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white p-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎥</div>
                    <p className="text-sm sm:text-base">YouTube ID not available</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div
              className="max-h-96 overflow-y-auto"
              id="description-panel"
              role="tabpanel"
              aria-labelledby="description-tab"
              aria-hidden={activeTab !== 'description'}
            >
              {video.description ? (
                <div className="p-4 sm:p-6 font-['Inter','Roboto',sans-serif] text-sm sm:text-base">
                  {renderDescription(video.description)}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-sm sm:text-base">No description available for this video.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

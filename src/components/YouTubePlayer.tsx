'use client'

import { useEffect, useRef } from 'react'

interface YouTubePlayerProps {
  videoId: string
  width?: string
  height?: string
  className?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubePlayer({
  videoId,
  width = '100%',
  height = '400px',
  className = ''
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer()
      }
    } else {
      initializePlayer()
    }

    function initializePlayer() {
      if (playerRef.current && !playerInstanceRef.current) {
        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
          height: height.replace('px', ''),
          width: width.replace('px', ''),
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            fs: 1,
            cc_load_policy: 0,
            disablekb: 0,
          },
          events: {
            onReady: () => {
              console.log('YouTube player ready')
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data)
            },
          },
        })
      }
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      }
    }
  }, [videoId, width, height])

  return (
    <div className={`youtube-player ${className}`}>
      <div ref={playerRef} style={{ width, height }} />
    </div>
  )
}
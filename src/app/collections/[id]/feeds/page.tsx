'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { FeedList } from '@/components/feeds/FeedList'
import { FeedVideos } from '@/components/feeds/FeedVideos'
import { Feed } from '@/lib/types'
import { AuthGuard } from '@/components/AuthGuard'

export default function CollectionFeedsPage() {
  const params = useParams()
  const collectionId = params.id as string
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null)

  const handleFeedSelect = (feed: Feed) => {
    setSelectedFeed(feed)
  }

  const handleBackToFeeds = () => {
    setSelectedFeed(null)
  }

  if (selectedFeed) {
    return (
      <AuthGuard>
        <div className="container mx-auto p-6">
          <FeedVideos
            feedId={selectedFeed.id}
            onBack={handleBackToFeeds}
          />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <FeedList
          collectionId={collectionId}
          onFeedSelect={handleFeedSelect}
        />
      </div>
    </AuthGuard>
  )
}

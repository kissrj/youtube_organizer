'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'

interface YouTubeStatus {
  connected: boolean
  youtubeUserId?: string
  youtubeUsername?: string
  connectedAt?: string
  tokenValid?: boolean
  tokenExpiry?: string
  scope?: string
}

export default function Dashboard() {
  const [youtubeStatus, setYoutubeStatus] = useState<YouTubeStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkYouTubeStatus()
  }, [])

  const checkYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status')
      if (response.ok) {
        const data = await response.json()
      }
    } catch (error) {
      console.error('Error checking YouTube status:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Error connecting YouTube:', error)
    }
  }

  const disconnectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'DELETE'
      })
      if (response.ok) {
        setYoutubeStatus({ connected: false })
      }
    } catch (error) {
      console.error('Error disconnecting YouTube:', error)
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to YouTube Organizer
          </h2>
          <p className="text-gray-600 mb-6">
            Organize your YouTube playlists by categories and tags efficiently.
          </p>

          {/* YouTube Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🔗 YouTube Connection
            </h3>

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Checking connection...</span>
              </div>
            ) : youtubeStatus?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium text-green-700">Connected</span>
                  {youtubeStatus.youtubeUsername && (
                    <span className="text-gray-600">as {youtubeStatus.youtubeUsername}</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎯 <strong className="text-gray-900">You can access:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li className="text-green-700">✅ Public playlists</li>
                    <li className="text-green-700">✅ Private playlists</li>
                    <li className="text-green-700">✅ Unlisted playlists</li>
                    <li className="text-green-700">✅ Your complete history</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={disconnectYouTube}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Disconnect YouTube
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-700">Not connected</span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎯 <strong className="text-gray-900">Without OAuth connection:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li className="text-green-700">✅ Public playlists only</li>
                    <li className="text-red-700">❌ Private playlists (blocked)</li>
                    <li className="text-red-700">❌ Unlisted playlists (blocked)</li>
                    <li className="text-red-700">❌ Your personal history (blocked)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>💡 To access your private playlists:</strong>
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Configure OAuth in Google Cloud Console</li>
                    <li>Add credentials to the .env file</li>
                    <li>Click "Connect YouTube" below</li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={connectYouTube}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔗 Connect YouTube
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📚 Notebooks
              </h3>
              <p className="text-blue-700 mb-4">
                Organize videos, channels and playlists in customizable notebooks
              </p>
              <Link
                href="/notebooks"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Notebooks
              </Link>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎥 Videos
              </h3>
              <p className="text-green-700 mb-4">
                Manage your imported videos
              </p>
              <Link
                href="/videos"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Videos
              </Link>
            </div>
  
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                🏷️ Tags
              </h3>
              <p className="text-purple-700 mb-4">
                Add tags to your videos
              </p>
              <Link
                href="/tags"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                View Tags
              </Link>
            </div>
  
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                🤖 Auto Tags
              </h3>
              <p className="text-orange-700 mb-4">
                Intelligent system for automatic tag analysis and suggestions
              </p>
              <Link
                href="/auto-tags"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Manage Tags
              </Link>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                🔄 Synchronization
              </h3>
              <p className="text-indigo-700 mb-4">
                Keep your data synchronized across devices
              </p>
              <Link
                href="/sync"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Manage Sync
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How to get started
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sync your playlists</h4>
                <p className="text-gray-600">
                  Use a YouTube playlist ID to import automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Create categories</h4>
                <p className="text-gray-600">
                  Organize your playlists by themes, topics or any criteria.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Add tags</h4>
                <p className="text-gray-600">
                  Use tags for more granular and flexible organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

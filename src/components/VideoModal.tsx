'use client'

import { useState, useEffect } from 'react'
import { X, Play, FileText, Brain, Loader2 } from 'lucide-react'

interface Video {
  id: string
  youtubeId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  viewCount: string
  likeCount: string
  commentCount: string
  publishedAt: string
  categories?: Array<{
    category: {
      id: string
      name: string
      color?: string
    }
  }>
}

interface TranscriptItem {
  text: string
  start: number
  duration: number
}

interface VideoModalProps {
  video: Video | null
  onClose: () => void
}

type TabType = 'player' | 'transcript' | 'summary'

// Added 'description' tab
type _TabTypePatch = TabType | 'description'

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('player')
  const [transcript, setTranscript] = useState<TranscriptItem[]>([])
  const [transcriptSource, setTranscriptSource] = useState<'public' | 'oauth' | null>(null)
  const [transcriptCached, setTranscriptCached] = useState<boolean>(false)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    if (video && activeTab === 'transcript') {
      loadTranscript()
    } else if (video && activeTab === 'summary') {
      loadSummary()
    }
  }, [video, activeTab])

  const loadTranscript = async () => {
    if (!video) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/videos/${video.youtubeId}/transcript`)
  const data = await response.json()

      if (response.ok) {
        setTranscript(data.transcript || [])
        setTranscriptSource((data.source as 'public' | 'oauth') || null)
        setTranscriptCached(Boolean(data.cached))
      } else {
        setError(data.error || 'Erro ao carregar transcript')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    if (!video) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/videos/${video.youtubeId}/summary?sentiment=true&topics=true`)
      const data = await response.json()

      if (response.ok) {
        setSummary(data.summary || '')
      } else {
        setError(data.error || 'Erro ao gerar resumo')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!video) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-gray-300">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 border-gray-300">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900 truncate leading-tight">{video.title}</h2>
            {video.categories && video.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {video.categories.map(vc => (
                  <span
                    key={vc.category.id}
                    className="inline-block px-2 py-1 text-xs rounded-full text-gray-800"
                    style={{ backgroundColor: vc.category.color || '#d1d5db' }}
                  >
                    {vc.category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50 border-gray-300">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'player'
                  ? 'border-b-3 border-red-500 text-red-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Play size={18} />
              Player
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-b-3 border-blue-500 text-blue-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <FileText size={18} />
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('description' as TabType)}
              className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-b-3 border-yellow-500 text-yellow-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-semibold">Descrição</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-b-3 border-green-500 text-green-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Brain size={18} />
              Resumo IA
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'player' && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {/* Video description shown under player */}
          {activeTab === 'player' && (
            <></>
          )}

          {activeTab === 'transcript' && (
            <div className="p-6 overflow-y-auto max-h-full">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                  <span className="ml-3 text-gray-900 font-medium">Carregando transcript...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 font-semibold mb-2">⚠️ {error}</div>
                  <p className="text-gray-600 text-sm">
                    Este vídeo pode não ter legendas disponíveis ou estar em um idioma não suportado.
                  </p>
                </div>
              ) : transcript.length > 0 ? (
                <div className="space-y-3">
                  {/* description now rendered in its own tab */}

                  {(transcriptSource || transcriptCached) && (
                    <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded">
                      <div className="text-xs text-gray-600">
                        Fonte do transcript: {transcriptSource === 'oauth' ? 'YouTube API (OAuth)' : 'Pública'}
                      </div>
                      {transcriptCached && (
                        <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-800 border border-green-300">cache</span>
                      )}
                    </div>
                  )}

                  {transcript.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                      <span className="text-sm text-gray-600 font-mono min-w-[60px] font-semibold">
                        {formatTime(item.start)}
                      </span>
                      <p className="text-gray-900 leading-relaxed flex-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-900 font-medium">Transcript não disponível para este vídeo.</p>
                  {/* description now in its own tab */}
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="p-6 overflow-y-auto max-h-full">
              {video.description ? (
                <div className="p-3 bg-gray-50 border border-gray-300 rounded">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-xs text-gray-600 font-semibold">Descrição do vídeo</div>
                    <div className="text-xs text-gray-500">{video.channelTitle}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                    {showFullDesc ? video.description : video.description.slice(0, 400)}
                    {video.description.length > 400 && !showFullDesc && '...'}
                  </div>
                  {video.description.length > 400 && (
                    <button
                      onClick={() => setShowFullDesc(s => !s)}
                      className="mt-3 text-xs text-blue-600 font-medium hover:underline"
                    >
                      {showFullDesc ? 'Mostrar menos' : 'Mostrar mais'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-900 font-medium">Nenhuma descrição disponível para este vídeo.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="p-6 overflow-y-auto max-h-full">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-green-600" />
                  <span className="ml-3 text-gray-900 font-medium">Gerando resumo inteligente...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 font-semibold mb-2">⚠️ {error}</div>
                  <p className="text-gray-600 text-sm">
                    Não foi possível gerar o resumo. Verifique se o transcript está disponível.
                  </p>
                </div>
              ) : summary ? (
                <div className="prose max-w-none">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Resumo Inteligente</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1 font-medium">
                      Gerado por inteligência artificial baseado no transcript do vídeo
                    </p>
                  </div>

                  <div className="text-gray-900 leading-relaxed whitespace-pre-wrap font-medium">
                    {summary}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-300">
                    <button
                      onClick={loadSummary}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <Brain size={16} />
                      Regenerar Resumo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-900 font-medium">Resumo não disponível.</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Certifique-se de que o transcript está disponível para gerar o resumo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 border-gray-300">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              {/* Show primary category (if available) next to channel title for visibility */}
              {video.categories && video.categories.length > 0 ? (
                <span
                  className="inline-block px-2 py-1 text-xs rounded-full text-gray-800"
                  style={{ backgroundColor: video.categories[0].category.color || '#d1d5db' }}
                >
                  {video.categories[0].category.name}
                </span>
              ) : video.categoryId ? (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Categoria: {video.categoryId}</span>
              ) : null}

              <span className="font-semibold text-gray-900">{video.channelTitle}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{new Date(video.publishedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex gap-6">
              <span className="text-gray-600">👁️ {parseInt(video.viewCount || '0').toLocaleString()}</span>
              <span className="text-gray-600">👍 {parseInt(video.likeCount || '0').toLocaleString()}</span>
              <span className="text-gray-600">💬 {parseInt(video.commentCount || '0').toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
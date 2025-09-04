'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TestResult {
  authenticated: boolean
  userId?: string
  credentialsConfigured: boolean
  credentialsError?: string
  youtubeAccountExists: boolean
  youtubeAccount?: any
  status: string
  error?: string
  details?: string
}

export default function YouTubeTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-youtube')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        authenticated: false,
        credentialsConfigured: false,
        youtubeAccountExists: false,
        status: 'error',
        error: 'Erro ao executar teste',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Teste de Conexão YouTube</h3>

      <Button
        onClick={runTest}
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Testando...' : 'Executar Teste'}
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <strong>Autenticado:</strong>
              <span className={`ml-2 ${result.authenticated ? 'text-green-600' : 'text-red-600'}`}>
                {result.authenticated ? '✅ Sim' : '❌ Não'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <strong>Credenciais:</strong>
              <span className={`ml-2 ${result.credentialsConfigured ? 'text-green-600' : 'text-red-600'}`}>
                {result.credentialsConfigured ? '✅ Configuradas' : '❌ Não configuradas'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <strong>Conta YouTube:</strong>
              <span className={`ml-2 ${result.youtubeAccountExists ? 'text-green-600' : 'text-red-600'}`}>
                {result.youtubeAccountExists ? '✅ Existe' : '❌ Não existe'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <strong>Status:</strong>
              <span className={`ml-2 ${result.status === 'connected' ? 'text-green-600' : 'text-yellow-600'}`}>
                {result.status === 'connected' ? '✅ Conectado' : '⚠️ Não conectado'}
              </span>
            </div>
          </div>

          {result.youtubeAccount && (
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium mb-2">Detalhes da Conta YouTube:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>User ID:</strong> {result.youtubeAccount.youtubeUserId}</p>
                <p><strong>Username:</strong> {result.youtubeAccount.youtubeUsername}</p>
                <p><strong>Conectado em:</strong> {new Date(result.youtubeAccount.connectedAt).toLocaleString()}</p>
                <p><strong>Token válido:</strong> {result.youtubeAccount.tokenValid ? '✅ Sim' : '❌ Não'}</p>
                {result.youtubeAccount.tokenExpiry && (
                  <p><strong>Expira em:</strong> {new Date(result.youtubeAccount.tokenExpiry).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {result.credentialsError && (
            <div className="bg-red-50 p-4 rounded">
              <h4 className="font-medium mb-2 text-red-800">Erro nas Credenciais:</h4>
              <p className="text-red-700">{result.credentialsError}</p>
            </div>
          )}

          {result.error && (
            <div className="bg-red-50 p-4 rounded">
              <h4 className="font-medium mb-2 text-red-800">Erro:</h4>
              <p className="text-red-700">{result.error}</p>
              {result.details && <p className="text-red-600 text-sm mt-1">{result.details}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
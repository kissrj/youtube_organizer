'use client';

import { useState, useEffect } from 'react';
import { YouTubeImportProgress } from '@/components/import/YouTubeImportProgress';
import { Youtube } from 'lucide-react';

interface ImportOptions {
  importHistory: boolean;
  importPlaylists: boolean;
  days: number;
  applyAITags: boolean;
}

interface YouTubeStatus {
  connected: boolean
  youtubeUserId?: string
  youtubeUsername?: string
  connectedAt?: string
  tokenValid?: boolean
  tokenExpiry?: string
  scope?: string
}

export default function YouTubeImportPage() {
  const [step, setStep] = useState<'config' | 'progress'>('config');
  const [jobId, setJobId] = useState<string | null>(null);
  const [options, setOptions] = useState<ImportOptions>({
    importHistory: true,
    importPlaylists: true,
    days: 3,
    applyAITags: true
  });
  const [youtubeStatus, setYoutubeStatus] = useState<YouTubeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkYouTubeStatus();
  }, []);

  const checkYouTubeStatus = async () => {
    try {
      const response = await fetch('/api/auth/youtube/status');
      if (response.ok) {
        const data = await response.json();
        setYoutubeStatus(data);
      } else {
        setYoutubeStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error checking YouTube status:', error);
      setYoutubeStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const connectYouTube = async () => {
    try {
      const response = await fetch('/api/auth/youtube');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        console.error('Failed to get YouTube auth URL:', response.status);
      }
    } catch (error) {
      console.error('Error connecting YouTube:', error);
    }
  };

  const startImport = async () => {
    try {
      console.log('🚀 Iniciando importação com opções:', options);

      const response = await fetch('/api/import/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });

      const result = await response.json();
      console.log('📡 Resposta da API:', response.status, result);

      if (response.ok && result.jobId) {
        console.log('✅ Job criado com sucesso:', result.jobId);
        setJobId(result.jobId);
        setStep('progress');
      } else {
        const errorMsg = result.error || result.details || 'Erro desconhecido';
        console.error('❌ Erro na resposta:', errorMsg);

        // Tratamento específico para erro de conta YouTube não conectada
        if (errorMsg.includes('Conta YouTube não conectada') || result.action === 'CONNECT_YOUTUBE') {
          const shouldConnect = confirm(
            'Sua conta YouTube não está conectada. Para importar dados, você precisa conectar sua conta YouTube primeiro.\n\n' +
            'Deseja ir para a página inicial para conectar sua conta YouTube?'
          );

          if (shouldConnect) {
            window.location.href = result.redirectUrl || '/';
            return;
          }
        } else {
          alert(`Erro ao iniciar importação: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      alert('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  };

  if (step === 'progress' && jobId && jobId.trim() !== '') {
    console.log('🎯 Renderizando componente de progresso com jobId:', jobId);
    return <YouTubeImportProgress jobId={jobId} />;
  }

  // Estado de erro se chegamos aqui sem jobId válido
  if (step === 'progress' && (!jobId || jobId.trim() === '')) {
    console.error('❌ Tentativa de renderizar progresso sem jobId válido');
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Erro na Importação</h2>
            <p className="text-red-700 mb-4">
              Job ID não foi definido corretamente. Isso pode indicar um problema na comunicação com o servidor.
            </p>
            <button
              onClick={() => {
                setStep('config');
                setJobId(null);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Voltar e Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Importar dados do YouTube</h1>
          <p className="text-muted-foreground">
            Importe seu histórico de vídeos e playlists com tags inteligentes geradas por IA
          </p>
        </div>

        {/* YouTube Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold">Status da Conexão YouTube</h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Verificando conexão...</span>
            </div>
          ) : youtubeStatus?.connected ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-green-700 border border-green-200">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-medium">Conectado</span>
                {youtubeStatus.youtubeUsername && (
                  <span className="text-gray-600">como {youtubeStatus.youtubeUsername}</span>
                )}
              </div>
              <p className="text-sm text-gray-700">
                ✅ Sua conta YouTube está conectada. Você pode importar dados normalmente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-yellow-800 border border-yellow-200">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                <span className="font-medium">Não conectado</span>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 p-4">
                <p className="text-sm text-foreground mb-3 font-medium">
                  ⚠️ Para importar dados do YouTube, você precisa conectar sua conta primeiro:
                </p>
                <ol className="list-decimal list-inside text-sm text-foreground space-y-1 mb-4">
                  <li>Configure OAuth no Google Cloud Console</li>
                  <li>Adicione as credenciais no arquivo .env</li>
                  <li>Clique em "Conectar YouTube" abaixo</li>
                </ol>
                <button
                  onClick={connectYouTube}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white shadow hover:shadow-md hover:bg-red-700"
                >
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                  Conectar YouTube
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configurar Importação</h2>

          <div className="space-y-6">
            {/* Opção: Histórico de Vídeos */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="importHistory"
                checked={options.importHistory}
                onChange={(e) => setOptions({
                  ...options,
                  importHistory: e.target.checked
                })}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="importHistory" className="font-medium cursor-pointer">
                  Importar histórico de vídeos
                </label>
                <p className="text-sm text-gray-600">
                  Vídeos assistidos nos últimos {options.days} dias
                </p>
                {options.importHistory && (
                  <div className="mt-2">
                    <label className="text-sm font-medium">Dias:</label>
                    <select
                      value={options.days}
                      onChange={(e) => setOptions({
                        ...options,
                        days: parseInt(e.target.value)
                      })}
                      className="ml-2 border rounded px-2 py-1 text-sm"
                    >
                      <option value="1">1 dia</option>
                      <option value="3">3 dias</option>
                      <option value="7">7 dias</option>
                      <option value="30">30 dias</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Opção: Playlists */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="importPlaylists"
                checked={options.importPlaylists}
                onChange={(e) => setOptions({
                  ...options,
                  importPlaylists: e.target.checked
                })}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="importPlaylists" className="font-medium cursor-pointer">
                  Importar todas as playlists
                </label>
                <p className="text-sm text-gray-600">
                  Todas as suas playlists públicas e privadas
                </p>
              </div>
            </div>

            {/* Opção: Tags com IA */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="applyAITags"
                checked={options.applyAITags}
                onChange={(e) => setOptions({
                  ...options,
                  applyAITags: e.target.checked
                })}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="applyAITags" className="font-medium cursor-pointer">
                  Aplicar tags com IA
                </label>
                <p className="text-sm text-gray-600">
                  Usar OpenRouter para gerar tags inteligentes automaticamente
                </p>
              </div>
            </div>

            {/* Botão de Iniciar */}
            <button
              onClick={startImport}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
            >
              🚀 Iniciar Importação
            </button>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ Sobre a Importação</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A importação pode levar alguns minutos dependendo da quantidade de dados</li>
            <li>• Vídeos já importados serão pulados automaticamente</li>
            <li>• Tags com IA usam o OpenRouter para análise inteligente</li>
            <li>• Você pode acompanhar o progresso em tempo real</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
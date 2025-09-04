'use client';

import { useState, useEffect } from 'react';

interface ImportProgress {
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  overallProgress: number;
  currentStep: string;
  videosImported: number;
  playlistsImported: number;
  tagsCreated: number;
  categoriesCreated: number;
  errors: string[];
  startedAt: string;
  completedAt?: string;
}

export function YouTubeImportProgress({ jobId }: { jobId: string }) {
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validação crítica: jobId deve existir
    if (!jobId || jobId.trim() === '') {
      console.error('❌ ERRO CRÍTICO: jobId não fornecido ou vazio!', { jobId });
      setError('Job ID não fornecido. Tente iniciar a importação novamente.');
      return;
    }

    console.log('✅ YouTubeImportProgress: Iniciando com jobId válido:', jobId);

    const fetchProgress = async () => {
      try {
        console.log('📡 Fazendo requisição para:', `/api/import/youtube?jobId=${jobId}`);
        const response = await fetch(`/api/import/youtube?jobId=${jobId}`);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Resposta recebida:', data);
          setProgress(data);

          if (data.status === 'completed' || data.status === 'failed') {
            console.log('🎯 Job finalizado:', data.status);
            // Parar polling quando completar
            return;
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Erro na resposta:', response.status, errorText);
          setError(`Erro ao buscar status: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error('❌ Erro de conexão:', err);
        setError('Erro de conexão com o servidor');
      }
    };

    // Buscar status inicial
    fetchProgress();

    // Polling a cada 3 segundos
    const interval = setInterval(fetchProgress, 3000);

    return () => {
      console.log('🧹 Limpando interval do polling');
      clearInterval(interval);
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Erro na Importação</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {progress.status === 'completed' ? '✅ Importação Concluída!' :
             progress.status === 'failed' ? '❌ Importação Falhou' :
             '🔄 Importando dados do YouTube'}
          </h1>

          <div className="text-sm text-gray-600">
            Iniciado em: {new Date(progress.startedAt).toLocaleString()}
            {progress.completedAt && (
              <span className="ml-4">
                Finalizado em: {new Date(progress.completedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso geral</span>
            <span>{progress.overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Status atual */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">Status atual:</div>
          <div className="text-lg font-medium">
            {progress.currentStep}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {progress.videosImported}
            </div>
            <div className="text-sm text-blue-700">Vídeos importados</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {progress.playlistsImported}
            </div>
            <div className="text-sm text-green-700">Playlists importadas</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {progress.tagsCreated}
            </div>
            <div className="text-sm text-purple-700">Tags criadas</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {progress.categoriesCreated}
            </div>
            <div className="text-sm text-orange-700">Categorias criadas</div>
          </div>
        </div>

        {/* Lista de erros (se houver) */}
        {progress.errors && progress.errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-red-800 font-medium mb-2">Erros encontrados:</h3>
            <ul className="text-red-700 text-sm">
              {progress.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações finais */}
        {progress.status === 'completed' && (
          <div className="flex space-x-4">
            <a
              href="/videos"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-center"
            >
              Ver Vídeos Importados
            </a>
            <a
              href="/playlists"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 text-center"
            >
              Ver Playlists
            </a>
          </div>
        )}

        {progress.status === 'failed' && (
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
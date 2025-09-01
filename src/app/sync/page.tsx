'use client';

import { useState } from 'react';
import { SyncManager } from '@/components/sync/SyncManager';
import { useSync } from '@/hooks/useSync';

export default function SyncPage() {
  const [selectedTab, setSelectedTab] = useState('manager');
  const {
    syncStatus,
    isSyncing,
    lastSync,
    conflicts,
    error,
    performSync,
    generateBackup,
    restoreBackup
  } = useSync();

  const handleBackup = async () => {
    const result = await generateBackup();
    if (result.success) {
      // Criar download do arquivo
      const blob = new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const result = await restoreBackup(backup);

      if (result.success) {
        alert(`Backup restaurado com sucesso! ${result.itemsRestored} itens restaurados.`);
      } else {
        alert(`Erro ao restaurar backup: ${result.error}`);
      }
    } catch (err) {
      alert('Erro ao processar arquivo de backup');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sincronização entre Dispositivos</h1>
        <p className="text-muted-foreground">
          Mantenha suas coleções e configurações sincronizadas em todos os seus dispositivos
        </p>
      </div>

      {/* Status da Sincronização */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">📊 Status da Sincronização</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus?.activeSessions || 0}
            </div>
            <div className="text-sm text-gray-600">Sessões Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {syncStatus?.queueItems || 0}
            </div>
            <div className="text-sm text-gray-600">Itens na Fila</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {conflicts.length}
            </div>
            <div className="text-sm text-gray-600">Conflitos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {syncStatus?.totalAttempts || 0}
            </div>
            <div className="text-sm text-gray-600">Tentativas</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isSyncing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Sincronizando...</span>
              </div>
            ) : lastSync ? (
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span>Última sincronização: {lastSync.toLocaleString('pt-BR')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">⏳</span>
                <span>Nenhuma sincronização realizada</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-600">{error}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={performSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🔄 Sincronizar Agora
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gerenciador */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Gerenciador</h3>
          <p className="text-gray-600 mb-4">
            Gerencie dispositivos e sessões de sincronização
          </p>
          <button
            onClick={() => setSelectedTab('manager')}
            className={`w-full px-4 py-2 rounded-md ${
              selectedTab === 'manager'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Abrir Gerenciador
          </button>
        </div>

        {/* Backup */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💾 Backup</h3>
          <p className="text-gray-600 mb-4">
            Faça backup e restaure seus dados
          </p>
          <button
            onClick={() => setSelectedTab('backup')}
            className={`w-full px-4 py-2 rounded-md ${
              selectedTab === 'backup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gerenciar Backup
          </button>
        </div>

        {/* Conflitos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚠️ Conflitos</h3>
          <p className="text-gray-600 mb-4">
            Resolva conflitos de sincronização
          </p>
          <button
            onClick={() => setSelectedTab('conflicts')}
            className={`w-full px-4 py-2 rounded-md ${
              selectedTab === 'conflicts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ver Conflitos
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gerenciador */}
        {selectedTab === 'manager' && (
          <div className="bg-white rounded-lg shadow p-6">
            <SyncManager userId="user-id" />
          </div>
        )}

        {/* Backup */}
        {selectedTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">💾 Gerenciamento de Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Gerar Backup</h4>
                  <p className="text-gray-600">
                    Baixe um arquivo JSON com todas as suas coleções, feeds e tags
                  </p>
                  <button
                    onClick={handleBackup}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    📥 Baixar Backup
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium">Restaurar Backup</h4>
                  <p className="text-gray-600">
                    Carregue um arquivo de backup para restaurar seus dados
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Estatísticas do Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {syncStatus?.activeSessions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Coleções</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {syncStatus?.queueItems || 0}
                  </div>
                  <div className="text-sm text-gray-600">Feeds</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {conflicts.length}
                  </div>
                  <div className="text-sm text-gray-600">Tags</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conflitos */}
        {selectedTab === 'conflicts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">⚠️ Gerenciamento de Conflitos</h3>
              <p className="text-gray-600 mb-4">
                Resolva conflitos de sincronização entre dispositivos
              </p>

              {conflicts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✅</div>
                  <h4 className="text-lg font-medium mb-2">Nenhum Conflito Detectado</h4>
                  <p className="text-gray-600">
                    Todos os seus dados estão sincronizados corretamente entre dispositivos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium">Conflitos Pendentes</h4>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                      {conflicts.length} conflitos
                    </span>
                  </div>

                  <div className="space-y-3">
                    {conflicts.map((conflict, index) => (
                      <div key={conflict.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="font-medium">Conflito #{index + 1}</span>
                            <span className="text-gray-600">- {conflict.entityType}</span>
                          </div>
                          <span className={`text-sm ${conflict.status === 'PENDING' ? 'text-red-600' : 'text-green-600'}`}>
                            {conflict.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Operação:</span>
                            <p className="text-gray-600">{conflict.operation}</p>
                          </div>
                          <div>
                            <span className="font-medium">Dispositivo:</span>
                            <p className="text-gray-600">{conflict.session?.deviceName}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Manter Local
                          </button>
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            Substituir por Remoto
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                            Mesclar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

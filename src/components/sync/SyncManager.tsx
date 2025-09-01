'use client';

import { useState, useEffect } from 'react';
import { SyncSession, SyncQueue, SyncConflict } from '@/lib/types';

interface SyncManagerProps {
  userId: string;
}

export function SyncManager({ userId }: SyncManagerProps) {
  const [sessions, setSessions] = useState<SyncSession[]>([]);
  const [queueItems, setQueueItems] = useState<SyncQueue[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'web' | 'mobile' | 'desktop'>('web');

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    try {
      const [sessionsRes, queueRes, conflictsRes, statusRes] = await Promise.all([
        fetch('/api/sync/session'),
        fetch('/api/sync/queue'),
        fetch('/api/sync/conflicts'),
        fetch('/api/sync/status')
      ]);

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }

      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setQueueItems(queueData);
      }

      if (conflictsRes.ok) {
        const conflictsData = await conflictsRes.json();
        setConflicts(conflictsData);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSyncStatus(statusData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de sincronização:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!newDeviceName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sync/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: newDeviceName,
          deviceType: newDeviceType
        })
      });

      if (response.ok) {
        await loadSyncData();
        setNewDeviceName('');
        setNewDeviceType('web');
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSync = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        await loadSyncData();
      }
    } catch (error) {
      console.error('Erro ao iniciar sincronização:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync/backup');
      if (response.ok) {
        const backup = await response.json();

        // Criar download do backup
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Backup restaurado com sucesso! ${result.itemsRestored} itens restaurados.`);
        await loadSyncData();
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return '📱';
      case 'desktop':
        return '🖥️';
      case 'web':
        return '🌐';
      default:
        return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'text-green-600';
      case 'INACTIVE':
        return 'text-gray-600';
      case 'ERROR':
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gerenciador de Sincronização</h2>
          <p className="text-muted-foreground">
            Gerencie a sincronização entre seus dispositivos
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateBackup}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            📥 Backup
          </button>
          <button
            onClick={loadSyncData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Status Geral */}
      {syncStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Status da Sincronização</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncStatus.activeSessions}</div>
              <div className="text-sm text-gray-600">Sessões Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncStatus.queueItems}</div>
              <div className="text-sm text-gray-600">Itens na Fila</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{syncStatus.conflicts}</div>
              <div className="text-sm text-gray-600">Conflitos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{syncStatus.totalAttempts}</div>
              <div className="text-sm text-gray-600">Tentativas</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Criar Nova Sessão */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">➕ Adicionar Dispositivo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Dispositivo
              </label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="Ex: Meu Notebook"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
            <button
              onClick={handleCreateSession}
              disabled={!newDeviceName.trim() || loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '⏳ Adicionando...' : '➕ Adicionar'}
            </button>
          </div>
        </div>

        {/* Lista de Sessões */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📱 Dispositivos</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDeviceIcon(session.deviceType)}</span>
                  <div>
                    <div className="font-medium">{session.deviceName}</div>
                    <div className={`text-sm ${getStatusColor(session.status)}`}>
                      {session.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleStartSync(session.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      🔄
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fila de Sincronização */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⏳ Fila de Sincronização</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {queueItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>Nenhuma operação pendente</p>
              </div>
            ) : (
              queueItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${getQueueStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Prioridade: {item.priority}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{item.entityType}</div>
                    <div className="text-gray-600">
                      {item.operation} - {item.entityId}
                    </div>
                    {item.error && (
                      <div className="text-red-600 text-xs mt-1">{item.error}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Conflitos */}
      {conflicts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚠️ Conflitos de Sincronização</h3>
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="font-medium">{conflict.entityType}</span>
                    <span className="text-gray-600">- {conflict.entityId}</span>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

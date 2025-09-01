'use client';

import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '@/lib/services/sync';

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: (result: any) => void;
  onConflictDetected?: (conflicts: any[]) => void;
}

export function useSync(options: UseSyncOptions = {}) {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    autoSync = true,
    syncInterval = 30000, // 30 segundos
    onSyncComplete,
    onConflictDetected
  } = options;

  // Carregar status inicial
  useEffect(() => {
    loadSyncStatus();
  }, []);

  // Sincronização automática
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      performSync();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval]);

  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await SyncService.getSyncStatus('user-id'); // Substituir pelo ID real do usuário
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar status');
    }
  }, []);

  const performSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      // Detectar conflitos
      const conflictCount = await SyncService.detectConflicts('user-id');

      if (conflictCount > 0) {
        const conflictsList = await fetch('/api/sync/conflicts').then(res => res.json());
        setConflicts(conflictsList);
        onConflictDetected?.(conflictsList);
      }

      // Iniciar sincronização via API
      const response = await fetch('/api/sync/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'session-id' })
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar sincronização');
      }

      // Atualizar status
      await loadSyncStatus();

      setLastSync(new Date());
      onSyncComplete?.({ success: true, conflicts: conflictCount });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro durante sincronização');
      onSyncComplete?.({ success: false, error: err });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadSyncStatus, onSyncComplete, onConflictDetected]);

  const addToSyncQueue = useCallback(async (operation: {
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    data: any;
    priority?: number;
  }) => {
    try {
      await SyncService.addToQueue('user-id', operation);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar à fila';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const generateBackup = useCallback(async () => {
    try {
      const backup = await SyncService.generateBackup('user-id');
      return { success: true, backup };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const restoreBackup = useCallback(async (backup: any) => {
    try {
      const result = await SyncService.restoreBackup('user-id', backup);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao restaurar backup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    syncStatus,
    isSyncing,
    lastSync,
    conflicts,
    error,
    performSync,
    addToSyncQueue,
    generateBackup,
    restoreBackup,
    loadSyncStatus
  };
}

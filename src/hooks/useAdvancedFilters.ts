import { useState, useCallback } from 'react';
import { FilterPreset } from '@/lib/services/advancedFilters';

// Tipo personalizado para filtros aplicados
export interface AppliedFilters {
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    logic?: string;
  }>;
  logic: 'AND' | 'OR';
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface UseAdvancedFiltersOptions {
  collectionId: string;
  onFiltersApplied?: (filters: AppliedFilters, results: any) => void;
  onPresetSaved?: (preset: FilterPreset) => void;
  onError?: (error: string) => void;
}

export function useAdvancedFilters(options: UseAdvancedFiltersOptions) {
  const { collectionId, onFiltersApplied, onPresetSaved, onError } = options;

  const [currentFilters, setCurrentFilters] = useState<AppliedFilters | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [lastResults, setLastResults] = useState<any>(null);
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  const applyFilters = useCallback(async (filters: AppliedFilters) => {
    setIsApplying(true);
    try {
      const response = await fetch('/api/filters/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterOptions: filters,
          collectionId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao aplicar filtros');
      }

      const results = await response.json();
      setCurrentFilters(filters);
      setLastResults(results);

      if (onFiltersApplied) {
        onFiltersApplied(filters, results);
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    } finally {
      setIsApplying(false);
    }
  }, [collectionId, onFiltersApplied, onError]);

  const savePreset = useCallback(async (name: string, filters: AppliedFilters) => {
    try {
      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: `Preset criado em ${new Date().toLocaleDateString()}`,
          filters,
          sortOptions: filters.sort
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar preset');
      }

      const preset = await response.json();

      if (onPresetSaved) {
        onPresetSaved(preset);
      }

      // Atualizar lista de presets
      setPresets(prev => [...prev, preset]);

      return preset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar preset';
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    }
  }, [onPresetSaved, onError]);

  const applyPreset = useCallback(async (preset: FilterPreset) => {
    const filters: AppliedFilters = {
      conditions: preset.filters?.conditions || [],
      logic: preset.filters?.logic || 'AND',
      sort: preset.sortOptions
    };

    return applyFilters(filters);
  }, [applyFilters]);

  const updatePreset = useCallback(async (presetId: string, updates: Partial<FilterPreset>) => {
    try {
      const response = await fetch(`/api/filters/${presetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar preset');
      }

      const updatedPreset = await response.json();

      // Atualizar preset na lista
      setPresets(prev => prev.map(p =>
        p.id === presetId ? updatedPreset : p
      ));

      return updatedPreset;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar preset';
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    }
  }, [onError]);

  const deletePreset = useCallback(async (presetId: string) => {
    try {
      const response = await fetch(`/api/filters/${presetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir preset');
      }

      // Remover preset da lista
      setPresets(prev => prev.filter(p => p.id !== presetId));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir preset';
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    }
  }, [onError]);

  const loadPresets = useCallback(async () => {
    try {
      const response = await fetch('/api/filters?includePublic=true');
      if (response.ok) {
        const data = await response.json();
        setPresets(data);
        return data;
      }
    } catch (error) {
      console.error('Erro ao carregar presets:', error);
    }
  }, []);

  const exportPresets = useCallback(async () => {
    try {
      const response = await fetch('/api/filters/export');
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filter-presets-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao exportar presets';
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onError]);

  const importPresets = useCallback(async (file: File) => {
    try {
      const content = await file.text();
      const data = JSON.parse(content);

      const response = await fetch('/api/filters/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        await loadPresets(); // Recarregar presets
        return result;
      } else {
        throw new Error('Erro na importação');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar presets';
      if (onError) {
        onError(errorMessage);
      }
      throw error;
    }
  }, [loadPresets, onError]);

  const clearFilters = useCallback(() => {
    setCurrentFilters(null);
    setLastResults(null);
  }, []);

  return {
    // Estado
    currentFilters,
    isApplying,
    lastResults,
    presets,

    // Ações
    applyFilters,
    savePreset,
    applyPreset,
    updatePreset,
    deletePreset,
    loadPresets,
    exportPresets,
    importPresets,
    clearFilters,

    // Utilitários
    hasActiveFilters: currentFilters && currentFilters.conditions.length > 0,
    hasResults: lastResults && lastResults.videos && lastResults.videos.length > 0
  };
}

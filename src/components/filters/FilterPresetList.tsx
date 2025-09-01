'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Play, Star, StarOff, Download, Upload } from 'lucide-react';
import { FilterPreset } from '@/lib/services/advancedFilters';

interface FilterPresetListProps {
  collectionId: string;
  onApplyPreset: (preset: FilterPreset) => void;
  onEditPreset: (preset: FilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
  onToggleDefault: (presetId: string) => void;
}

export default function FilterPresetList({
  collectionId,
  onApplyPreset,
  onEditPreset,
  onDeletePreset,
  onToggleDefault
}: FilterPresetListProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    loadPresets();
  }, [collectionId]);

  const loadPresets = async () => {
    try {
      const response = await fetch(`/api/filters?includePublic=true`);
      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (error) {
      console.error('Erro ao carregar presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = async (preset: FilterPreset) => {
    try {
      const response = await fetch('/api/filters/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presetId: preset.id,
          collectionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onApplyPreset(preset);
        // Aqui você pode emitir um evento ou callback para atualizar a lista de vídeos
      }
    } catch (error) {
      console.error('Erro ao aplicar preset:', error);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('Tem certeza que deseja excluir este preset?')) return;

    try {
      const response = await fetch(`/api/filters/${presetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPresets(presets.filter(p => p.id !== presetId));
        onDeletePreset(presetId);
      }
    } catch (error) {
      console.error('Erro ao excluir preset:', error);
    }
  };

  const handleToggleDefault = async (presetId: string) => {
    try {
      const preset = presets.find(p => p.id === presetId);
      if (!preset) return;

      const response = await fetch(`/api/filters/${presetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...preset,
          isDefault: !preset.isDefault
        }),
      });

      if (response.ok) {
        const updatedPreset = await response.json();
        setPresets(presets.map(p =>
          p.id === presetId ? updatedPreset : { ...p, isDefault: false }
        ));
        onToggleDefault(presetId);
      }
    } catch (error) {
      console.error('Erro ao alterar preset padrão:', error);
    }
  };

  const handleExportPresets = async () => {
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
      console.error('Erro ao exportar presets:', error);
    }
  };

  const handleImportPresets = async () => {
    if (!importFile) return;

    try {
      const content = await importFile.text();
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
        setShowImportDialog(false);
        setImportFile(null);
        loadPresets(); // Recarregar presets
        alert(`Importação concluída: ${result.results.length} presets processados`);
      }
    } catch (error) {
      console.error('Erro ao importar presets:', error);
      alert('Erro ao importar presets. Verifique o formato do arquivo.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Presets de Filtros</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExportPresets}
            className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum preset encontrado.</p>
          <p className="text-sm">Crie filtros avançados e salve-os como presets para reutilização.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className={`border rounded-lg p-4 ${
                preset.isDefault ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{preset.name}</h4>
                    {preset.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {preset.isPublic && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Público
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {preset.description || 'Sem descrição'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{Array.isArray(preset.filters?.conditions) ? preset.filters.conditions.length : 0} condição(ões)</span>
                    <span>Usado {preset.usageCount} vez(es)</span>
                    <span>Última uso: {new Date(preset.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Aplicar preset"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditPreset(preset)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar preset"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleDefault(preset.id)}
                    className={`p-2 rounded-md transition-colors ${
                      preset.isDefault
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={preset.isDefault ? 'Remover como padrão' : 'Definir como padrão'}
                  >
                    {preset.isDefault ? (
                      <StarOff className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Excluir preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog para importar presets */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Importar Presets de Filtros</h3>
            <div className="mb-4">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Selecione um arquivo JSON exportado anteriormente.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportFile(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportPresets}
                disabled={!importFile}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

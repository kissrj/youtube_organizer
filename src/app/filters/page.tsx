'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBuilder from '@/components/filters/FilterBuilder';
import FilterPresetList from '@/components/filters/FilterPresetList';
import { FilterOptions, FilterPreset } from '@/lib/services/advancedFilters';

export default function AdvancedFiltersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collectionId') || '';

  const [activeTab, setActiveTab] = useState<'builder' | 'presets'>('builder');
  const [currentFilters, setCurrentFilters] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = async (filters: FilterOptions) => {
    setCurrentFilters(filters);
    setIsLoading(true);

    try {
      // Aqui você pode redirecionar para a página de vídeos com os filtros aplicados
      // ou atualizar uma lista de vídeos na mesma página
      const params = new URLSearchParams();
      params.set('collectionId', collectionId);
      params.set('filters', JSON.stringify(filters));

      router.push(`/videos?${params.toString()}`);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async (name: string, filters: FilterOptions) => {
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

      if (response.ok) {
        alert('Preset salvo com sucesso!');
        // Recarregar a lista de presets
        window.location.reload();
      } else {
        throw new Error('Erro ao salvar preset');
      }
    } catch (error) {
      console.error('Erro ao salvar preset:', error);
      alert('Erro ao salvar preset');
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    // Aplicar o preset diretamente
    const filters: FilterOptions = {
      conditions: preset.filters?.conditions || [],
      logic: preset.filters?.logic || 'AND',
      sort: preset.sortOptions
    };
    handleApplyFilters(filters);
  };

  const handleEditPreset = (preset: FilterPreset) => {
    // Abrir o builder com os filtros do preset
    setActiveTab('builder');
    setCurrentFilters({
      conditions: preset.filters?.conditions || [],
      logic: preset.filters?.logic || 'AND',
      sort: preset.sortOptions
    });
  };

  const handleDeletePreset = (presetId: string) => {
    // A ação de deletar já é tratada no componente FilterPresetList
    // Aqui você pode adicionar lógica adicional se necessário
  };

  const handleToggleDefault = (presetId: string) => {
    // A ação de toggle já é tratada no componente FilterPresetList
    // Aqui você pode adicionar lógica adicional se necessário
  };

  if (!collectionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Filtros Avançados
          </h1>
          <p className="text-gray-600 mb-6">
            Selecione uma coleção para começar a usar os filtros avançados.
          </p>
          <button
            onClick={() => router.push('/collections')}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Ver Coleções
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Filtros Avançados
          </h1>
          <p className="text-gray-600">
            Crie filtros complexos para encontrar exatamente os vídeos que você procura.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('builder')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'builder'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Construtor de Filtros
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'presets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Presets Salvos
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'builder' && (
            <FilterBuilder
              collectionId={collectionId}
              onApplyFilters={handleApplyFilters}
              onSavePreset={handleSavePreset}
              initialFilters={currentFilters || undefined}
            />
          )}

          {activeTab === 'presets' && (
            <FilterPresetList
              collectionId={collectionId}
              onApplyPreset={handleApplyPreset}
              onEditPreset={handleEditPreset}
              onDeletePreset={handleDeletePreset}
              onToggleDefault={handleToggleDefault}
            />
          )}
        </div>

        {/* Filtros Atuais */}
        {currentFilters && currentFilters.conditions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Filtros Atuais Aplicados</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {currentFilters.conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {condition.field} {condition.operator} "{condition.value}"
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Lógica: {currentFilters.logic}
                {currentFilters.sort && (
                  <span className="ml-4">
                    Ordenação: {currentFilters.sort.field} ({currentFilters.sort.direction})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span>Aplicando filtros...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

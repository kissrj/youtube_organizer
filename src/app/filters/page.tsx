'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterBuilder from '@/components/filters/FilterBuilder';
import FilterPresetList from '@/components/filters/FilterPresetList';
import { FilterOptions, FilterPreset } from '@/lib/services/advancedFilters';

export default function AdvancedFiltersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notebookId = searchParams.get('notebookId') || '';

  const [activeTab, setActiveTab] = useState<'builder' | 'presets'>('builder');
  const [currentFilters, setCurrentFilters] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = async (filters: FilterOptions) => {
    setCurrentFilters(filters);
    setIsLoading(true);

    try {
      // Here you can redirect to the videos page with the applied filters
      // or update a video list on the same page
      const params = new URLSearchParams();
      params.set('notebookId', notebookId);
      params.set('filters', JSON.stringify(filters));

      router.push(`/videos?${params.toString()}`);
    } catch (error) {
      console.error('Error applying filters:', error);
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
          description: `Preset created on ${new Date().toLocaleDateString()}`,
          filters,
          sortOptions: filters.sort
        }),
      });

      if (response.ok) {
        alert('Preset saved successfully!');
        // Reload the presets list
        window.location.reload();
      } else {
        throw new Error('Error saving preset');
      }
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Error saving preset');
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
    // Open the builder with the preset filters
    setActiveTab('builder');
    setCurrentFilters({
      conditions: preset.filters?.conditions || [],
      logic: preset.filters?.logic || 'AND',
      sort: preset.sortOptions
    });
  };

  const handleDeletePreset = (presetId: string) => {
    // The delete action is already handled in the FilterPresetList component
    // Here you can add additional logic if necessary
  };

  const handleToggleDefault = (presetId: string) => {
    // The toggle action is already handled in the FilterPresetList component
    // Here you can add additional logic if necessary
  };

  if (!notebookId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Advanced Filters
          </h1>
          <p className="text-gray-600 mb-6">
            Select a notebook to start using advanced filters.
          </p>
          <button
            onClick={() => router.push('/notebooks')}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View Notebooks
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
            Advanced Filters
          </h1>
          <p className="text-gray-600">
            Create complex filters to find exactly the videos you're looking for.
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
                Filter Builder
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'presets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved Presets
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'builder' && (
            <FilterBuilder
              notebookId={notebookId}
              onApplyFilters={handleApplyFilters}
              onSavePreset={handleSavePreset}
              initialFilters={currentFilters || undefined}
            />
          )}

          {activeTab === 'presets' && (
            <FilterPresetList
              notebookId={notebookId}
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
            <h3 className="text-lg font-semibold mb-4">Currently Applied Filters</h3>
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
                Logic: {currentFilters.logic}
                {currentFilters.sort && (
                  <span className="ml-4">
                    Sort: {currentFilters.sort.field} ({currentFilters.sort.direction})
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
              <span>Applying filters...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Filter, Save, Play } from 'lucide-react';
import { FilterCondition, FilterOptions } from '@/lib/services/advancedFilters';

interface FilterBuilderProps {
  notebookId: string;
  onApplyFilters: (filters: FilterOptions) => void;
  onSavePreset?: (name: string, filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

interface FilterConditionUI extends FilterCondition {
  id: string;
}

const FIELD_OPTIONS = [
  { value: 'title', label: 'Título', type: 'string' },
  { value: 'description', label: 'Descrição', type: 'string' },
  { value: 'duration', label: 'Duração (segundos)', type: 'number' },
  { value: 'viewCount', label: 'Visualizações', type: 'number' },
  { value: 'likeCount', label: 'Curtidas', type: 'number' },
  { value: 'commentCount', label: 'Comentários', type: 'number' },
  { value: 'publishedAt', label: 'Data de publicação', type: 'date' },
  { value: 'channelId', label: 'Canal', type: 'select' },
  { value: 'tags', label: 'Tags', type: 'multiselect' },
  { value: 'category', label: 'Categoria', type: 'select' }
];

const STRING_OPERATORS = [
  { value: 'contains', label: 'Contém' },
  { value: 'notContains', label: 'Não contém' },
  { value: 'equals', label: 'Igual a' },
  { value: 'notEquals', label: 'Diferente de' },
  { value: 'startsWith', label: 'Começa com' },
  { value: 'endsWith', label: 'Termina com' }
];

const NUMBER_OPERATORS = [
  { value: 'gt', label: 'Maior que' },
  { value: 'gte', label: 'Maior ou igual' },
  { value: 'lt', label: 'Menor que' },
  { value: 'lte', label: 'Menor ou igual' },
  { value: 'equals', label: 'Igual a' },
  { value: 'notEquals', label: 'Diferente de' }
];

const DATE_OPERATORS = [
  { value: 'after', label: 'Depois de' },
  { value: 'before', label: 'Antes de' },
  { value: 'equals', label: 'Igual a' },
  { value: 'notEquals', label: 'Diferente de' }
];

const SELECT_OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'notEquals', label: 'Diferente de' },
  { value: 'in', label: 'Está em' },
  { value: 'notIn', label: 'Não está em' }
];

const MULTISELECT_OPERATORS = [
  { value: 'has', label: 'Possui' },
  { value: 'notHas', label: 'Não possui' },
  { value: 'in', label: 'Contém' },
  { value: 'notIn', label: 'Não contém' }
];

export default function FilterBuilder({
  notebookId,
  onApplyFilters,
  onSavePreset,
  initialFilters
}: FilterBuilderProps) {
  const [conditions, setConditions] = useState<FilterConditionUI[]>([]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [metadata, setMetadata] = useState<{
    channels: Array<{ value: string; label: string; thumbnail?: string }>;
    tags: Array<{ value: string; label: string; color?: string }>;
  }>({ channels: [], tags: [] });

  useEffect(() => {
    if (initialFilters) {
      setConditions(initialFilters.conditions.map((c, i) => ({ ...c, id: `condition-${i}` })));
      setLogic(initialFilters.logic || 'AND');
      setSortField(initialFilters.sort?.field || '');
      setSortDirection(initialFilters.sort?.direction || 'desc');
    }
  }, [initialFilters]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const response = await fetch('/api/filters/metadata');
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      }
    } catch (error) {
      console.error('Erro ao carregar metadados:', error);
    }
  };

  const addCondition = () => {
    const newCondition: FilterConditionUI = {
      id: `condition-${Date.now()}`,
      field: 'title',
      operator: 'contains',
      value: '',
      logic: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterConditionUI>) => {
    setConditions(conditions.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const getOperatorsForField = (field: string) => {
    const fieldOption = FIELD_OPTIONS.find(f => f.value === field);
    if (!fieldOption) return STRING_OPERATORS;

    switch (fieldOption.type) {
      case 'string':
        return STRING_OPERATORS;
      case 'number':
        return NUMBER_OPERATORS;
      case 'date':
        return DATE_OPERATORS;
      case 'select':
        return SELECT_OPERATORS;
      case 'multiselect':
        return MULTISELECT_OPERATORS;
      default:
        return STRING_OPERATORS;
    }
  };

  const renderValueInput = (condition: FilterConditionUI) => {
    const fieldOption = FIELD_OPTIONS.find(f => f.value === condition.field);

    switch (fieldOption?.type) {
      case 'number':
        return (
          <input
            type="number"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: parseFloat(e.target.value) || 0 })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite um número"
          />
        );

      case 'date':
        return (
          <input
            type="datetime-local"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        if (condition.field === 'channelId') {
          return (
            <select
              value={condition.value || ''}
              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um canal</option>
              {metadata.channels.map(channel => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
          );
        } else if (condition.field === 'category') {
          return (
            <select
              value={condition.value || ''}
              onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {/* Adicionar opções de categoria aqui */}
            </select>
          );
        }
        break;

      case 'multiselect':
        if (condition.field === 'tags') {
          return (
            <select
              multiple
              value={Array.isArray(condition.value) ? condition.value : []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateCondition(condition.id, { value: values });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {metadata.tags.map(tag => (
                <option key={tag.value} value={tag.value}>
                  {tag.label}
                </option>
              ))}
            </select>
          );
        }
        break;

      default:
        return (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite um valor"
          />
        );
    }
  };

  const handleApplyFilters = async () => {
    if (conditions.length === 0) return;

    setIsLoading(true);
    try {
      const filters: FilterOptions = {
        conditions: conditions.map(({ id, ...c }) => c),
        logic,
        sort: sortField ? { field: sortField, direction: sortDirection } : undefined
      };

      await onApplyFilters(filters);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || conditions.length === 0) return;

    const filters: FilterOptions = {
      conditions: conditions.map(({ id, ...c }) => c),
      logic,
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined
    };

    if (onSavePreset) {
      await onSavePreset(presetName, filters);
      setShowSaveDialog(false);
      setPresetName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Advanced Filter Builder
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={addCondition}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </button>
        </div>
      </div>

      {/* Global Logic */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Logic between conditions:</label>
        <select
          value={logic}
          onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="AND">AND (all conditions must be true)</option>
          <option value="OR">OR (at least one condition must be true)</option>
        </select>
      </div>

      {/* Conditions */}
      <div className="space-y-4 mb-6">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>

            <select
              value={condition.field}
              onChange={(e) => updateCondition(condition.id, {
                field: e.target.value,
                operator: getOperatorsForField(e.target.value)[0].value,
                value: ''
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FIELD_OPTIONS.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getOperatorsForField(condition.field).map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {renderValueInput(condition)}

            <button
              onClick={() => removeCondition(condition.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sorting */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
        <div className="flex space-x-4">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No sorting</option>
            <option value="title">Title</option>
            <option value="publishedAt">Published date</option>
            <option value="viewCount">Views</option>
            <option value="likeCount">Likes</option>
            <option value="duration">Duration</option>
          </select>

          {sortField && (
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleApplyFilters}
            disabled={conditions.length === 0 || isLoading}
            className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </button>

          {onSavePreset && (
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={conditions.length === 0}
              className="flex items-center px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {conditions.length} condition(s)
        </div>
      </div>

      {/* Save preset dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

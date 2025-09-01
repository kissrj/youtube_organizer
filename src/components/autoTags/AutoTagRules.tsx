'use client';

import { useState, useEffect } from 'react';
import { AutoTagRule } from '@/lib/types';

interface AutoTagRulesProps {
  onRuleSelect?: (rule: AutoTagRule) => void;
}

export function AutoTagRules({ onRuleSelect }: AutoTagRulesProps) {
  const [rules, setRules] = useState<AutoTagRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoTagRule | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    titlePattern: '',
    descriptionPattern: '',
    category: '',
    keywords: '',
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await fetch('/api/auto-tags/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/auto-tags/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          keywords: newRule.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
        })
      });

      if (response.ok) {
        const createdRule = await response.json();
        setRules([...rules, createdRule]);
        setIsCreateDialogOpen(false);
        setNewRule({
          name: '',
          description: '',
          titlePattern: '',
          descriptionPattern: '',
          category: '',
          keywords: '',
          isActive: true,
          priority: 1
        });
      }
    } catch (error) {
      console.error('Erro ao criar regra:', error);
    }
  };

  const handleUpdateRule = async (id: string) => {
    try {
      const response = await fetch(`/api/auto-tags/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingRule,
          keywords: editingRule?.keywords && Array.isArray(editingRule.keywords) 
            ? editingRule.keywords 
            : e.target.value.split(',').map((k: string) => k.trim()).filter((k: string) => k) || []
        })
      });

      if (response.ok) {
        const updatedRule = await response.json();
        setRules(rules.map(rule => rule.id === id ? updatedRule : rule));
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/auto-tags/rules/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRules(rules.filter(rule => rule.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir regra:', error);
    }
  };

  if (loading) {
    return <div>Carregando regras...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Regras de Tags Automáticas</h2>
          <p className="text-muted-foreground">Configure regras para sugerir tags automaticamente</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nova Regra
        </button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{rule.name}</h3>
                {!rule.isActive && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">Inativa</span>
                )}
                <span className="border px-2 py-1 rounded text-sm">Prioridade: {rule.priority}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onRuleSelect?.(rule)}
                  className="border px-3 py-1 rounded hover:bg-gray-50"
                >
                  Configurar
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="border px-3 py-1 rounded hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="border px-3 py-1 rounded hover:bg-red-50 text-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
            {rule.description && (
              <p className="text-gray-600 mb-3">{rule.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Padrão de Título:</span>
                <p className="text-gray-600">{rule.titlePattern || 'Nenhum'}</p>
              </div>
              <div>
                <span className="font-medium">Padrão de Descrição:</span>
                <p className="text-gray-600">{rule.descriptionPattern || 'Nenhum'}</p>
              </div>
              <div>
                <span className="font-medium">Categoria:</span>
                <p className="text-gray-600">{rule.category || 'Nenhuma'}</p>
              </div>
              <div>
                <span className="font-medium">Palavras-chave:</span>
                <p className="text-gray-600">
                  {rule.keywords?.join(', ') || 'Nenhuma'}
                </p>
              </div>
            </div>
            {rule.tags && rule.tags.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-sm">Tags Associadas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rule.tags.map((tag) => (
                    <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog de Criação */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Criar Nova Regra</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Regra</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Nome da regra"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Descrição opcional"
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Padrão de Título</label>
                  <input
                    type="text"
                    value={newRule.titlePattern}
                    onChange={(e) => setNewRule({ ...newRule, titlePattern: e.target.value })}
                    placeholder="Ex: tutorial.*programação"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Padrão de Descrição</label>
                  <input
                    type="text"
                    value={newRule.descriptionPattern}
                    onChange={(e) => setNewRule({ ...newRule, descriptionPattern: e.target.value })}
                    placeholder="Ex: aprenda.*desenvolver"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <input
                    type="text"
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    placeholder="Ex: tecnologia"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select
                    value={newRule.priority.toString()}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="1">1 - Baixa</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 - Média</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10 - Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  placeholder="Ex: programação, coding, software"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newRule.isActive}
                  onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Ativa
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsCreateDialogOpen(false)}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRule}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Criar Regra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Edição */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Editar Regra</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Regra</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Padrão de Título</label>
                  <input
                    type="text"
                    value={editingRule.titlePattern || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, titlePattern: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Padrão de Descrição</label>
                  <input
                    type="text"
                    value={editingRule.descriptionPattern || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, descriptionPattern: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <input
                    type="text"
                    value={editingRule.category || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select
                    value={editingRule.priority.toString()}
                    onChange={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="1">1 - Baixa</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 - Média</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10 - Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
                <input
                  type="text"
                  value={editingRule.keywords?.join(', ') || ''}
                  onChange={(e) => setEditingRule({
                    ...editingRule,
                    keywords: e.target.value.split(',').map((k: string) => k.trim()).filter((k: string) => k)
                  })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingRule.isActive}
                  onChange={(e) => setEditingRule({ ...editingRule, isActive: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Ativa
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateRule(editingRule.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
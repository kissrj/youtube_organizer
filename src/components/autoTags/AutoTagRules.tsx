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
      console.error('Error loading rules:', error);
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
      console.error('Error creating rule:', error);
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
            : []
        })
      });

      if (response.ok) {
        const updatedRule = await response.json();
        setRules(rules.map(rule => rule.id === id ? updatedRule : rule));
        setEditingRule(null);
      }
    } catch (error) {
      console.error('Error updating rule:', error);
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
      console.error('Error deleting rule:', error);
    }
  };

  if (loading) {
    return <div>Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Auto Tag Rules</h2>
          <p className="text-muted-foreground">Configure rules to suggest tags automatically</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Rule
        </button>
      </div>

      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{rule.name}</h3>
                {!rule.isActive && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">Inactive</span>
                )}
                <span className="border px-2 py-1 rounded text-sm">Priority: {rule.priority}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onRuleSelect?.(rule)}
                  className="border px-3 py-1 rounded hover:bg-gray-50"
                >
                  Configure
                </button>
                <button
                  onClick={() => setEditingRule(rule)}
                  className="border px-3 py-1 rounded hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="border px-3 py-1 rounded hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            {rule.description && (
              <p className="text-gray-600 mb-3">{rule.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Title Pattern:</span>
                <p className="text-gray-600">{rule.titlePattern || 'None'}</p>
              </div>
              <div>
                <span className="font-medium">Description Pattern:</span>
                <p className="text-gray-600">{rule.descriptionPattern || 'None'}</p>
              </div>
              <div>
                <span className="font-medium">Category:</span>
                <p className="text-gray-600">{rule.category || 'None'}</p>
              </div>
              <div>
                <span className="font-medium">Keywords:</span>
                <p className="text-gray-600">
                  {rule.keywords?.join(', ') || 'None'}
                </p>
              </div>
            </div>
            {rule.tags && rule.tags.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-sm">Associated Tags:</span>
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

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Rule name"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title Pattern</label>
                  <input
                    type="text"
                    value={newRule.titlePattern}
                    onChange={(e) => setNewRule({ ...newRule, titlePattern: e.target.value })}
                    placeholder="Ex: tutorial.*programming"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description Pattern</label>
                  <input
                    type="text"
                    value={newRule.descriptionPattern}
                    onChange={(e) => setNewRule({ ...newRule, descriptionPattern: e.target.value })}
                    placeholder="Ex: learn.*develop"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                    placeholder="Ex: technology"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={newRule.priority.toString()}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="1">1 - Low</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 - Medium</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10 - High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  placeholder="Ex: programming, coding, software"
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
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsCreateDialogOpen(false)}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title Pattern</label>
                  <input
                    type="text"
                    value={editingRule.titlePattern || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, titlePattern: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description Pattern</label>
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
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={editingRule.category || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={editingRule.priority.toString()}
                    onChange={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="1">1 - Low</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 - Medium</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10 - High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Keywords (comma separated)</label>
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
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRule(editingRule.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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

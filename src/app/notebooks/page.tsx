'use client'

import React, { useState, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { NotebookCard } from '@/components/notebooks/NotebookCard'
import { AddNotebookDialog } from '@/components/notebooks/AddNotebookDialog'
import { NotebookSettingsWithIcons } from '@/components/notebooks/NotebookSettingsWithIcons'
import { Notebook } from '@/lib/types'
import { Plus, Settings, Sparkles } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useNotebooks } from '@/hooks/useNotebooks'

export default function NotebooksPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Notebook | null>(null)

  const {
    notebooks,
    loading,
    error,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  } = useNotebooks()

  const confirmDelete = useCallback((notebook: Notebook) => {
    setToDelete(notebook)
    setConfirmOpen(true)
  }, [])

  const handleDeleteConfirmed = useCallback(async () => {
    if (!toDelete) return
    try {
      await deleteNotebook(toDelete.id)
      setToDelete(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [toDelete, deleteNotebook])

  const handleIconChange = useCallback(async (icon: string) => {
    if (!selectedNotebook) return
    await updateNotebook(selectedNotebook.id, { icon })
  }, [selectedNotebook, updateNotebook])

  const handleColorChange = useCallback(async (color: string) => {
    if (!selectedNotebook) return
    await updateNotebook(selectedNotebook.id, { color })
  }, [selectedNotebook, updateNotebook])

  const handleSettingsUpdate = useCallback(async (settings: any) => {
    if (!selectedNotebook) return
    // Here the settings update would be implemented
    console.log('Updating settings:', settings)
  }, [selectedNotebook])

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8 animate-fade-in">
              {/* Header Skeleton */}
              <header className="flex justify-between items-center">
                <div className="space-y-3">
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 animate-pulse"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-96 animate-pulse"></div>
                </div>
                <div className="h-12 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-36 animate-pulse"></div>
              </header>

              {/* Default Notebooks Skeleton */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded animate-pulse"></div>
                  <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
                      style={{
                        animationDelay: `${i * 50}ms`,
                        animationDuration: '1.5s'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                        <div className="w-16 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-3 mb-4">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="w-16 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                        <div className="w-12 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <header className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl -mx-4 -my-2"></div>
              <div className="relative flex justify-between items-center p-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent" id="notebooks-heading">
                    Notebooks
                  </h1>
                  <p className="text-gray-600 text-lg" id="notebooks-description">
                    Organize your videos, channels and playlists with beautiful, themed notebooks
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {notebooks.length} notebooks available
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      {notebooks.filter(nb => nb.isDefault).length} default
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      {notebooks.filter(nb => !nb.isDefault).length} custom
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Create new notebook"
                  aria-describedby="notebooks-description"
                >
                  <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" aria-hidden="true" />
                  <span className="font-medium">New Notebook</span>
                </button>
              </div>
            </header>

            {/* Notebooks Grid */}
            <main className="space-y-12" role="main" aria-labelledby="notebooks-heading">
              {/* Default Notebooks Section */}
              <section aria-labelledby="default-notebooks-heading" className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="default-notebooks-heading" className="text-2xl font-bold text-gray-900">
                        Default Notebooks
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">Pre-built notebooks for common use cases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-gradient-to-r from-purple-100 to-purple-200 px-3 py-1 rounded-full font-medium">
                      {notebooks.filter(nb => nb.isDefault).length} available
                    </span>
                  </div>
                </div>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                  role="grid"
                  aria-label="Default notebooks grid"
                >
                  {notebooks
                    .filter(notebook => notebook.isDefault)
                    .map((defaultNotebook, index) => (
                      <div
                        key={defaultNotebook.id}
                        role="gridcell"
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <NotebookCard
                          notebook={defaultNotebook}
                          isSelected={selectedNotebook?.id === defaultNotebook.id}
                          onClick={() => setSelectedNotebook(defaultNotebook)}
                          onIconChange={handleIconChange}
                          onColorChange={handleColorChange}
                          onEdit={() => {
                            setSelectedNotebook(defaultNotebook)
                            setShowSettings(true)
                          }}
                          onFeeds={() => {
                            window.location.href = `/notebooks/${defaultNotebook.id}/feeds`
                          }}
                          onDelete={() => confirmDelete(defaultNotebook)}
                        />
                      </div>
                    ))}

                  {/* Create New Card */}
                  <div
                    role="gridcell"
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${notebooks.filter(nb => nb.isDefault).length * 100}ms` }}
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer group" onClick={() => setShowAddDialog(true)}>
                      <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Create New</h3>
                          <p className="text-sm text-gray-600">Start a new notebook for your content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Notebooks Section */}
              {notebooks.filter(nb => !nb.isDefault).length > 0 && (
                <section aria-labelledby="user-notebooks-heading" className="animate-slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 id="user-notebooks-heading" className="text-2xl font-bold text-gray-900">
                          Your Custom Notebooks
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Notebooks you've created</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1 rounded-full font-medium">
                        {notebooks.filter(nb => !nb.isDefault).length} created
                      </span>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    role="grid"
                    aria-label="User notebooks grid"
                  >
                    {notebooks
                      .filter(notebook => !notebook.isDefault)
                      .map((notebook, index) => (
                        <div
                          key={notebook.id}
                          role="gridcell"
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <NotebookCard
                            notebook={notebook}
                            isSelected={selectedNotebook?.id === notebook.id}
                            onClick={() => setSelectedNotebook(notebook)}
                            onIconChange={handleIconChange}
                            onColorChange={handleColorChange}
                            onEdit={() => {
                              setSelectedNotebook(notebook)
                              setShowSettings(true)
                            }}
                            onFeeds={() => {
                              window.location.href = `/notebooks/${notebook.id}/feeds`
                            }}
                            onDelete={() => confirmDelete(notebook)}
                          />
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <AddNotebookDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={createNotebook}
      />

      {/* Settings Panel */}
      {showSettings && selectedNotebook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Settings - {selectedNotebook.name}</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <NotebookSettingsWithIcons
                notebook={selectedNotebook}
                onUpdate={handleSettingsUpdate}
                onUpdateIcon={handleIconChange}
                onUpdateColor={handleColorChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete notebook"
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirmed}
        onClose={() => setConfirmOpen(false)}
      />
  </AuthGuard>
  )
}
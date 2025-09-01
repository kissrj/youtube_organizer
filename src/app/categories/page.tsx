'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'

interface Category {
  id: string
  name: string
  description: string
  color: string
  playlists: Array<{
    playlist: {
      id: string
      title: string
      thumbnailUrl: string
      itemCount: number
    }
  }>
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', description: '', color: '#3b82f6' })
        setShowForm(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {showForm ? 'Cancelar' : 'Nova Categoria'}
        </button>
      </div>

      {/* Formulário para criar categoria */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Criar Nova Categoria
          </h2>
          <form onSubmit={createCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Criar Categoria
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div
              className="h-16 flex items-center justify-center"
              style={{ backgroundColor: category.color }}
            >
              <h3 className="text-white font-semibold text-lg">
                {category.name}
              </h3>
            </div>

            <div className="p-4">
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {category.playlists.length} playlist{category.playlists.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Playlists nesta categoria */}
              {category.playlists.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Playlists:</h4>
                  <div className="space-y-1">
                    {category.playlists.slice(0, 3).map((pc) => (
                      <div key={pc.playlist.id} className="flex items-center space-x-2">
                        {pc.playlist.thumbnailUrl && (
                          <img
                            src={pc.playlist.thumbnailUrl}
                            alt={pc.playlist.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-700 truncate">
                          {pc.playlist.title}
                        </span>
                      </div>
                    ))}
                    {category.playlists.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{category.playlists.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma categoria encontrada. Crie sua primeira categoria para começar a organizar suas playlists.
          </p>
        </div>
      )}
      </div>
    </AuthGuard>
  )
}
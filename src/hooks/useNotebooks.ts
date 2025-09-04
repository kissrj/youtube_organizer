import { useState, useEffect, useCallback, useMemo } from 'react'
import { Notebook } from '@/lib/types'
import { defaultNotebooks, DefaultNotebook } from '@/lib/data/default-notebooks'
import { useToast } from '@/components/ui/ToastProvider'

interface UseNotebooksReturn {
  notebooks: Notebook[]
  loading: boolean
  error: string | null
  defaultNotebookCounts: Record<string, number>
  refreshNotebooks: () => Promise<void>
  createNotebook: (data: any) => Promise<void>
  updateNotebook: (id: string, data: any) => Promise<void>
  deleteNotebook: (id: string) => Promise<void>
  createDefaultNotebook: (defaultNotebook: DefaultNotebook) => Promise<void>
}

export function useNotebooks(): UseNotebooksReturn {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [defaultNotebookCounts, setDefaultNotebookCounts] = useState<Record<string, number>>({})
  const { toast } = useToast()

  // Memoized API calls to prevent unnecessary re-renders
  const apiCalls = useMemo(() => ({
    fetchNotebooks: async (): Promise<{ notebooks: Notebook[], total: number }> => {
      const response = await fetch('/api/notebooks')
      if (!response.ok) {
        throw new Error('Failed to fetch notebooks')
      }
      const data = await response.json()
      return data.data || { notebooks: [], total: 0 }
    },

    createNotebook: async (data: any): Promise<Notebook> => {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to create notebook')
      }
      const result = await response.json()
      return result.data
    },

    updateNotebook: async (id: string, data: any): Promise<Notebook> => {
      const response = await fetch(`/api/notebooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to update notebook')
      }
      const result = await response.json()
      return result.data
    },

    deleteNotebook: async (id: string): Promise<void> => {
      const response = await fetch(`/api/notebooks/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to delete notebook')
      }
    },
  }), [])

  // Calculate default notebook counts
  const calculateDefaultCounts = useCallback((userNotebooks: Notebook[]): Record<string, number> => {
    const counts: Record<string, number> = {}
    defaultNotebooks.forEach(defaultNb => {
      const userNotebook = userNotebooks.find((nb: Notebook) => nb.name === defaultNb.name)
      counts[defaultNb.id] = userNotebook ? (userNotebook._count?.videos || 0) : 0
    })
    return counts
  }, [])

  // Load notebooks with error handling
  const loadNotebooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { notebooks: userNotebooks } = await apiCalls.fetchNotebooks()
      const counts = calculateDefaultCounts(userNotebooks)

      setNotebooks(userNotebooks)
      setDefaultNotebookCounts(counts)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notebooks'
      setError(errorMessage)
      console.error('Error loading notebooks:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCalls, calculateDefaultCounts])

  // Refresh notebooks
  const refreshNotebooks = useCallback(async () => {
    await loadNotebooks()
  }, [loadNotebooks])

  // Create notebook
  const createNotebookHandler = useCallback(async (data: any) => {
    try {
      const newNotebook = await apiCalls.createNotebook(data)
      toast({
        title: 'Notebook created',
        description: `"${newNotebook.name}" added successfully`,
        variant: 'success',
      })
      await loadNotebooks()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notebook'
      toast({ title: 'Failed to create notebook', description: errorMessage, variant: 'error' })
      throw err
    }
  }, [apiCalls, loadNotebooks, toast])

  // Update notebook
  const updateNotebookHandler = useCallback(async (id: string, data: any) => {
    try {
      await apiCalls.updateNotebook(id, data)
      toast({ title: 'Notebook updated', variant: 'success' })
      await loadNotebooks()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notebook'
      toast({ title: 'Update failed', description: errorMessage, variant: 'error' })
      throw err
    }
  }, [apiCalls, loadNotebooks, toast])

  // Delete notebook
  const deleteNotebookHandler = useCallback(async (id: string) => {
    try {
      await apiCalls.deleteNotebook(id)
      toast({
        title: 'Notebook deleted',
        description: 'Notebook was removed successfully',
        variant: 'success',
      })
      await loadNotebooks()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notebook'
      toast({ title: 'Delete failed', description: errorMessage, variant: 'error' })
      throw err
    }
  }, [apiCalls, loadNotebooks, toast])

  // Create default notebook
  const createDefaultNotebookHandler = useCallback(async (defaultNotebook: DefaultNotebook) => {
    try {
      const data = {
        name: defaultNotebook.name,
        description: defaultNotebook.description,
        icon: defaultNotebook.icon,
        color: defaultNotebook.color,
        isPublic: false,
      }

      const newNotebook = await apiCalls.createNotebook(data)
      toast({
        title: 'Default notebook created',
        description: `"${defaultNotebook.name}" is now ready to use`,
        variant: 'success',
      })
      await loadNotebooks()
      // Navigate to the newly created notebook
      window.location.href = `/notebooks/${newNotebook.id}`
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notebook'
      toast({ title: 'Failed to create notebook', description: errorMessage, variant: 'error' })
      throw err
    }
  }, [apiCalls, loadNotebooks, toast])

  // Initial load
  useEffect(() => {
    loadNotebooks()
  }, [loadNotebooks])

  return {
    notebooks,
    loading,
    error,
    defaultNotebookCounts,
    refreshNotebooks,
    createNotebook: createNotebookHandler,
    updateNotebook: updateNotebookHandler,
    deleteNotebook: deleteNotebookHandler,
    createDefaultNotebook: createDefaultNotebookHandler,
  }
}
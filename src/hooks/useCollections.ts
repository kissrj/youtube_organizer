// src/hooks/useCollections.ts
import { useState, useEffect } from 'react'
import { CollectionsService } from '@/lib/services/collections'
import { useCollection } from '@/contexts/CollectionContext'
import { Collection } from '@/lib/types'

export function useCollections() {
  const { state, dispatch } = useCollection()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (isMounted) return

    const fetchCollections = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const collections = await CollectionsService.getCollections()
        dispatch({ type: 'SET_COLLECTIONS', payload: collections })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao carregar coleções' })
      }
    }

    fetchCollections()
    setIsMounted(true)
  }, [isMounted, dispatch])

  const createCollection = async (data: any) => {
    try {
      const newCollection = await CollectionsService.createCollection(data)
      dispatch({ type: 'ADD_COLLECTION', payload: newCollection })
      return newCollection
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao criar coleção' })
      throw error
    }
  }

  const updateCollection = async (id: string, data: any) => {
    try {
      const updated = await CollectionsService.updateCollection(id, data)
      dispatch({ type: 'UPDATE_COLLECTION', payload: updated })
      return updated
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao atualizar coleção' })
      throw error
    }
  }

  const deleteCollection = async (id: string) => {
    try {
      await CollectionsService.deleteCollection(id)
      dispatch({ type: 'DELETE_COLLECTION', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao excluir coleção' })
      throw error
    }
  }

  const moveCollection = async (collectionId: string, newParentId: string, newPosition: number) => {
    try {
      const moved = await CollectionsService.moveCollection(collectionId, newParentId, newPosition)
      dispatch({ type: 'MOVE_COLLECTION', payload: { collectionId, newParentId, newPosition } })
      return moved
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao mover coleção' })
      throw error
    }
  }

  const moveItem = async (itemId: string, itemType: string, targetCollectionId: string) => {
    try {
      const moved = await CollectionsService.moveItem(itemId, itemType, targetCollectionId)
      dispatch({ type: 'MOVE_ITEM', payload: { itemId, itemType, targetCollectionId } })
      return moved
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Erro ao mover item' })
      throw error
    }
  }

  return {
    collections: state.collections,
    selectedCollection: state.selectedCollection,
    isLoading: state.isLoading,
    error: state.error,
    createCollection,
    updateCollection,
    deleteCollection,
    moveCollection,
    moveItem,
    setSelectedCollection: (collection: Collection | null) =>
      dispatch({ type: 'SET_SELECTED_COLLECTION', payload: collection })
  }
}

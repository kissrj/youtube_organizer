// src/contexts/CollectionContext.tsx
'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Collection } from '@/lib/types'

interface CollectionState {
  collections: Collection[]
  selectedCollection: Collection | null
  isLoading: boolean
  error: string | null
}

type CollectionAction =
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'SET_SELECTED_COLLECTION'; payload: Collection | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'MOVE_COLLECTION'; payload: { collectionId: string; newParentId: string; newPosition: number } }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; itemType: string; targetCollectionId: string } }

const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null
}

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'SET_COLLECTIONS':
      return { ...state, collections: action.payload, isLoading: false, error: null }
    case 'SET_SELECTED_COLLECTION':
      return { ...state, selectedCollection: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_COLLECTION':
      return { ...state, collections: [...state.collections, action.payload] }
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      }
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(c => c.id !== action.payload),
        selectedCollection: state.selectedCollection?.id === action.payload ? null : state.selectedCollection
      }
    case 'MOVE_COLLECTION':
      // Implementar lógica de mover coleção
      return state
    case 'MOVE_ITEM':
      // Implementar lógica de mover item
      return state
    default:
      return state
  }
}

interface CollectionContextType {
  state: CollectionState
  dispatch: React.Dispatch<CollectionAction>
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collectionReducer, initialState)

  return (
    <CollectionContext.Provider value={{ state, dispatch }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider')
  }
  return context
}

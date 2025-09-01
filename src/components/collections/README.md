# Componentes de Coleções

Este documento descreve os componentes React implementados para o sistema de coleções do YouTube Organizer.

## Visão Geral

Os componentes de coleções fornecem uma interface completa para gerenciar coleções hierárquicas de vídeos, canais e playlists do YouTube.

## Componentes Principais

### 1. CollectionTree
Árvore hierárquica para navegação e gerenciamento de coleções.

```tsx
import { CollectionTree } from '@/components/collections'

<CollectionTree
  collections={collections}
  onCollectionSelect={handleSelect}
  onCollectionCreate={handleCreate}
  onCollectionUpdate={handleUpdate}
  onCollectionDelete={handleDelete}
  selectedCollectionId={selectedId}
  isLoading={loading}
  error={error}
/>
```

### 2. CollectionGrid
Visualização em grade das coleções com cards.

```tsx
import { CollectionGrid } from '@/components/collections'

<CollectionGrid
  collections={collections}
  onCollectionSelect={handleSelect}
  onCreateCollection={handleCreate}
  selectedCollectionId={selectedId}
  isLoading={loading}
  error={error}
/>
```

### 3. CollectionSettings
Painel de configurações para uma coleção específica.

```tsx
import { CollectionSettings } from '@/components/collections'

<CollectionSettings
  collection={selectedCollection}
  onUpdate={handleSettingsUpdate}
  isLoading={loading}
/>
```

## Context e Hooks

### CollectionProvider
Contexto global para gerenciamento de estado das coleções.

```tsx
import { CollectionProvider } from '@/contexts/CollectionContext'

<CollectionProvider>
  <App />
</CollectionProvider>
```

### useCollections
Hook personalizado para operações com coleções.

```tsx
import { useCollections } from '@/hooks/useCollections'

const {
  collections,
  selectedCollection,
  isLoading,
  error,
  createCollection,
  updateCollection,
  deleteCollection,
  setSelectedCollection
} = useCollections()
```

## Serviços

### CollectionsService
Serviço principal para operações CRUD com coleções.

```tsx
import { CollectionsService } from '@/lib/services/collections'

// Criar coleção
const collection = await CollectionsService.createCollection({
  name: 'Minha Coleção',
  description: 'Descrição da coleção',
  userId: 'user123'
})

// Buscar coleções
const collections = await CollectionsService.getCollections({
  userId: 'user123',
  includeChildren: true
})
```

### TagsService
Serviço para gerenciamento de tags.

```tsx
import { TagsService } from '@/lib/services/tags'

// Criar tag
const tag = await TagsService.createTag({
  name: 'Tecnologia',
  color: '#3b82f6'
}, 'user123')
```

### FeedService
Serviço para geração de feeds personalizados.

```tsx
import { FeedService } from '@/lib/services/feed'

// Obter feed de coleção
const feed = await FeedService.getCollectionFeed('collectionId', {
  limit: 20,
  includeWatched: false,
  sortBy: 'publishedAt'
})
```

## Tipos TypeScript

Todos os tipos estão definidos em `@/lib/types.ts`:

- `Collection` - Interface principal da coleção
- `CollectionSettings` - Configurações da coleção
- `CreateCollectionForm` - Formulário de criação
- `CollectionFilters` - Filtros para consultas

## Exemplo de Uso Completo

```tsx
// pages/collections.tsx
import { CollectionProvider, useCollection } from '@/contexts/CollectionContext'
import { useCollections } from '@/hooks/useCollections'
import { CollectionTree, CollectionGrid, CollectionSettings } from '@/components/collections'

function CollectionsPage() {
  const { state } = useCollection()
  const {
    createCollection,
    updateCollection,
    deleteCollection
  } = useCollections()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CollectionGrid
          collections={state.collections}
          onCollectionSelect={(collection) => {
            // Lógica de seleção
          }}
          onCreateCollection={createCollection}
          isLoading={state.isLoading}
          error={state.error}
        />
      </div>

      <div className="lg:col-span-1">
        {state.selectedCollection && (
          <CollectionSettings
            collection={state.selectedCollection}
            onUpdate={(settings) => {
              // Lógica de atualização de configurações
            }}
          />
        )}
      </div>
    </div>
  )
}

export default function Collections() {
  return (
    <CollectionProvider>
      <CollectionsPage />
    </CollectionProvider>
  )
}
```

## Funcionalidades

- ✅ Visualização em árvore hierárquica
- ✅ Visualização em grade com cards
- ✅ Criação e edição de coleções
- ✅ Configurações personalizáveis
- ✅ Estados de carregamento e erro
- ✅ Design responsivo
- ✅ TypeScript completo
- ✅ Context API para estado global
- ✅ Hooks personalizados
- ✅ Serviços modulares

## Próximos Passos

1. Implementar drag and drop para reorganização
2. Adicionar testes unitários
3. Implementar paginação infinita
4. Adicionar filtros avançados
5. Implementar compartilhamento de coleções

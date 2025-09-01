# Especificações das APIs para Coleções

Este documento define todas as rotas API necessárias para o gerenciamento de coleções no YouTube Organizer.

## Estrutura Geral

### Base URL
```
/api/collections
```

### Formato de Resposta Padrão
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

## Rotas Principais

### 1. Gerenciamento de Coleções

#### GET /api/collections
**Descrição**: Listar todas as coleções do usuário (hierarquia plana)
**Parâmetros**:
- `includeChildren` (boolean, opcional): Incluir coleções filhas
- `includeContent` (boolean, opcional): Incluir conteúdo da coleção
- `includeSettings` (boolean, opcional): Incluir configurações
- `parentId` (string, opcional): Filtrar por coleção pai

**Resposta**:
```typescript
interface CollectionListResponse {
  collections: Collection[]
  total: number
  hierarchy?: Collection[]
}
```

#### POST /api/collections
**Descrição**: Criar uma nova coleção
**Body**:
```typescript
interface CreateCollectionRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}
```

**Resposta**:
```typescript
interface CollectionResponse {
  collection: Collection
}
```

#### GET /api/collections/[id]
**Descrição**: Obter detalhes de uma coleção específica
**Parâmetros**:
- `includeChildren` (boolean, opcional): Incluir coleções filhas
- `includeContent` (boolean, opcional): Incluir conteúdo da coleção
- `includeSettings` (boolean, opcional): Incluir configurações

**Resposta**:
```typescript
interface CollectionDetailResponse {
  collection: Collection
  children?: Collection[]
  content?: {
    videos: Video[]
    channels: CollectionChannel[]
    playlists: CollectionPlaylist[]
  }
  settings?: CollectionSettings
}
```

#### PUT /api/collections/[id]
**Descrição**: Atualizar uma coleção existente
**Body**:
```typescript
interface UpdateCollectionRequest {
  name?: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}
```

**Resposta**:
```typescript
interface CollectionResponse {
  collection: Collection
}
```

#### DELETE /api/collections/[id]
**Descrição**: Excluir uma coleção (e todo seu conteúdo)
**Resposta**:
```typescript
interface DeleteResponse {
  success: boolean
  message: string
}
```

### 2. Gerenciamento de Conteúdo da Coleção

#### POST /api/collections/[id]/items
**Descrição**: Adicionar itens a uma coleção
**Body**:
```typescript
interface AddItemsRequest {
  videos?: string[]   // Array de videoIds
  channels?: string[] // Array de channelIds
  playlists?: string[] // Array de playlistIds
  position?: number
}
```

**Resposta**:
```typescript
interface AddItemsResponse {
  added: {
    videos: string[]
    channels: string[]
    playlists: string[]
  }
  errors: {
    videos: string[]
    channels: string[]
    playlists: string[]
  }
}
```

#### DELETE /api/collections/[id]/items
**Descrição**: Remover itens de uma coleção
**Body**:
```typescript
interface RemoveItemsRequest {
  videos?: string[]
  channels?: string[]
  playlists?: string[]
}
```

**Resposta**:
```typescript
interface RemoveItemsResponse {
  removed: {
    videos: string[]
    channels: string[]
    playlists: string[]
  }
}
```

#### GET /api/collections/[id]/content
**Descrição**: Obter todo o conteúdo de uma coleção
**Parâmetros**:
- `type` ('videos' | 'channels' | 'playlists', opcional): Filtrar por tipo
- `limit` (number, opcional): Limite de resultados
- `offset` (number, opcional): Offset para paginação
- `sortBy` (string, opcional): Campo para ordenação
- `sortOrder` ('asc' | 'desc', opcional): Ordem de ordenação

**Resposta**:
```typescript
interface CollectionContentResponse {
  videos: Video[]
  channels: CollectionChannel[]
  playlists: CollectionPlaylist[]
  total: {
    videos: number
    channels: number
    playlists: number
  }
}
```

### 3. Feed de Vídeos da Coleção

#### GET /api/collections/[id]/feed
**Descrição**: Obter feed de vídeos de uma coleção (com base nas configurações)
**Parâmetros**:
- `includeWatched` (boolean, opcional): Incluir vídeos assistidos
- `includeShorts` (boolean, opcional): Incluir vídeos Shorts
- `limit` (number, opcional): Limite de resultados
- `offset` (number, opcional): Offset para paginação

**Resposta**:
```typescript
interface CollectionFeedResponse {
  videos: Video[]
  total: number
  hasMore: boolean
  settings: CollectionSettings
}
```

### 4. Gerenciamento de Tags

#### GET /api/collections/[id]/tags
**Descrição**: Obter tags de uma coleção
**Resposta**:
```typescript
interface CollectionTagsResponse {
  tags: Tag[]
}
```

#### POST /api/collections/[id]/tags
**Descrição**: Adicionar tags a uma coleção
**Body**:
```typescript
interface AddTagsRequest {
  tagIds: string[]
}
```

**Resposta**:
```typescript
interface AddTagsResponse {
  added: string[]
  errors: string[]
}
```

#### DELETE /api/collections/[id]/tags
**Descrição**: Remover tags de uma coleção
**Body**:
```typescript
interface RemoveTagsRequest {
  tagIds: string[]
}
```

**Resposta**:
```typescript
interface RemoveTagsResponse {
  removed: string[]
}
```

### 5. Gerenciamento Global de Tags

#### GET /api/tags
**Descrição**: Listar todas as tags do usuário
**Resposta**:
```typescript
interface TagsResponse {
  tags: Tag[]
}
```

#### POST /api/tags
**Descrição**: Criar uma nova tag
**Body**:
```typescript
interface CreateTagRequest {
  name: string
  color?: string
}
```

**Resposta**:
```typescript
interface TagResponse {
  tag: Tag
}
```

### 6. Configurações da Coleção

#### GET /api/collections/[id]/settings
**Descrição**: Obter configurações de uma coleção
**Resposta**:
```typescript
interface CollectionSettingsResponse {
  settings: CollectionSettings
}
```

#### PUT /api/collections/[id]/settings
**Descrição**: Atualizar configurações de uma coleção
**Body**:
```typescript
interface UpdateSettingsRequest {
  autoTagging?: boolean
  hideWatched?: boolean
  hideShorts?: boolean
  sortBy?: string
  sortOrder?: string
  maxVideos?: number
  customFeed?: boolean
  notifications?: boolean
  syncEnabled?: boolean
}
```

**Resposta**:
```typescript
interface CollectionSettingsResponse {
  settings: CollectionSettings
}
```

### 7. Operações em Massa

#### POST /api/collections/batch
**Descrição**: Operações em lote em coleções
**Body**:
```typescript
interface BatchOperationsRequest {
  operation: 'move' | 'copy' | 'delete'
  collectionIds: string[]
  targetParentId?: string
}
```

**Resposta**:
```typescript
interface BatchResponse {
  success: boolean
  processed: number
  errors: string[]
}
```

### 8. Busca e Filtragem

#### GET /api/collections/search
**Descrição**: Buscar coleções
**Parâmetros**:
- `query` (string, obrigatório): Termo de busca
- `includeContent` (boolean, opcional): Incluir conteúdo na busca
- `limit` (number, opcional): Limite de resultados

**Resposta**:
```typescript
interface SearchResponse {
  collections: Collection[]
  total: number
}
```

#### GET /api/collections/[id]/search
**Descrição**: Buscar dentro de uma coleção específica
**Parâmetros**:
- `query` (string, obrigatório): Termo de busca
- `type` ('videos' | 'channels' | 'playlists', opcional): Filtrar por tipo
- `limit` (number, opcional): Limite de resultados

**Resposta**:
```typescript
interface CollectionSearchResponse {
  videos: Video[]
  channels: CollectionChannel[]
  playlists: CollectionPlaylist[]
  total: number
}
```

### 9. Sincronização e Exportação

#### GET /api/collections/export
**Descrição**: Exportar coleções e seu conteúdo
**Parâmetros**:
- `format` ('json' | 'csv', opcional): Formato de exportação
- `includeContent` (boolean, opcional): Incluir conteúdo

**Resposta**:
```typescript
interface ExportResponse {
  data: string | object
  filename: string
  contentType: string
}
```

#### POST /api/collections/import
**Descrição**: Importar coleções
**Body**:
```typescript
interface ImportRequest {
  data: object
  merge?: boolean // Mesclar com coleções existentes
}
```

**Resposta**:
```typescript
interface ImportResponse {
  imported: number
  errors: string[]
  conflicts: string[]
}
```

## Tipos de Dados

### Collection
```typescript
interface Collection {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic: boolean
  parentId?: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
  children?: Collection[]
  itemCount?: number
}
```

### CollectionVideo
```typescript
interface CollectionVideo {
  id: string
  collectionId: string
  videoId: string
  addedAt: string
  position: number
  notes?: string
  isWatched: boolean
  rating?: number
  video: Video
}
```

### CollectionChannel
```typescript
interface CollectionChannel {
  id: string
  collectionId: string
  channelId: string
  channelTitle?: string
  addedAt: string
  position: number
  isSubscribed: boolean
  notifyNewVideos: boolean
}
```

### CollectionPlaylist
```typescript
interface CollectionPlaylist {
  id: string
  collectionId: string
  playlistId: string
  playlistTitle?: string
  addedAt: string
  position: number
}
```

### CollectionSettings
```typescript
interface CollectionSettings {
  id: string
  collectionId: string
  autoTagging: boolean
  hideWatched: boolean
  hideShorts: boolean
  sortBy: string
  sortOrder: string
  maxVideos?: number
  customFeed: boolean
  notifications: boolean
  syncEnabled: boolean
}
```

### Tag
```typescript
interface Tag {
  id: string
  name: string
  color?: string
  userId: string
  createdAt: string
  updatedAt: string
}
```

## Tratamento de Erros

### Códigos de Status HTTP
- `200`: Sucesso
- `201`: Criado
- `400`: Requisição inválida
- `401`: Não autorizado
- `403: Proibido
- `404`: Não encontrado
- `409`: Conflito
- `422`: Dados inválidos
- `500`: Erro interno do servidor

### Mensagens de Erro Padrão
```typescript
interface ErrorResponse {
  error: string
  code: string
  details?: any
}
```

## Segurança

1. **Autenticação**: Todas as rotas requerem autenticação via NextAuth
2. **Autorização**: Usuários só podem acessar suas próprias coleções
3. **Validação**: Validação de entrada em todas as requisições
4. **Rate Limiting**: Limitação de requisições para APIs
5. **Permissões**: Coleções públicas podem ser acessadas por outros usuários (somente leitura)

## Performance

1. **Paginação**: Todas as listagens suportam paginação
2. **Cache**: Cache de coleções e configurações
3. **Indexação**: Índices adequados no banco de dados
4. **Busca**: Busca otimizada com índices de texto
5. **Lazy Loading**: Carregamento progressivo de conteúdo
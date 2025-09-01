# 📚 Referência da API - YouTube Organizer

## Visão Geral

A API do YouTube Organizer é construída com Next.js API Routes, seguindo princípios RESTful e GraphQL-like patterns. Todas as rotas estão protegidas por autenticação e utilizam validação rigorosa de dados.

## 🔐 Autenticação

### Headers Necessários
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Obter Token
```http
POST /api/auth/signin/google
```

## 📋 Endpoints Principais

### Coleções (Collections)

#### GET /api/collections
Lista todas as coleções do usuário.

**Parâmetros de Query:**
- `page` (number): Página atual (default: 1)
- `limit` (number): Itens por página (default: 20)
- `search` (string): Termo de busca
- `sortBy` (string): Campo para ordenação (name, createdAt, updatedAt)
- `sortOrder` (string): Ordem (asc, desc)
- `parentId` (string): Filtrar por coleção pai
- `isPublic` (boolean): Filtrar por visibilidade

**Resposta:**
```json
{
  "collections": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "isPublic": false,
      "parentId": "string",
      "position": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "children": [],
      "videos": [],
      "channels": [],
      "playlists": [],
      "feeds": [],
      "settings": {},
      "tags": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/collections
Cria uma nova coleção.

**Corpo da Requisição:**
```json
{
  "name": "Minha Coleção",
  "description": "Descrição opcional",
  "isPublic": false,
  "parentId": "uuid-do-pai",
  "position": 0
}
```

**Resposta:**
```json
{
  "collection": {
    "id": "uuid-gerado",
    "name": "Minha Coleção",
    "description": "Descrição opcional",
    "isPublic": false,
    "parentId": "uuid-do-pai",
    "position": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/collections/[id]
Obtém uma coleção específica.

**Parâmetros de Path:**
- `id` (string): ID da coleção

**Resposta:**
```json
{
  "collection": {
    "id": "string",
    "name": "string",
    "description": "string",
    "isPublic": false,
    "parentId": "string",
    "position": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "children": [],
    "videos": [],
    "channels": [],
    "playlists": [],
    "feeds": [],
    "settings": {},
    "tags": []
  }
}
```

#### PUT /api/collections/[id]
Atualiza uma coleção.

**Corpo da Requisição:**
```json
{
  "name": "Nome Atualizado",
  "description": "Descrição atualizada",
  "isPublic": true
}
```

#### DELETE /api/collections/[id]
Exclui uma coleção.

#### POST /api/collections/[id]/videos
Adiciona vídeos a uma coleção.

**Corpo da Requisição:**
```json
{
  "videoIds": ["youtube-id-1", "youtube-id-2"],
  "position": 0
}
```

#### DELETE /api/collections/[id]/videos
Remove vídeos de uma coleção.

**Corpo da Requisição:**
```json
{
  "videoIds": ["youtube-id-1", "youtube-id-2"]
}
```

#### POST /api/collections/[id]/channels
Adiciona canais a uma coleção.

**Corpo da Requisição:**
```json
{
  "channelIds": ["channel-id-1", "channel-id-2"]
}
```

#### POST /api/collections/[id]/playlists
Adiciona playlists a uma coleção.

**Corpo da Requisição:**
```json
{
  "playlistIds": ["playlist-id-1", "playlist-id-2"]
}
```

### Feeds

#### GET /api/feeds
Lista todos os feeds.

**Parâmetros de Query:**
- `collectionId` (string): Filtrar por coleção
- `isActive` (boolean): Filtrar por status

#### POST /api/feeds
Cria um novo feed.

**Corpo da Requisição:**
```json
{
  "collectionId": "uuid-da-colecao",
  "title": "Feed de Tecnologia",
  "description": "Vídeos sobre tecnologia",
  "filters": "{\"categories\": [\"tech\", \"programming\"]}",
  "sortBy": "publishedAt",
  "sortOrder": "desc",
  "limit": 50,
  "isActive": true
}
```

#### GET /api/feeds/[id]
Obtém um feed específico.

#### PUT /api/feeds/[id]
Atualiza um feed.

#### DELETE /api/feeds/[id]
Exclui um feed.

#### POST /api/feeds/[id]/sync
Sincroniza o conteúdo do feed.

### Vídeos (Videos)

#### GET /api/videos
Busca vídeos com filtros avançados.

**Parâmetros de Query:**
- `q` (string): Termo de busca
- `channelId` (string): Filtrar por canal
- `collectionId` (string): Filtrar por coleção
- `publishedAfter` (string): Data de publicação inicial (ISO 8601)
- `publishedBefore` (string): Data de publicação final (ISO 8601)
- `minViewCount` (number): Mínimo de visualizações
- `maxViewCount` (number): Máximo de visualizações
- `sortBy` (string): Campo para ordenação
- `sortOrder` (string): Ordem (asc, desc)
- `page` (number): Página
- `limit` (number): Itens por página

**Resposta:**
```json
{
  "videos": [
    {
      "id": "string",
      "youtubeId": "string",
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "duration": 3600,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "channelId": "string",
      "channelTitle": "string",
      "tags": ["tag1", "tag2"],
      "viewCount": 100000,
      "likeCount": 5000,
      "commentCount": 1000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

#### GET /api/videos/[youtubeId]
Obtém detalhes de um vídeo específico.

**Parâmetros de Path:**
- `youtubeId` (string): ID do vídeo no YouTube

#### POST /api/videos/[youtubeId]/sync
Sincroniza metadados do vídeo com YouTube.

#### GET /api/videos/[youtubeId]/transcript
Obtém o transcript do vídeo.

**Parâmetros de Query:**
- `language` (string): Idioma do transcript (default: 'en')

#### POST /api/videos/[youtubeId]/summary
Gera um resumo IA do vídeo.

**Corpo da Requisição:**
```json
{
  "model": "gpt-3.5-turbo",
  "maxLength": 500,
  "includeTimestamps": true
}
```

### Notificações (Notifications)

#### GET /api/notifications
Lista notificações do usuário.

**Parâmetros de Query:**
- `isRead` (boolean): Filtrar por status de leitura
- `isArchived` (boolean): Filtrar por status de arquivamento
- `type` (string): Filtrar por tipo
- `priority` (string): Filtrar por prioridade
- `page` (number): Página
- `limit` (number): Itens por página

#### POST /api/notifications
Cria uma nova notificação.

**Corpo da Requisição:**
```json
{
  "title": "Nova notificação",
  "message": "Conteúdo da notificação",
  "type": "info",
  "priority": "normal",
  "entityType": "collection",
  "entityId": "uuid-da-entidade",
  "collectionId": "uuid-da-colecao",
  "channels": ["email", "push"],
  "scheduledAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z"
}
```

#### PUT /api/notifications/[id]/read
Marca notificação como lida.

#### PUT /api/notifications/[id]/archive
Arquiva notificação.

#### DELETE /api/notifications/[id]
Exclui notificação.

#### GET /api/notifications/preferences
Obtém preferências de notificação do usuário.

#### PUT /api/notifications/preferences
Atualiza preferências de notificação.

**Corpo da Requisição:**
```json
{
  "emailEnabled": true,
  "pushEnabled": true,
  "smsEnabled": false,
  "types": {
    "newVideo": true,
    "collectionUpdate": true,
    "systemAlert": true
  },
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  }
}
```

### Canais (Channels)

#### GET /api/channels
Busca canais do YouTube.

**Parâmetros de Query:**
- `q` (string): Termo de busca
- `maxResults` (number): Máximo de resultados (default: 20)

#### GET /api/channels/[channelId]
Obtém detalhes de um canal específico.

#### POST /api/channels/[channelId]/sync
Sincroniza informações do canal.

### Playlists

#### GET /api/playlists
Busca playlists do YouTube.

**Parâmetros de Query:**
- `channelId` (string): ID do canal
- `q` (string): Termo de busca
- `maxResults` (number): Máximo de resultados

#### GET /api/playlists/[playlistId]
Obtém detalhes de uma playlist específica.

#### GET /api/playlists/[playlistId]/videos
Obtém vídeos de uma playlist.

#### POST /api/playlists/[playlistId]/sync
Sincroniza conteúdo da playlist.

## 📊 Webhooks

### YouTube Webhook
```http
POST /api/webhooks/youtube
Content-Type: application/json
X-Hub-Signature: sha1=<signature>
```

**Corpo da Requisição:**
```json
{
  "kind": "youtube#video",
  "id": "video-id",
  "snippet": {
    "channelId": "channel-id",
    "title": "Video Title",
    "description": "Video Description",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔄 Rate Limiting

### Limites por Endpoint
- **GET /api/collections**: 1000 req/hora
- **POST /api/collections**: 100 req/hora
- **GET /api/videos**: 2000 req/hora
- **POST /api/videos/sync**: 50 req/hora
- **GET /api/notifications**: 500 req/hora

### Headers de Rate Limit
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🚨 Tratamento de Erros

### Códigos de Status HTTP
- **200**: Sucesso
- **201**: Criado
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **409**: Conflito
- **422**: Entidade não processável
- **429**: Muitas requisições
- **500**: Erro interno do servidor

### Estrutura de Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": {
      "field": "name",
      "reason": "Campo obrigatório"
    }
  }
}
```

### Códigos de Erro Comuns
- `VALIDATION_ERROR`: Dados inválidos
- `AUTHENTICATION_ERROR`: Problema de autenticação
- `AUTHORIZATION_ERROR`: Sem permissão
- `NOT_FOUND_ERROR`: Recurso não encontrado
- `CONFLICT_ERROR`: Conflito de dados
- `RATE_LIMIT_ERROR`: Limite de requisições excedido
- `EXTERNAL_API_ERROR`: Erro em API externa
- `DATABASE_ERROR`: Erro no banco de dados

## 🔧 SDKs e Bibliotecas

### JavaScript/TypeScript SDK
```typescript
import { YouTubeOrganizer } from 'youtube-organizer-sdk';

const client = new YouTubeOrganizer({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.youtube-organizer.com'
});

// Exemplo de uso
const collections = await client.collections.list({
  page: 1,
  limit: 20
});
```

### Python SDK
```python
from youtube_organizer import YouTubeOrganizer

client = YouTubeOrganizer(
    api_key='your-api-key',
    base_url='https://api.youtube-organizer.com'
)

# Exemplo de uso
collections = client.collections.list(page=1, limit=20)
```

## 📈 Limites e Cotas

### Limites da API
- **Requisições por hora**: 10.000 (autenticado)
- **Requisições por dia**: 100.000 (autenticado)
- **Tamanho máximo de upload**: 10MB
- **Timeout de requisição**: 30 segundos

### Limites do YouTube
- **Vídeos por busca**: 50 máximo
- **Transcripts**: Limitado pela disponibilidade
- **Rate limit do YouTube**: 10.000 unidades por dia

## 🔒 Segurança

### HTTPS Only
Todas as requisições devem usar HTTPS.

### Validação de Input
- Sanitização automática de todos os inputs
- Validação de schema com Zod
- Proteção contra SQL injection
- Proteção contra XSS

### Logs de Segurança
- Todas as requisições são logadas
- Tentativas de acesso não autorizado
- Mudanças críticas são auditadas

## 📞 Suporte

### Canais de Suporte
- **Email**: api-support@youtube-organizer.com
- **Discord**: https://discord.gg/youtube-organizer
- **GitHub Issues**: https://github.com/youtube-organizer/api/issues

### SLA
- **Disponibilidade**: 99.9%
- **Tempo de resposta**: < 200ms (média)
- **Suporte**: 24/7 para planos premium

---

Para mais detalhes sobre implementação específica ou exemplos de código, consulte a documentação completa em [docs.youtube-organizer.com](https://docs.youtube-organizer.com).

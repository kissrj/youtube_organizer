# 🏗️ Arquitetura do Sistema YouTube Organizer

## Visão Geral

O YouTube Organizer é uma aplicação web moderna construída com Next.js 14, TypeScript e Prisma, projetada para organizar e gerenciar coleções de vídeos do YouTube com recursos avançados de IA e transcripts.

## 🏛️ Arquitetura Geral

### Padrão Arquitetural
- **Frontend:** Componentes React com hooks personalizados
- **Backend:** API Routes do Next.js (Serverless)
- **Banco de Dados:** SQLite com Prisma ORM
- **Autenticação:** NextAuth.js com Google OAuth
- **APIs Externas:** YouTube Data API, OpenAI API

### Fluxo de Dados
```
Usuário → Next.js App → API Routes → Prisma → SQLite
                              ↓
                        APIs Externas
                        (YouTube, OpenAI)
```

## 📁 Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   ├── (dashboard)/              # Dashboard principal
│   │   ├── collections/          # Gestão de coleções
│   │   ├── feeds/                # Gestão de feeds
│   │   ├── notifications/        # Centro de notificações
│   │   └── settings/             # Configurações
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   ├── collections/          # CRUD de coleções
│   │   ├── feeds/                # CRUD de feeds
│   │   ├── notifications/        # Sistema de notificações
│   │   └── videos/               # Operações com vídeos
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Página inicial
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base da UI
│   ├── forms/                    # Formulários
│   ├── modals/                   # Modais e dialogs
│   ├── layout/                   # Componentes de layout
│   └── providers/                # Context providers
├── lib/                          # Utilitários e configurações
│   ├── prisma/                   # Cliente e configurações Prisma
│   ├── auth/                     # Configuração NextAuth
│   ├── services/                 # Serviços da aplicação
│   │   ├── collections.ts        # Serviço de coleções
│   │   ├── feeds.ts              # Serviço de feeds
│   │   ├── notifications.ts      # Serviço de notificações
│   │   ├── videos.ts             # Serviço de vídeos
│   │   └── youtube.ts            # Cliente YouTube API
│   ├── utils/                    # Funções utilitárias
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # Definições de tipos
│   └── validations/              # Schemas de validação
├── styles/                       # Estilos adicionais
└── middleware.ts                 # Middleware Next.js
```

## 🗄️ Modelo de Dados

### Entidades Principais

#### Collection (Coleção)
```typescript
interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  parentId?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  children?: Collection[];
  parent?: Collection;
  videos?: CollectionVideo[];
  channels?: CollectionChannel[];
  playlists?: CollectionPlaylist[];
  feeds?: CollectionFeed[];
  settings?: CollectionSettings;
  tags?: CollectionTag[];
}
```

#### Video (Vídeo)
```typescript
interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  duration: number;
  publishedAt: Date;
  channelId: string;
  channelTitle: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  collections?: CollectionVideo[];
  transcripts?: Transcript[];
}
```

#### Feed (Feed)
```typescript
interface CollectionFeed {
  id: string;
  collectionId: string;
  title: string;
  description?: string;
  filters?: string; // JSON string
  sortBy: FeedSortBy;
  sortOrder: FeedSortOrder;
  limit: number;
  isActive: boolean;
  lastFetched?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  collection: Collection;
}
```

#### Notification (Notificação)
```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  entityType?: string;
  entityId?: string;
  collectionId?: string;
  isRead: boolean;
  isArchived: boolean;
  channels: string[]; // JSON
  scheduledAt: Date;
  expiresAt: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Relacionamentos

```
User (1) ──── (N) Collection
Collection (1) ──── (N) CollectionVideo (N) ──── (1) Video
Collection (1) ──── (N) CollectionChannel (N) ──── (1) Channel
Collection (1) ──── (N) CollectionPlaylist (N) ──── (1) Playlist
Collection (1) ──── (N) CollectionFeed
Collection (1) ──── (1) CollectionSettings
Collection (1) ──── (N) CollectionTag (N) ──── (1) Tag
User (1) ──── (N) Notification
User (1) ──── (1) NotificationPreference
User (1) ──── (N) NotificationChannel
```

## 🔧 Serviços da Aplicação

### CollectionsService
**Responsabilidades:**
- CRUD de coleções
- Gerenciamento de hierarquia
- Operações em lote
- Validação de dados
- Estatísticas e analytics

**Métodos Principais:**
- `createCollection()` - Criar nova coleção
- `getCollections()` - Listar coleções com filtros
- `updateCollection()` - Atualizar coleção
- `deleteCollection()` - Excluir coleção
- `moveCollection()` - Mover na hierarquia
- `getCollectionContent()` - Obter conteúdo da coleção
- `searchCollections()` - Buscar coleções
- `exportCollections()` - Exportar dados
- `importCollections()` - Importar dados

### FeedsService
**Responsabilidades:**
- Gerenciamento de feeds RSS/Atom
- Sincronização automática
- Filtragem e ordenação
- Processamento de conteúdo

**Métodos Principais:**
- `createFeed()` - Criar novo feed
- `getFeed()` - Obter feed por ID
- `updateFeed()` - Atualizar feed
- `deleteFeed()` - Excluir feed
- `syncFeed()` - Sincronizar conteúdo
- `getFeedVideos()` - Obter vídeos do feed

### NotificationsService
**Responsabilidades:**
- Gerenciamento de notificações
- Envio por múltiplos canais
- Preferências do usuário
- Templates de notificação

**Métodos Principais:**
- `createNotification()` - Criar notificação
- `getUserNotifications()` - Listar notificações
- `markAsRead()` - Marcar como lida
- `archiveNotification()` - Arquivar notificação
- `getUserPreferences()` - Obter preferências
- `updatePreferences()` - Atualizar preferências
- `addChannel()` - Adicionar canal de notificação

### VideosService
**Responsabilidades:**
- Integração com YouTube API
- Processamento de metadados
- Gerenciamento de transcripts
- Geração de resumos IA

**Métodos Principais:**
- `syncVideo()` - Sincronizar vídeo do YouTube
- `getVideoTranscript()` - Obter transcript
- `generateSummary()` - Gerar resumo IA
- `updateVideoMetadata()` - Atualizar metadados
- `searchVideos()` - Buscar vídeos

## 🔐 Autenticação e Autorização

### NextAuth.js Configuration
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id;
      return session;
    },
  },
};
```

### Middleware de Autorização
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session && request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
```

## 🌐 APIs Externas

### YouTube Data API v3
**Endpoints utilizados:**
- `videos.list` - Metadados dos vídeos
- `channels.list` - Informações dos canais
- `playlists.list` - Listas de reprodução
- `playlistItems.list` - Itens das playlists
- `captions.list` - Transcripts dos vídeos

### OpenAI API
**Modelos utilizados:**
- `gpt-3.5-turbo` - Geração de resumos
- `gpt-4` - Análise avançada (opcional)

**Prompts otimizados:**
- Resumos concisos e estruturados
- Extração de pontos principais
- Análise de sentimento e tópicos

## 📊 Estratégia de Cache

### Redis (Futuro)
- Cache de metadados do YouTube
- Cache de resumos IA
- Cache de resultados de busca
- Cache de preferências do usuário

### In-Memory Cache (Atual)
- Cache de configurações
- Cache de templates
- Cache de dados estáticos

## 🔍 Estratégia de Busca

### Full-Text Search
- Busca em títulos, descrições e tags
- Busca por canal e categoria
- Filtros avançados por data, visualizações, etc.

### Algoritmo de Relevância
- Peso por campo (título > descrição > tags)
- Boost por recência e engajamento
- Filtros booleanos e de range

## 📈 Monitoramento e Analytics

### Métricas Principais
- Performance das queries
- Taxa de erro das APIs
- Tempo de resposta das operações
- Utilização de recursos

### Ferramentas
- **Vercel Analytics** - Métricas de uso
- **Sentry** - Monitoramento de erros
- **DataDog** - Monitoramento de performance
- **Custom Dashboards** - Métricas específicas

## 🚀 Estratégia de Deploy

### Vercel (Recomendado)
- Deploy automático via Git
- CDN global integrado
- Funções serverless otimizadas
- Análise de performance integrada

### Docker (Alternativo)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Segurança

### Medidas Implementadas
- **Sanitização de Input:** Validação com Zod
- **Rate Limiting:** Controle de requisições
- **CORS:** Configuração adequada
- **Headers de Segurança:** Helmet-like
- **Autenticação:** JWT com refresh tokens

### Boas Práticas
- **Princípio do Menor Privilégio**
- **Validação em Múltiplas Camadas**
- **Logs de Segurança**
- **Atualizações Regulares**

## 📚 Padrões de Código

### TypeScript
- Strict mode habilitado
- Interfaces bem definidas
- Generics para reutilização
- Utility types do TypeScript

### React/Next.js
- Server Components quando possível
- Client Components quando necessário
- Custom hooks para lógica reutilizável
- Error boundaries para tratamento de erros

### Estilização
- Tailwind CSS para consistência
- CSS Modules para isolamento
- Design system bem definido
- Responsividade mobile-first

## 🧪 Estratégia de Testes

### Pirâmide de Testes
```
E2E Tests (Playwright) - Cenários completos
  ↑
Integration Tests (Jest) - Workflows e APIs
  ↑
Unit Tests (Jest) - Funções e componentes
```

### Cobertura Alvo
- **Unit Tests:** 80%+ cobertura
- **Integration Tests:** Principais workflows
- **E2E Tests:** Jornada crítica do usuário

### Ferramentas
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **Playwright** - Testes E2E
- **Mock Service Worker** - Mocks de API

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### Stages
1. **Lint & Type Check**
2. **Unit Tests**
3. **Integration Tests**
4. **E2E Tests**
5. **Build**
6. **Deploy**

## 📋 Roadmap Técnico

### Fase 1 (Atual)
- ✅ Estrutura base com Next.js 14
- ✅ Autenticação com NextAuth.js
- ✅ Integração com YouTube API
- ✅ Sistema de coleções básico
- ✅ Interface responsiva

### Fase 2 (Próxima)
- 🔄 Sistema de feeds avançado
- 🔄 Notificações em tempo real
- 🔄 Cache com Redis
- 🔄 PWA capabilities
- 🔄 Tema dark/light

### Fase 3 (Futuro)
- 🔄 Microserviços
- 🔄 Multi-tenant
- 🔄 Analytics avançado
- 🔄 Integração com outras plataformas
- 🔄 IA avançada com machine learning

---

Esta arquitetura fornece uma base sólida e escalável para o YouTube Organizer, com foco em performance, manutenibilidade e experiência do usuário.

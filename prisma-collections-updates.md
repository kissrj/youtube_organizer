# Atualizações do Schema do Prisma para Coleções

Este arquivo contém as atualizações necessárias para o schema do Prisma para implementar o sistema de coleções hierárquicas.

## Schema Atualizado

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// NextAuth.js Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model YouTubeAccount {
  id                String   @id @default(cuid())
  userId            String   @unique
  youtubeUserId     String?
  youtubeUsername   String?
  accessToken       String?
  refreshToken      String?
  tokenExpiry       DateTime?
  scope             String?
  connectedAt       DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  playlists     Playlist[]
  categories    Category[]
  tags          Tag[]
  videos        Video[]
  youtubeAccount YouTubeAccount?
  
  // Novos modelos de coleções
  collections   Collection[]
  collectionVideos CollectionVideo[]
  collectionChannels CollectionChannel[]
  collectionPlaylists CollectionPlaylist[]
  collectionTags CollectionTag[]
  collectionSettings CollectionSettings[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Novo modelo: Collection (substitui Category)
model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  icon        String?  // URL do ícone personalizado ou nome do ícone do pacote
  color       String?  // Cor personalizada para UI (hex)
  isPublic    Boolean  @default(false) // Coleção compartilhada
  parentId    String?  // Para hierarquia (self-referencing)
  position    Int      @default(0) // Ordem de exibição
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  parent      Collection?  @relation("CollectionHierarchy", fields: [parentId], references: [id])
  children    Collection[] @relation("CollectionHierarchy")
  
  // Conteúdo da coleção
  videos      CollectionVideo[]
  channels    CollectionChannel[]
  playlists   CollectionPlaylist[]
  
  // Tags e metadados
  tags        CollectionTag[]
  settings    CollectionSettings?
  
  // Relação com usuário
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Restrições
  @@unique([userId, name])
  @@index([parentId])
}

// Vídeos na coleção
model CollectionVideo {
  id          String   @id @default(cuid())
  collectionId String
  videoId     String
  addedAt     DateTime @default(now())
  position    Int      @default(0)
  notes       String?
  isWatched   Boolean  @default(false)
  rating      Int?     // 1-5 estrelas
  
  collection  Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  video       Video      @relation(fields: [videoId], references: [id], onDelete: Cascade)
  
  @@unique([collectionId, videoId])
  @@index([collectionId])
}

// Canais na coleção
model CollectionChannel {
  id          String   @id @default(cuid())
  collectionId String
  channelId   String   // YouTube channel ID
  channelTitle String?
  addedAt     DateTime @default(now())
  position    Int      @default(0)
  isSubscribed Boolean  @default(false)
  notifyNewVideos Boolean @default(false)
  
  collection  Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  @@unique([collectionId, channelId])
  @@index([collectionId])
}

// Playlists na coleção
model CollectionPlaylist {
  id          String   @id @default(cuid())
  collectionId String
  playlistId  String   // YouTube playlist ID
  playlistTitle String?
  addedAt     DateTime @default(now())
  position    Int      @default(0)
  
  collection  Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  
  @@unique([collectionId, playlistId])
  @@index([collectionId])
}

// Tags globais do sistema
model Tag {
  id        String   @id @default(cuid())
  name      String
  color     String?  // Cor da tag
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  collections CollectionTag[]
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, name])
}

// Tags associadas a coleções
model CollectionTag {
  id          String   @id @default(cuid())
  collectionId String
  tagId       String
  addedAt     DateTime @default(now())
  
  collection  Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  tag         Tag        @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([collectionId, tagId])
  @@index([collectionId])
  @@index([tagId])
}

// Configurações da coleção
model CollectionSettings {
  id               String   @id @default(cuid())
  collectionId     String   @unique
  autoTagging      Boolean  @default(false) // Geração automática de tags
  hideWatched       Boolean  @default(false) // Esconder vídeos assistidos
  hideShorts       Boolean  @default(false) // Esconder vídeos Shorts
  sortBy           String   @default("addedAt") // addedAt, publishedAt, title, duration
  sortOrder        String   @default("desc") // asc, desc
  maxVideos        Int?     // Limite máximo de vídeos
  customFeed       Boolean  @default(false) // Habilitar feed personalizado
  notifications    Boolean  @default(false) // Notificações de novos vídeos
  syncEnabled      Boolean  @default(false) // Sincronização automática
  
  collection       Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
}

// YouTube Organizer Models (mantidos para compatibilidade)
model Category {
  id          String     @id @default(cuid())
  name        String
  description String?
  color       String?    // Hex color for UI
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  playlists   PlaylistCategory[]
  videos      VideoCategory[]

  @@unique([userId, name])
}

model Tag {
  id        String   @id @default(cuid())
  name      String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  playlists PlaylistTag[]
  videos    VideoTag[]

  @@unique([userId, name])
}

model Playlist {
  id                String   @id @default(cuid())
  youtubeId         String   @unique // YouTube playlist ID
  title             String
  description       String?
  thumbnailUrl      String?
  channelTitle      String?
  itemCount         Int?
  publishedAt       DateTime?
  userId            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories        PlaylistCategory[]
  tags              PlaylistTag[]

  @@unique([userId, youtubeId])
}

model PlaylistCategory {
  id          String   @id @default(cuid())
  playlistId  String
  categoryId  String
  addedAt     DateTime @default(now())

  playlist    Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([playlistId, categoryId])
}

model PlaylistTag {
  id         String   @id @default(cuid())
  playlistId String
  tagId      String
  addedAt    DateTime @default(now())

  playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([playlistId, tagId])
}

// Vídeos individuais importados
model Video {
  id                String   @id @default(cuid())
  youtubeId         String   @unique // YouTube video ID (11 caracteres)
  title             String
  description       String?
  thumbnailUrl      String?
  channelTitle      String?
  channelId         String?
  duration          String?  // ISO 8601 duration (PT4M13S)
  viewCount         String?
  likeCount         String?
  commentCount      String?  // Número de comentários
  favoriteCount     String?  // Número de favoritos
  publishedAt       DateTime?
  definition        String?  // hd, sd
  dimension         String?  // 2d, 3d
  projection        String?  // rectangular, 360
  defaultAudioLanguage String? // Idioma padrão do áudio
  categoryId        String?  // Categoria do YouTube
  videoTags         String?  // Tags do vídeo (JSON)

  // Campos para indexação e busca avançada
  searchContent     String?  // Conteúdo combinado para busca (título + descrição + tags)
  contentSummary    String?  // Resumo gerado automaticamente
  keywords          String?  // Palavras-chave extraídas
  language          String?  // Idioma detectado
  transcriptStatus  String?  // Status do transcript: 'available', 'unavailable', 'processing'
  // Cache de transcript
  transcriptJson    String?
  transcriptText    String?
  transcriptSource  String?
  transcriptUpdatedAt DateTime?

  userId            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories        VideoCategory[]
  tags              VideoTag[]
  collectionVideos  CollectionVideo[]

  @@unique([userId, youtubeId])
}

model VideoCategory {
  id        String   @id @default(cuid())
  videoId   String
  categoryId String
  addedAt   DateTime @default(now())

  video     Video     @relation(fields: [videoId], references: [id], onDelete: Cascade)
  category  Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([videoId, categoryId])
}

model VideoTag {
  id      String   @id @default(cuid())
  videoId String
  tagId   String
  addedAt DateTime @default(now())

  video   Video @relation(fields: [videoId], references: [id], onDelete: Cascade)
  tag     Tag   @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([videoId, tagId])
}
```

## Migração de Dados

Para migrar dados do sistema atual (categorias e tags) para o novo sistema de coleções:

```sql
-- 1. Criar coleções baseadas em categorias existentes
INSERT INTO Collection (id, name, description, userId, createdAt, updatedAt)
SELECT id, name, description, userId, createdAt, updatedAt
FROM Category;

-- 2. Associar vídeos às coleções (substituindo VideoCategory)
INSERT INTO CollectionVideo (collectionId, videoId, addedAt)
SELECT c.id, v.id, vc.addedAt
FROM Category cat
JOIN Collection c ON cat.id = c.id
JOIN VideoCategory vc ON cat.id = vc.categoryId
JOIN Video v ON vc.videoId = v.id;

-- 3. Associar playlists às coleções (substituindo PlaylistCategory)
INSERT INTO CollectionPlaylist (collectionId, playlistId, addedAt)
SELECT c.id, p.id, pc.addedAt
FROM Category cat
JOIN Collection c ON cat.id = c.id
JOIN PlaylistCategory pc ON cat.id = pc.categoryId
JOIN Playlist p ON pc.playlistId = p.id;

-- 4. Manter tags existentes (elas já são compatíveis)
-- O modelo Tag já existe e será usado pelo novo sistema

-- 5. Associar tags às coleções
INSERT INTO CollectionTag (collectionId, tagId, addedAt)
SELECT c.id, t.id, NOW()
FROM Collection c
CROSS JOIN Tag t
WHERE c.userId = t.userId;
```

## Índices de Desempenho

```sql
-- Índices para coleções
CREATE INDEX idx_collection_parent ON Collection(parentId);
CREATE INDEX idx_collection_user ON Collection(userId);
CREATE INDEX idx_collection_name ON Collection(userId, name);

-- Índices para conteúdo da coleção
CREATE INDEX idx_collection_video_collection ON CollectionVideo(collectionId);
CREATE INDEX idx_collection_video_video ON CollectionVideo(videoId);
CREATE INDEX idx_collection_channel_collection ON CollectionChannel(collectionId);
CREATE INDEX idx_collection_channel_channel ON CollectionChannel(channelId);
CREATE INDEX idx_collection_playlist_collection ON CollectionPlaylist(collectionId);
CREATE INDEX idx_collection_playlist_playlist ON CollectionPlaylist(playlistId);

-- Índices para tags
CREATE INDEX idx_collection_tag_collection ON CollectionTag(collectionId);
CREATE INDEX idx_collection_tag_tag ON CollectionTag(tagId);
CREATE INDEX idx_tag_user ON Tag(userId, name);
```

## Considerações

1. **Compatibilidade**: O schema mantém os modelos antigos (Category, Tag, etc.) para compatibilidade durante a migração
2. **Relacionamentos**: Os novos modelos de coleções estabelecem relacionamentos claros com os modelos existentes
3. **Performance**: Índices adicionados para garantir bom desempenho em consultas hierárquicas
4. **Segurança**: Todos os modelos mantêm a relação com o usuário para segurança
5. **Hierarquia**: O modelo Collection suporta hierarquia ilimitada através da relação self-referencing
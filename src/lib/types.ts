// src/lib/types.ts
export interface NotebookVideo {
  id: string
  notebookId: string
  videoId: string
  addedAt: Date
  video: Video
}

export interface Notebook {
  id: string
  name: string
  description?: string
  color?: string
  category?: string
  isDefault?: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  videos?: NotebookVideo[]
  playlists?: any[]
  _count?: {
    videos: number
    playlists?: number
  }
}

// Legacy Collection interfaces (deprecated - use Notebook instead)
export interface CollectionVideo {
  id: string
  collectionId: string
  videoId: string
  position: number
  addedAt: Date
  notes?: string
  isWatched: boolean
  rating?: number
  video: Video
}

export interface CollectionChannel {
  id: string
  collectionId: string
  channelId: string
  channelTitle?: string
  addedAt: Date
  channel?: Channel
}

export interface CollectionPlaylist {
  id: string
  collectionId: string
  playlistId: string
  addedAt: Date
  playlist?: Playlist
}

export interface CollectionTag {
  id: string
  collectionId: string
  tagId: string
  tag: Tag
}

export interface CollectionSettings {
  id: string
  collectionId: string
  autoTag: boolean
  syncEnabled: boolean
  notify: boolean
  feedEnabled: boolean
  hideWatched: boolean
  hideShorts: boolean
  sortBy: 'addedAt' | 'publishedAt' | 'title' | 'duration' | 'views'
  sortOrder: 'asc' | 'desc'
  maxVideos?: number
  customFeed: boolean
}

export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  category?: string
  isAuto?: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  collections?: CollectionTag[]
}

export interface Video {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
  duration?: string
  publishedAt?: Date
  viewCount?: number
  likeCount?: number
  channelId: string
  channel?: Channel
  categories?: VideoCategory[]
  tags?: VideoTag[]
  createdAt: Date
  updatedAt: Date
}

export interface Channel {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
  subscriberCount?: number
  videoCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Playlist {
  id: string
  title: string
  description?: string
  thumbnail?: string
  url?: string
  videoCount?: number
  channelId: string
  channel?: Channel
  createdAt: Date
  updatedAt: Date
}

export interface VideoCategory {
  id: string
  videoId: string
  categoryId: string
  category: Category
}

export interface Category {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface VideoTag {
  id: string
  videoId: string
  tagId: string
  tag: Tag
}

// Form types
export interface CreateNotebookForm {
  name: string
  description?: string
  color?: string
}

export interface UpdateNotebookForm {
  name?: string
  description?: string
  color?: string
}

export interface NotebookFilters {
  userId?: string
}

// Legacy Collection form types (deprecated - use Notebook instead)
export interface CreateCollectionForm {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
}

export interface UpdateCollectionForm {
  name?: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
  parentId?: string
  position?: number
}

export interface CollectionFilters {
  includeChildren?: boolean
  includeContent?: boolean
  includeSettings?: boolean
  parentId?: string
  userId?: string
}

export interface CollectionContentFilters {
  type?: 'videos' | 'channels' | 'playlists' | 'all'
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// User type for authentication
export interface User {
  id: string
  name?: string
  email?: string
  image?: string
}

// Drag and Drop Types
export interface DragDropItem {
  id: string
  type: 'collection' | 'video' | 'channel' | 'playlist'
  name?: string
  parentId?: string
}

export interface DragDropResult {
  isDragging: boolean
  isOver: boolean
  canDrop: boolean
  drag: any
  drop: any
  item: DragDropItem | null
}

export type DropPosition = 'before' | 'after' | 'inside'

export interface DragDropEvent {
  sourceId: string
  targetId: string
  position: DropPosition
  itemType: 'collection' | 'video' | 'channel' | 'playlist'
}

// Icon Types
export interface IconOption {
  name: string
  component: React.ComponentType<{ className?: string }>
  category: string
}

export interface IconTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
}

export type IconSize = 'sm' | 'md' | 'lg'

export type IconCategory = 'folders' | 'videos' | 'channels' | 'playlists' | 'tags' | 'settings' | 'favorites' | 'downloads' | 'custom'

// Feed Types
export interface Feed {
  id: string
  collectionId: string
  collection: {
    id: string
    name: string
  }
  title: string
  description?: string
  filters?: FeedFilter
  sortBy: FeedSortBy
  sortOrder: FeedSortOrder
  limit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FeedFilter {
  channels?: string[]
  tags?: string[]
  duration?: {
    min?: number
    max?: number
  }
  dateRange?: {
    start?: Date
    end?: Date
  }
  viewCount?: {
    min?: number
    max?: number
  }
  searchQuery?: string
}

export type FeedSortBy = 'RECENT' | 'VIEWS' | 'LIKES' | 'COMMENTS' | 'DURATION' | 'RELEVANCE'
export type FeedSortOrder = 'ASC' | 'DESC'

// Auto Tagging System Types
export interface AutoTagRule {
  id: string;
  name: string;
  description?: string;
  titlePattern?: string;
  descriptionPattern?: string;
  category?: string;
  keywords?: string[];
  isActive: boolean;
  priority: number;
  tags?: Tag[];
}

export interface VideoAnalysis {
  id: string;
  videoId: string;
  titleAnalysis: {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
  };
  descriptionAnalysis: {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
  };
  categoryAnalysis: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  suggestedTags: string[];
  confidenceScore: number;
}

export interface TagSuggestion {
  id: string;
  videoId: string;
  tagId: string;
  tag: Tag;
  confidence: number;
  source: 'auto' | 'manual' | 'ai';
  isAccepted: boolean | null;
  rejectedAt?: Date;
  createdAt: string;
}

// Sync System Types
export interface SyncSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  os?: string;
  browser?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'COMPLETED';
  lastSync?: Date;
  nextSync?: Date;
  itemsSynced: number;
  conflicts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncConflict {
  id: string;
  sessionId: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localData?: any;
  remoteData?: any;
  status: 'PENDING' | 'RESOLVED' | 'IGNORED' | 'MANUAL';
  resolution?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncQueue {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  error?: string;
  scheduledAt: Date;
  executedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Export/Import System Types
export interface ExportJob {
  id: string;
  userId: string;
  name: string;
  description?: string;
  format: 'JSON' | 'CSV' | 'XML' | 'EXCEL' | 'PDF';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  include: {
    collections: boolean;
    feeds: boolean;
    tags: boolean;
    videos: boolean;
    channels: boolean;
    playlists: boolean;
  };
  filters?: any;
  totalItems: number;
  exportedItems: number;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportJob {
  id: string;
  userId: string;
  name: string;
  description?: string;
  format: 'JSON' | 'CSV' | 'XML' | 'YOUTUBE_JSON' | 'OPML';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'VALIDATING';
  filePath: string;
  fileSize: number;
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  mapping?: any;
  report?: any;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataMapping {
  id: string;
  userId: string;
  name: string;
  description?: string;
  sourceFormat: string;
  targetFormat: string;
  mappings: any;
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Notification System Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'NEW_VIDEO' | 'VIDEO_UPDATED' | 'COLLECTION_UPDATED' | 'FEED_UPDATED' | 'TAG_SUGGESTED' | 'SYNC_COMPLETED' | 'SYNC_FAILED' | 'EXPORT_COMPLETED' | 'EXPORT_FAILED' | 'IMPORT_COMPLETED' | 'IMPORT_FAILED' | 'SYSTEM_ALERT' | 'REMINDER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  entityType?: string;
  entityId?: string;
  collectionId?: string;
  isRead: boolean;
  isArchived: boolean;
  channels: any;
  templateId?: string;
  scheduledAt: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: any;
  isActive: boolean;
  isDefault: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  enabled: boolean;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHours?: any;
  preferences: any;
  channels: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationChannel {
  id: string;
  userId: string;
  type: 'EMAIL' | 'PUSH' | 'WEBHOOK' | 'SMS' | 'SLACK' | 'DISCORD';
  name: string;
  config: any;
  isActive: boolean;
  verified: boolean;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

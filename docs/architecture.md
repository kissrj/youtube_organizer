# 🏗️ System Architecture - YouTube Organizer

## Overview

The YouTube Organizer is a modern web application built with Next.js 14, TypeScript, and Prisma, designed to organize and manage YouTube video collections with advanced AI and transcript features.

## 🏛️ General Architecture

### Architectural Pattern
- **Frontend:** React components with custom hooks
- **Backend:** Next.js API Routes (Serverless)
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js with Google OAuth
- **External APIs:** YouTube Data API, OpenAI API

### Data Flow
```
User → Next.js App → API Routes → Prisma → SQLite
                              ↓
                        External APIs
                        (YouTube, OpenAI)
```

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Main dashboard
│   │   ├── collections/          # Collection management
│   │   ├── feeds/                # Feed management
│   │   ├── notifications/        # Notification center
│   │   └── settings/             # Settings
│   ├── api/                      # API Routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Forms
│   ├── modals/                   # Modals and dialogs
│   ├── layout/                   # Layout components
│   └── providers/                # Context providers
├── lib/                          # Utilities and configurations
│   ├── prisma/                   # Prisma client and configurations
│   ├── auth/                     # NextAuth configuration
│   ├── services/                 # Application services
│   │   ├── collections.ts        # Collection service
│   │   ├── feeds.ts              # Feed service
│   │   ├── notifications.ts      # Notification service
│   │   ├── videos.ts             # Video service
│   │   └── youtube.ts            # YouTube API client
│   ├── utils/                    # Utility functions
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # Type definitions
│   └── validations/              # Validation schemas
├── styles/                       # Additional styles
└── middleware.ts                 # Next.js middleware
```

## 🗄️ Data Model

### Main Entities

#### Collection (Collection)
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

  // Relationships
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

#### Video (Video)
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

  // Relationships
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

  // Relationships
  collection: Collection;
}
```

#### Notification (Notification)
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

### Relationships

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

## 🔧 Application Services

### CollectionsService
**Responsibilities:**
- CRUD for collections
- Hierarchy management
- Batch operations
- Data validation
- Statistics and analytics

**Main Methods:**
- `createCollection()` - Create new collection
- `getCollections()` - List collections with filters
- `updateCollection()` - Update collection
- `deleteCollection()` - Delete collection
- `moveCollection()` - Move in hierarchy
- `getCollectionContent()` - Get collection content
- `searchCollections()` - Search collections
- `exportCollections()` - Export data
- `importCollections()` - Import data

### FeedsService
**Responsibilities:**
- RSS/Atom feed management
- Automatic synchronization
- Filtering and sorting
- Content processing

**Main Methods:**
- `createFeed()` - Create new feed
- `getFeed()` - Get feed by ID
- `updateFeed()` - Update feed
- `deleteFeed()` - Delete feed
- `syncFeed()` - Sync content
- `getFeedVideos()` - Get feed videos

### NotificationsService
**Responsibilities:**
- Notification management
- Multi-channel sending
- User preferences
- Notification templates

**Main Methods:**
- `createNotification()` - Create notification
- `getUserNotifications()` - List notifications
- `markAsRead()` - Mark as read
- `archiveNotification()` - Archive notification
- `getUserPreferences()` - Get preferences
- `updatePreferences()` - Update preferences
- `addChannel()` - Add notification channel

### VideosService
**Responsibilities:**
- YouTube API integration
- Metadata processing
- Transcript management
- AI summary generation

**Main Methods:**
- `syncVideo()` - Sync video from YouTube
- `getVideoTranscript()` - Get transcript
- `generateSummary()` - Generate AI summary
- `updateVideoMetadata()` - Update metadata
- `searchVideos()` - Search videos

## 🔐 Authentication and Authorization

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

### Authorization Middleware
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session && request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
```

## 🌐 External APIs

### YouTube Data API v3
**Used endpoints:**
- `videos.list` - Video metadata
- `channels.list` - Channel information
- `playlists.list` - Playlists
- `playlistItems.list` - Playlist items
- `captions.list` - Video transcripts

### OpenAI API
**Used models:**
- `gpt-3.5-turbo` - Summary generation
- `gpt-4` - Advanced analysis (optional)

**Optimized prompts:**
- Concise and structured summaries
- Main points extraction
- Sentiment analysis and topic analysis

## 📊 Cache Strategy

### Redis (Future)
- YouTube metadata cache
- AI summary cache
- Search results cache
- User preferences cache

### In-Memory Cache (Current)
- Configuration cache
- Template cache
- Static data cache

## 🔍 Search Strategy

### Full-Text Search
- Search in titles, descriptions, and tags
- Search by channel and category
- Advanced filters by date, views, etc.

### Relevance Algorithm
- Field weight (title > description > tags)
- Recency and engagement boost
- Boolean and range filters

## 📈 Monitoring and Analytics

### Main Metrics
- Query performance
- API error rates
- Operation response times
- Resource usage

### Tools
- **Vercel Analytics** - Usage metrics
- **Sentry** - Error monitoring
- **DataDog** - Performance monitoring
- **Custom Dashboards** - Specific metrics

## 🚀 Deploy Strategy

### Vercel (Recommended)
- Automatic deploy via Git
- Integrated global CDN
- Optimized serverless functions
- Integrated performance analysis

### Docker (Alternative)
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

## 🔒 Security

### Implemented Measures
- **Input Sanitization:** Validation with Zod
- **Rate Limiting:** Request control
- **CORS:** Proper configuration
- **Security Headers:** Helmet-like
- **Authentication:** JWT with refresh tokens

### Best Practices
- **Least Privilege Principle**
- **Multi-layer Validation**
- **Security Logs**
- **Regular Updates**

## 📚 Code Patterns

### TypeScript
- Strict mode enabled
- Well-defined interfaces
- Generics for reusability
- TypeScript utility types

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// ❌ Bad
interface User {
  id: any;
  name: string;
  email?: string;
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};
```

### React/Next.js
- Server Components when possible
- Client Components when necessary
- Error boundaries for error handling
- Custom hooks for reusable logic

```typescript
// ✅ Good - Server Component
export default function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div>
      {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

// ✅ Good - Custom Hook
function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections().then(setCollections).finally(() => setLoading(false));
  }, []);

  return { collections, loading };
}
```

### Styling
- Tailwind CSS for consistency
- Follow defined design system
- CSS Modules for specific styles
- Mobile-first responsiveness

```typescript
// ✅ Good
export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 🧪 Testing Strategy

### Testing Pyramid
```
E2E Tests (Playwright) - Complete scenarios
  ↑
Integration Tests (Jest) - Workflows and APIs
  ↑
Unit Tests (Jest) - Functions and components
  ↑
Static Analysis (TypeScript, ESLint)
```

### Target Coverage
- **Unit Tests:** 80%+ code coverage
- **Integration Tests:** Main workflows
- **E2E Tests:** Critical user journey

### Tools
- **Jest** - Testing framework
- **React Testing Library** - Component tests
- **Playwright** - E2E tests
- **Mock Service Worker** - API mocks

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

## 📋 Roadmap Technical

### Phase 1 (Current)
- ✅ Base structure with Next.js 14
- ✅ Authentication with NextAuth.js
- ✅ YouTube API integration
- ✅ Basic collection system
- ✅ Responsive interface

### Phase 2 (Next)
- 🔄 Advanced feed system
- 🔄 Real-time notifications
- 🔄 Redis cache
- 🔄 PWA capabilities
- 🔄 Dark/light theme

### Phase 3 (Future)
- 🔄 Microservices
- 🔄 Multi-tenant
- 🔄 Advanced analytics
- 🔄 More platform integrations
- 🔄 Advanced AI with machine learning

---

This architecture provides a solid and scalable foundation for the YouTube Organizer, with focus on performance, maintainability, and user experience.

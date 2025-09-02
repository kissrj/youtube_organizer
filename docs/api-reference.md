# 📚 API Reference - YouTube Organizer

## Overview

The YouTube Organizer API is built with Next.js API Routes, following RESTful principles and GraphQL-like patterns. All routes are protected by authentication and use rigorous data validation.

## 🔐 Authentication

### Required Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Get Token
```http
POST /api/auth/signin/google
```

## 📋 Main Endpoints

### Collections (Collections)

#### GET /api/collections
Lists all user collections.

**Query Parameters:**
- `page` (number): Current page (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term
- `sortBy` (string): Field for sorting (name, createdAt, updatedAt)
- `sortOrder` (string): Order (asc, desc)
- `parentId` (string): Filter by parent collection
- `isPublic` (boolean): Filter by visibility

**Response:**
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
Creates a new collection.

**Request Body:**
```json
{
  "name": "My Collection",
  "description": "Optional description",
  "isPublic": false,
  "parentId": "parent-uuid",
  "position": 0
}
```

**Response:**
```json
{
  "collection": {
    "id": "generated-uuid",
    "name": "My Collection",
    "description": "Optional description",
    "isPublic": false,
    "parentId": "parent-uuid",
    "position": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/collections/[id]
Gets a specific collection.

**Path Parameters:**
- `id` (string): Collection ID

**Response:**
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
Updates a collection.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": true
}
```

#### DELETE /api/collections/[id]
Deletes a collection.

#### POST /api/collections/[id]/videos
Adds videos to a collection.

**Request Body:**
```json
{
  "videoIds": ["youtube-id-1", "youtube-id-2"],
  "position": 0
}
```

#### DELETE /api/collections/[id]/videos
Removes videos from a collection.

**Request Body:**
```json
{
  "videoIds": ["youtube-id-1", "youtube-id-2"]
}
```

#### POST /api/collections/[id]/channels
Adds channels to a collection.

**Request Body:**
```json
{
  "channelIds": ["channel-id-1", "channel-id-2"]
}
```

#### POST /api/collections/[id]/playlists
Adds playlists to a collection.

**Request Body:**
```json
{
  "playlistIds": ["playlist-id-1", "playlist-id-2"]
}
```

### Feeds

#### GET /api/feeds
Lists all feeds.

**Query Parameters:**
- `collectionId` (string): Filter by collection
- `isActive` (boolean): Filter by status

#### POST /api/feeds
Creates a new feed.

**Request Body:**
```json
{
  "collectionId": "collection-uuid",
  "title": "Technology Feed",
  "description": "Videos about technology",
  "filters": "{\"categories\": [\"tech\", \"programming\"]}",
  "sortBy": "publishedAt",
  "sortOrder": "desc",
  "limit": 50,
  "isActive": true
}
```

#### GET /api/feeds/[id]
Gets a specific feed.

#### PUT /api/feeds/[id]
Updates a feed.

#### DELETE /api/feeds/[id]
Deletes a feed.

#### POST /api/feeds/[id]/sync
Syncs feed content.

### Videos (Videos)

#### GET /api/videos
Searches videos with advanced filters.

**Query Parameters:**
- `q` (string): Search term
- `channelId` (string): Filter by channel
- `collectionId` (string): Filter by collection
- `publishedAfter` (string): Initial publication date (ISO 8601)
- `publishedBefore` (string): Final publication date (ISO 8601)
- `minViewCount` (number): Minimum views
- `maxViewCount` (number): Maximum views
- `sortBy` (string): Sorting field
- `sortOrder` (string): Order (asc, desc)
- `page` (number): Page
- `limit` (number): Items per page

**Response:**
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
Gets details of a specific video.

**Path Parameters:**
- `youtubeId` (string): YouTube video ID

#### POST /api/videos/[youtubeId]/sync
Syncs video metadata with YouTube.

#### GET /api/videos/[youtubeId]/transcript
Gets video transcript.

**Query Parameters:**
- `language` (string): Transcript language (default: 'en')

#### POST /api/videos/[youtubeId]/summary
Generates AI summary of video.

**Request Body:**
```json
{
  "model": "gpt-3.5-turbo",
  "maxLength": 500,
  "includeTimestamps": true
}
```

### Notifications (Notifications)

#### GET /api/notifications
Lists user notifications.

**Query Parameters:**
- `isRead` (boolean): Filter by read status
- `isArchived` (boolean): Filter by archive status
- `type` (string): Filter by type
- `priority` (string): Filter by priority
- `page` (number): Page
- `limit` (number): Items per page

#### POST /api/notifications
Creates a new notification.

**Request Body:**
```json
{
  "title": "New notification",
  "message": "Notification content",
  "type": "info",
  "priority": "normal",
  "entityType": "collection",
  "entityId": "entity-uuid",
  "collectionId": "collection-uuid",
  "channels": ["email", "push"],
  "scheduledAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z"
}
```

#### PUT /api/notifications/[id]/read
Marks notification as read.

#### PUT /api/notifications/[id]/archive
Archives notification.

#### DELETE /api/notifications/[id]
Deletes notification.

#### GET /api/notifications/preferences
Gets user notification preferences.

#### PUT /api/notifications/preferences
Updates notification preferences.

**Request Body:**
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

### Channels (Channels)

#### GET /api/channels
Searches YouTube channels.

**Query Parameters:**
- `q` (string): Search term
- `maxResults` (number): Maximum results (default: 20)

#### GET /api/channels/[channelId]
Gets details of a specific channel.

#### POST /api/channels/[channelId]/sync
Syncs channel information.

### Playlists

#### GET /api/playlists
Searches YouTube playlists.

**Query Parameters:**
- `channelId` (string): Channel ID
- `q` (string): Search term
- `maxResults` (number): Maximum results

#### GET /api/playlists/[playlistId]
Gets details of a specific playlist.

#### GET /api/playlists/[playlistId]/videos
Gets videos from a playlist.

#### POST /api/playlists/[playlistId]/sync
Syncs playlist content.

## 📊 Webhooks

### YouTube Webhook
```http
POST /api/webhooks/youtube
Content-Type: application/json
X-Hub-Signature: sha1=<signature>
```

**Request Body:**
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

### Limits per Endpoint
- **GET /api/collections**: 1000 req/hour
- **POST /api/collections**: 100 req/hour
- **GET /api/videos**: 2000 req/hour
- **POST /api/videos/sync**: 50 req/hour
- **GET /api/notifications**: 500 req/hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🚨 Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error

### Error Structure
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "name",
      "reason": "Required field"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid data
- `AUTHENTICATION_ERROR`: Authentication problem
- `AUTHORIZATION_ERROR`: No permission
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Data conflict
- `RATE_LIMIT_ERROR`: Request limit exceeded
- `EXTERNAL_API_ERROR`: External API error
- `DATABASE_ERROR`: Database error

## 🔧 SDKs and Libraries

### JavaScript/TypeScript SDK
```typescript
import { YouTubeOrganizer } from 'youtube-organizer-sdk';

const client = new YouTubeOrganizer({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.youtube-organizer.com'
});

// Example usage
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

# Example usage
collections = client.collections.list(page=1, limit=20)
```

## 📈 Limits and Quotas

### API Limits
- **Requests per hour**: 10,000 (authenticated)
- **Requests per day**: 100,000 (authenticated)
- **Maximum upload size**: 10MB
- **Request timeout**: 30 seconds

### YouTube Limits
- **Videos per search**: 50 maximum
- **Transcripts**: Limited by availability
- **YouTube rate limit**: 10,000 units per day

## 🔒 Security

### HTTPS Only
All requests must use HTTPS.

### Input Validation
- Automatic input sanitization
- Schema validation with Zod
- SQL injection protection
- XSS protection

### Security Logs
- All requests are logged
- Unauthorized access attempts
- Critical changes are audited

## 📞 Support

### Support Channels
- **Email**: api-support@youtube-organizer.com
- **Discord**: https://discord.gg/youtube-organizer
- **GitHub Issues**: https://github.com/youtube-organizer/api/issues

### SLA
- **Availability**: 99.9%
- **Response time**: < 200ms (average)
- **Support**: 24/7 for premium plans

---

For more details on specific implementation or code examples, consult the complete documentation at [docs.youtube-organizer.com](https://docs.youtube-organizer.com).

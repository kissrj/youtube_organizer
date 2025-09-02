# 🔧 Troubleshooting Guide - YouTube Organizer

## Overview

This guide helps diagnose and resolve common problems in YouTube Organizer. It is organized by category and includes step-by-step solutions for the most frequent problems.

## 🚀 Initialization Problems

### Application Does Not Start

#### Symptoms
- Error when running `npm run dev`
- Port 3000 already in use
- Dependency errors

#### Solutions

**1. Check Available Port**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process using the port (Windows)
taskkill /PID <PID> /F

# Or use alternative port
npm run dev -- -p 3001
```

**2. Clean Cache and Node Modules**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

**3. Check Node.js Version**
```bash
# Check version
node --version
npm --version

# If incorrect version, install Node.js 18+
# Windows: https://nodejs.org/
# macOS: brew install node
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

#### Common Error Logs
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Free port 3000 or use alternative port

```bash
Error: Cannot find module 'next'
```
**Solution:** Reinstall dependencies with `npm install`

### Database Does Not Connect

#### Symptoms
- Prisma connection error
- Migrations not applied
- Data not saved

#### Solutions

**1. Check .env File**
```env
# .env
DATABASE_URL="file:./dev.db"
```

**2. Apply Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma db push

# Reset database (caution: loses data)
npx prisma migrate reset
```

**3. Check Permissions**
```bash
# Linux/Mac
chmod 644 dev.db

# Windows - check folder permissions
```

## 🔐 Authentication Problems

### Login Does Not Work

#### Symptoms
- Error logging in with Google
- Incorrect redirection
- Session not maintained

#### Solutions

**1. Check OAuth Configuration**
```env
# .env.local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**2. Configure Google OAuth**
1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Activate Google+ API and YouTube Data API v3
4. Configure OAuth 2.0 credentials
5. Add URI: `http://localhost:3000/api/auth/callback/google`

**3. Clear Cookies and Cache**
```javascript
// In browser: F12 > Application > Storage > Clear
// Or: Ctrl+Shift+Delete (Chrome)
```

**4. Check Server Logs**
```bash
npm run dev
# Check console for authentication errors
```

### Session Expires Frequently

#### Possible Causes
- Incorrect NEXTAUTH_SECRET
- Blocked cookies
- Incorrect domain configuration

#### Solutions
```javascript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'database', // or 'jwt'
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

## 📺 YouTube API Problems

### Videos Do Not Load

#### Symptoms
- Error adding videos
- Metadata not loading
- Transcripts unavailable

#### Solutions

**1. Check API Key**
```env
# .env.local
YOUTUBE_API_KEY="your-youtube-api-key"
```

**2. Configure YouTube API**
1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Activate YouTube Data API v3
3. Create API key
4. Configure restrictions (optional)

**3. Check API Quota**
```javascript
// Check quota usage
// Google Cloud Dashboard > APIs & Services > YouTube Data API v3
```

**4. Error Handling**
```typescript
// lib/services/videos.ts
export async function getVideoMetadata(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,statistics`
    );

    if (response.status === 403) {
      throw new Error('YouTube API quota exceeded');
    }

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}
```

### Transcripts Not Available

#### Causes
- Video has no captions
- Unsupported language
- Very long video

#### Checks
```typescript
// Check transcript availability
const captionsResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`
);

if (captionsResponse.ok) {
  const captions = await captionsResponse.json();
  // Process available captions
}
```

## 🔄 Synchronization Problems

### Feeds Do Not Update

#### Symptoms
- New videos do not appear
- Manual sync fails
- Timeout errors

#### Solutions

**1. Check Feed Configuration**
```typescript
// Check if feed is active
const feed = await prisma.collectionFeed.findUnique({
  where: { id: feedId }
});

if (!feed.isActive) {
  throw new Error('Feed is disabled');
}
```

**2. Test Manual Sync**
```bash
# In browser console
fetch('/api/feeds/{feedId}/sync', { method: 'POST' })
  .then(response => response.json())
  .then(data => console.log(data));
```

**3. Check Sync Logs**
```typescript
// Add detailed logging
console.log('Starting feed sync:', feedId);
console.log('Fetching videos since:', lastFetched);

// ... sync logic

console.log('Sync completed:', {
  newVideos: newVideos.length,
  errors: errors.length
});
```

**4. Optimize Performance**
```typescript
// Implement batch processing
const batchSize = 50;
for (let i = 0; i < videoIds.length; i += batchSize) {
  const batch = videoIds.slice(i, i + batchSize);
  await processBatch(batch);
  await delay(100); // Avoid rate limiting
}
```

## 🔔 Notification Problems

### Notifications Do Not Arrive

#### Symptoms
- Emails not sent
- Push notifications not appearing
- Delayed notifications

#### Solutions

**1. Check Email Configuration**
```env
# .env.local
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@youtube-organizer.com
```

**2. Test SMTP Connection**
```javascript
// Basic email test
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP configuration error:', error);
  } else {
    console.log('SMTP configured correctly');
  }
});
```

**3. Check User Preferences**
```typescript
// Check if notifications are enabled
const preferences = await prisma.notificationPreference.findUnique({
  where: { userId }
});

if (!preferences.emailEnabled) {
  console.log('Email notifications disabled');
}
```

**4. Check Spam/Junk Folder**
- Add domain to safe contacts
- Configure SPF/DKIM records
- Use professional email service

### Push Notifications Do Not Work

#### Checks
1. **Browser permissions**
   - Check if notifications are allowed
   - Reset permissions if necessary

2. **Service Worker**
   ```javascript
   // Check if SW is registered
   navigator.serviceWorker.getRegistrations()
     .then(registrations => console.log(registrations));
   ```

3. **Firebase Configuration**
   ```env
   # .env.local
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

## 🗄️ Database Problems

### Connection Errors

#### Symptoms
- Queries fail
- Connection timeout
- Corrupted data

#### Solutions

**1. Check Connection**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**2. Optimize Queries**
```typescript
// Avoid N+1 queries
const collections = await prisma.collection.findMany({
  include: {
    videos: {
      include: {
        video: true, // Avoid additional query
      },
    },
  },
});
```

**3. Implement Connection Pooling**
```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

### Corrupted Data

#### Recovery
```bash
# Make backup
cp dev.db dev.db.backup

# Reset database
npx prisma migrate reset

# Restore essential data
# (implement recovery script)
```

## 🚀 Performance Problems

### Slow Application

#### Diagnosis

**1. Check Bundle Size**
```bash
npm run build
# Check bundle size in .next/static
```

**2. Optimize Images**
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

export default nextConfig;
```

**3. Implement Caching**
```typescript
// lib/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

**4. Optimize Database Queries**
```typescript
// Add indexes
// prisma/schema.prisma
model Collection {
  // ... other fields
  @@index([userId, createdAt])
  @@index([name])
}
```

### Insufficient Memory

#### Solutions
```javascript
// Check memory usage
console.log(process.memoryUsage());

// Optimize large objects
const videos = await getVideos();
const optimizedVideos = videos.map(video => ({
  id: video.id,
  title: video.title,
  // Remove large fields
}));
```

## 🌐 Network Problems

### API Calls Fail

#### Diagnosis
```typescript
// Add interceptors for debugging
import axios from 'axios';

axios.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url);
  return request;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

#### Implement Retry Logic
```typescript
// lib/api-client.ts
export async function apiRequest(url: string, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();

      if (response.status >= 500) {
        // Retry for server errors
        await delay(Math.pow(2, i) * 1000);
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

### CORS Errors

#### Configuration
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 📱 Mobile/Responsiveness Problems

### Broken Interface on Mobile

#### Checks
1. **Viewport Meta Tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Responsive CSS**
   ```css
   /* Check media queries */
   @media (max-width: 768px) {
     .container { padding: 1rem; }
   }
   ```

3. **Test on Real Devices**
   ```bash
   # Use Chrome DevTools Device Mode
   # Or test on real devices
   ```

### Touch Does Not Work

#### Solutions
```typescript
// Add appropriate event listeners
useEffect(() => {
  const handleTouch = (e: TouchEvent) => {
    // Handle touch events
  };

  element.addEventListener('touchstart', handleTouch);
  return () => element.removeEventListener('touchstart', handleTouch);
}, []);
```

## 🔧 Development Problems

### Hot Reload Does Not Work

#### Solutions
```bash
# Clean Next.js cache
rm -rf .next

# Check if files are being watched
# Windows: check antivirus
# macOS/Linux: check inotify limits
```

### TypeScript Errors

#### Useful Commands
```bash
# Check types
npm run type-check

# Generate types automatically
npx tsc --noEmit

# Check dependency types
npx tsc --noEmit --skipLibCheck
```

### ESLint Errors

#### Configuration
```javascript
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 📊 Monitoring and Logs

### Implement Logging

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Application started', { port: 3000 });
logger.error('API error', { error: error.message, stack: error.stack });
```

### Performance Monitoring

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: Function) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

// Usage
const data = measurePerformance('Database Query', () =>
  prisma.collection.findMany()
);
```

## 🚨 Contact and Support

### When to Ask for Help

**Community Support**
- [GitHub Issues](https://github.com/youtube-organizer/issues)
- [Discord Community](https://discord.gg/youtube-organizer)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/youtube-organizer)

**Premium Support**
- Email: `support@youtube-organizer.com`
- Live chat (24/7)
- Phone: +1 (555) 123-4567

### Information for Bug Reports

```markdown
**Problem Description:**
[Detailed description]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Current Behavior:**
[What is happening]

**Environment:**
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Firefox/Safari]
- Node.js: [version]
- YouTube Organizer: [version]

**Error Logs:**
[Include relevant logs]

**Screenshots:**
[Attach screenshots if applicable]
```

---

## 📝 Troubleshooting Checklist

### Before Reporting a Problem
- [ ] Reproduced the problem in clean environment
- [ ] Checked browser console logs
- [ ] Tested in different browsers
- [ ] Checked internet connection
- [ ] Cleared cache and cookies
- [ ] Tested in incognito mode
- [ ] Checked Node.js version
- [ ] Updated dependencies

### Essential Information for Support
- YouTube Organizer version
- Operating system and version
- Browser and version
- Complete error logs
- Exact steps to reproduce
- Expected vs current behavior

Following this guide systematically, most problems can be resolved quickly. For complex issues, our support team is always ready to help!

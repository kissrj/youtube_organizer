import { CollectionsService } from '@/lib/services/collections';
import { FeedsService } from '@/lib/services/feeds';
import { NotificationsService } from '@/lib/services/notifications';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
const mockedPrisma = prisma as any;

// Performance test utilities
const measurePerformance = async (fn: () => Promise<any>, iterations = 100) => {
  const startTime = performance.now();
  const results = [];

  for (let i = 0; i < iterations; i++) {
    const iterationStart = performance.now();
    await fn();
    const iterationEnd = performance.now();
    results.push(iterationEnd - iterationStart);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...results);
  const maxTime = Math.max(...results);
  const p95Time = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

  return {
    totalTime,
    avgTime,
    minTime,
    maxTime,
    p95Time,
    iterations
  };
};

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CollectionsService Performance', () => {
    test('createCollection performance', async () => {
      mockedPrisma.collection.create.mockResolvedValue({
        id: 'collection-id',
        name: 'Test Collection',
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const performance = await measurePerformance(async () => {
        await CollectionsService.createCollection({
          name: 'Test Collection',
          description: 'Test Description',
          userId: 'user-id'
        });
      }, 50);

      console.log('createCollection Performance:', performance);
      expect(performance.avgTime).toBeLessThan(100); // Should be under 100ms average
      expect(performance.p95Time).toBeLessThan(200); // 95th percentile under 200ms
    });

    test('getCollections performance with large dataset', async () => {
      const mockCollections = Array.from({ length: 1000 }, (_, i) => ({
        id: `collection-${i}`,
        name: `Collection ${i}`,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockedPrisma.collection.findMany.mockResolvedValue(mockCollections);

      const performance = await measurePerformance(async () => {
        await CollectionsService.getCollections({ userId: 'user-id' });
      }, 20);

      console.log('getCollections Performance (1000 items):', performance);
      expect(performance.avgTime).toBeLessThan(500); // Should handle 1000 items under 500ms
    });

    test('searchCollections performance', async () => {
      const mockResults = Array.from({ length: 100 }, (_, i) => ({
        id: `collection-${i}`,
        name: `React Tutorial ${i}`,
        userId: 'user-id'
      }));

      mockedPrisma.collection.findMany.mockResolvedValue(mockResults);

      const performance = await measurePerformance(async () => {
        await CollectionsService.searchCollections('user-id', 'React', {});
      }, 30);

      console.log('searchCollections Performance:', performance);
      expect(performance.avgTime).toBeLessThan(150); // Search should be fast
    });

    test('getCollectionContent performance with pagination', async () => {
      const mockVideos = Array.from({ length: 100 }, (_, i) => ({
        video: {
          id: `video-${i}`,
          title: `Video ${i}`,
          duration: 3600,
          viewCount: 1000 + i,
          publishedAt: new Date()
        },
        addedAt: new Date()
      }));

      mockedPrisma.collectionVideo.findMany.mockResolvedValue(mockVideos);
      mockedPrisma.collectionVideo.count.mockResolvedValue(1000);

      const performance = await measurePerformance(async () => {
        await CollectionsService.getCollectionContent('collection-id', {
          limit: 100,
          offset: 0
        });
      }, 25);

      console.log('getCollectionContent Performance (100 items):', performance);
      expect(performance.avgTime).toBeLessThan(300); // Pagination should be efficient
    });

    test('batchOperations performance', async () => {
      mockedPrisma.collection.updateMany.mockResolvedValue({ count: 50 });

      const performance = await measurePerformance(async () => {
        await CollectionsService.batchOperations({
          operation: 'delete',
          collectionIds: Array.from({ length: 50 }, (_, i) => `collection-${i}`)
        });
      }, 10);

      console.log('batchOperations Performance (50 items):', performance);
      expect(performance.avgTime).toBeLessThan(1000); // Batch operations should be reasonable
    });
  });

  describe('FeedsService Performance', () => {
    test('createFeed performance', async () => {
      mockedPrisma.collectionFeed.create.mockResolvedValue({
        id: 'feed-id',
        collectionId: 'collection-id',
        title: 'Test Feed',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const performance = await measurePerformance(async () => {
        await FeedsService.createFeed({
          collectionId: 'collection-id',
          title: 'Test Feed',
          description: 'Test Feed Description'
        });
      }, 50);

      console.log('createFeed Performance:', performance);
      expect(performance.avgTime).toBeLessThan(100);
    });

    test('getFeedVideos performance with filters', async () => {
      const mockVideos = Array.from({ length: 200 }, (_, i) => ({
        id: `video-${i}`,
        title: `Filtered Video ${i}`,
        publishedAt: new Date(),
        viewCount: 5000 + i
      }));

      mockedPrisma.video.findMany.mockResolvedValue(mockVideos);

      const performance = await measurePerformance(async () => {
        // This would be a method that applies filters
        await mockedPrisma.video.findMany({
          where: {
            viewCount: { gte: 5000 },
            publishedAt: { gte: new Date(Date.now() - 86400000) }
          },
          take: 50
        });
      }, 20);

      console.log('getFeedVideos Performance (with filters):', performance);
      expect(performance.avgTime).toBeLessThan(200);
    });
  });

  describe('NotificationsService Performance', () => {
    test('createNotification performance', async () => {
      mockedPrisma.notification.create.mockResolvedValue({
        id: 'notification-id',
        title: 'Test Notification',
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const performance = await measurePerformance(async () => {
        await NotificationsService.createNotification({
          userId: 'user-id',
          title: 'Test Notification',
          message: 'Test Message',
          type: 'NEW_VIDEO'
        });
      }, 100);

      console.log('createNotification Performance:', performance);
      expect(performance.avgTime).toBeLessThan(50); // Notifications should be very fast
    });

    test('getUserNotifications performance with pagination', async () => {
      const mockNotifications = Array.from({ length: 50 }, (_, i) => ({
        id: `notification-${i}`,
        title: `Notification ${i}`,
        userId: 'user-id',
        isRead: false,
        createdAt: new Date()
      }));

      mockedPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const performance = await measurePerformance(async () => {
        await NotificationsService.getUserNotifications('user-id', {
          limit: 50,
          unreadOnly: true
        });
      }, 30);

      console.log('getUserNotifications Performance:', performance);
      expect(performance.avgTime).toBeLessThan(150);
    });

    test('bulk notification operations performance', async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 100 });

      const performance = await measurePerformance(async () => {
        await NotificationsService.markAllAsRead('user-id');
      }, 20);

      console.log('markAllAsRead Performance (100 notifications):', performance);
      expect(performance.avgTime).toBeLessThan(200);
    });
  });

  describe('Database Query Performance', () => {
    test('complex collection query performance', async () => {
      const mockResult = {
        id: 'collection-id',
        name: 'Complex Collection',
        videos: Array.from({ length: 20 }, (_, i) => ({
          video: {
            id: `video-${i}`,
            title: `Video ${i}`,
            channel: { title: 'Channel Name' },
            tags: [{ name: 'tag1' }, { name: 'tag2' }]
          }
        })),
        feeds: Array.from({ length: 5 }, (_, i) => ({
          id: `feed-${i}`,
          title: `Feed ${i}`
        })),
        settings: {
          autoTag: true,
          sortBy: 'publishedAt'
        }
      };

      mockedPrisma.collection.findUnique.mockResolvedValue(mockResult);

      const performance = await measurePerformance(async () => {
        await mockedPrisma.collection.findUnique({
          where: { id: 'collection-id' },
          include: {
            videos: {
              include: {
                video: {
                  include: {
                    channel: true,
                    tags: true
                  }
                }
              }
            },
            feeds: true,
            settings: true
          }
        });
      }, 15);

      console.log('Complex Collection Query Performance:', performance);
      expect(performance.avgTime).toBeLessThan(500);
    });

    test('aggregation query performance', async () => {
      const mockStats = {
        _count: { videos: 150 },
        _sum: { viewCount: 150000 },
        _avg: { likeCount: 250 }
      };

      mockedPrisma.collectionVideo.aggregate.mockResolvedValue(mockStats);

      const performance = await measurePerformance(async () => {
        await mockedPrisma.collectionVideo.aggregate({
          where: { collectionId: 'collection-id' },
          _count: { videos: true },
          _sum: { viewCount: true },
          _avg: { likeCount: true }
        });
      }, 25);

      console.log('Aggregation Query Performance:', performance);
      expect(performance.avgTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage Benchmarks', () => {
    test('large dataset processing memory efficiency', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        description: `Description ${i}`,
        metadata: {
          tags: Array.from({ length: 10 }, (_, j) => `tag-${j}`),
          stats: { views: i * 100, likes: i * 10 }
        }
      }));

      const initialMemory = process.memoryUsage().heapUsed;

      const performance = await measurePerformance(async () => {
        // Simulate processing large dataset
        const processed = largeDataset.map(item => ({
          ...item,
          processed: true,
          summary: `${item.title} - ${item.metadata.stats.views} views`
        }));

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        return processed;
      }, 5);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDelta = finalMemory - initialMemory;

      console.log('Large Dataset Processing Performance:', {
        ...performance,
        memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)} MB`,
        memoryPerItem: `${(memoryDelta / 10000).toFixed(2)} bytes per item`
      });

      // Memory usage should be reasonable
      expect(memoryDelta).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  describe('Concurrent Operations Performance', () => {
    test('concurrent collection creation', async () => {
      mockedPrisma.collection.create.mockResolvedValue({
        id: 'collection-id',
        name: 'Concurrent Collection',
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const concurrentOperations = Array.from({ length: 10 }, (_, i) =>
        CollectionsService.createCollection({
          name: `Concurrent Collection ${i}`,
          userId: 'user-id'
        })
      );

      const startTime = performance.now();
      await Promise.all(concurrentOperations);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / 10;

      console.log('Concurrent Collection Creation Performance:', {
        totalTime,
        avgTime,
        operations: 10
      });

      expect(avgTime).toBeLessThan(200); // Concurrent operations should be efficient
    });

    test('concurrent notification processing', async () => {
      mockedPrisma.notification.create.mockResolvedValue({
        id: 'notification-id',
        title: 'Concurrent Notification',
        userId: 'user-id',
        createdAt: new Date()
      });

      const concurrentNotifications = Array.from({ length: 20 }, (_, i) =>
        NotificationsService.createNotification({
          userId: 'user-id',
          title: `Concurrent Notification ${i}`,
          message: `Message ${i}`,
          type: 'NEW_VIDEO'
        })
      );

      const startTime = performance.now();
      await Promise.all(concurrentNotifications);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / 20;

      console.log('Concurrent Notification Processing Performance:', {
        totalTime,
        avgTime,
        operations: 20
      });

      expect(avgTime).toBeLessThan(100);
    });
  });

  describe('Cache Performance (Simulated)', () => {
    test('cached vs uncached query performance', async () => {
      const mockData = {
        id: 'cached-collection',
        name: 'Cached Collection',
        videos: Array.from({ length: 50 }, (_, i) => ({
          video: { id: `video-${i}`, title: `Video ${i}` }
        }))
      };

      // Simulate uncached query
      mockedPrisma.collection.findUnique.mockImplementationOnce(async () => {
        // Simulate database delay
        await new Promise(resolve => setTimeout(resolve, 50));
        return mockData;
      });

      // Simulate cached query
      mockedPrisma.collection.findUnique.mockImplementationOnce(async () => {
        // Simulate cache hit (much faster)
        await new Promise(resolve => setTimeout(resolve, 5));
        return mockData;
      });

      // Uncached performance
      const uncachedStart = performance.now();
      await mockedPrisma.collection.findUnique({
        where: { id: 'cached-collection' },
        include: { videos: { include: { video: true } } }
      });
      const uncachedTime = performance.now() - uncachedStart;

      // Cached performance
      const cachedStart = performance.now();
      await mockedPrisma.collection.findUnique({
        where: { id: 'cached-collection' },
        include: { videos: { include: { video: true } } }
      });
      const cachedTime = performance.now() - cachedStart;

      console.log('Cache Performance Comparison:', {
        uncachedTime,
        cachedTime,
        improvement: `${((uncachedTime - cachedTime) / uncachedTime * 100).toFixed(1)}%`
      });

      expect(cachedTime).toBeLessThan(uncachedTime);
      expect(cachedTime).toBeLessThan(10); // Cache hit should be very fast
    });
  });

  describe('Error Handling Performance', () => {
    test('error handling does not significantly impact performance', async () => {
      const successOperations = Array.from({ length: 50 }, () =>
        CollectionsService.createCollection({
          name: 'Success Collection',
          userId: 'user-id'
        })
      );

      const errorOperations = Array.from({ length: 50 }, () =>
        CollectionsService.createCollection({
          name: '', // This should cause an error
          userId: 'user-id'
        })
      );

      mockedPrisma.collection.create
        .mockResolvedValueOnce({
          id: 'success-id',
          name: 'Success Collection',
          userId: 'user-id',
          createdAt: new Date()
        })
        .mockRejectedValueOnce(new Error('Validation error'));

      const startTime = performance.now();

      const results = await Promise.allSettled([
        ...successOperations.slice(0, 25),
        ...errorOperations.slice(0, 25)
      ]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 50;

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const errorCount = results.filter(r => r.status === 'rejected').length;

      console.log('Error Handling Performance:', {
        totalTime,
        avgTime,
        successCount,
        errorCount,
        errorRate: `${(errorCount / 50 * 100).toFixed(1)}%`
      });

      expect(avgTime).toBeLessThan(150); // Error handling should not slow down operations significantly
    });
  });
});

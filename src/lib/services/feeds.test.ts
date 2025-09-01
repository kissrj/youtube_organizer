import { FeedsService } from '@/lib/services/feeds';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
const mockedPrisma = prisma as any;

describe('FeedsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeed', () => {
    it('deve criar um novo feed', async () => {
      const mockFeed = {
        id: 'feed-id',
        title: 'Test Feed',
        description: 'Test Description',
        collectionId: 'collection-id',
        sortBy: 'RECENT',
        sortOrder: 'DESC',
        limit: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        collection: {
          id: 'collection-id',
          name: 'Test Collection'
        }
      };

      mockedPrisma.collectionFeed.create.mockResolvedValue(mockFeed);

      const result = await FeedsService.createFeed({
        collectionId: 'collection-id',
        title: 'Test Feed',
        description: 'Test Description'
      });

      expect(result).toEqual(mockFeed);
      expect(mockedPrisma.collectionFeed.create).toHaveBeenCalledWith({
        data: {
          collectionId: 'collection-id',
          title: 'Test Feed',
          description: 'Test Description',
          filters: null,
          sortBy: 'RECENT',
          sortOrder: 'DESC',
          limit: 20
        },
        include: {
          collection: {
            select: { id: true, name: true }
          }
        }
      });
    });

    it('deve criar feed com filtros', async () => {
      const filters = {
        channels: ['channel1', 'channel2'],
        tags: ['tag1', 'tag2']
      };

      mockedPrisma.collectionFeed.create.mockResolvedValue({
        id: 'feed-id',
        filters: JSON.stringify(filters)
      });

      await FeedsService.createFeed({
        collectionId: 'collection-id',
        title: 'Test Feed',
        filters
      });

      expect(mockedPrisma.collectionFeed.create).toHaveBeenCalledWith({
        data: {
          collectionId: 'collection-id',
          title: 'Test Feed',
          description: undefined,
          filters: JSON.stringify(filters),
          sortBy: 'RECENT',
          sortOrder: 'DESC',
          limit: 20
        },
        include: {
          collection: {
            select: { id: true, name: true }
          }
        }
      });
    });
  });

  describe('getFeed', () => {
    it('deve retornar feed por ID', async () => {
      const mockFeed = {
        id: 'feed-id',
        title: 'Test Feed',
        filters: JSON.stringify({ channels: ['channel1'] }),
        collection: {
          id: 'collection-id',
          name: 'Test Collection'
        }
      };

      mockedPrisma.collectionFeed.findUnique.mockResolvedValue(mockFeed);

      const result = await FeedsService.getFeed('feed-id');

      expect(result).toEqual({
        ...mockFeed,
        filters: { channels: ['channel1'] }
      });
    });

    it('deve retornar null para feed inexistente', async () => {
      mockedPrisma.collectionFeed.findUnique.mockResolvedValue(null);

      const result = await FeedsService.getFeed('non-existent-feed');

      expect(result).toBeNull();
    });
  });

  describe('getFeedVideos', () => {
    it('deve retornar vídeos do feed', async () => {
      const mockFeed = {
        id: 'feed-id',
        filters: JSON.stringify({
          channels: ['channel1', 'channel2'],
          tags: ['tag1', 'tag2']
        }),
        sortBy: 'VIEWS',
        sortOrder: 'DESC'
      };

      const mockVideos = [
        {
          id: 'video1',
          title: 'Video 1',
          description: 'Description 1',
          duration: '300',
          viewCount: 1000,
          likeCount: 100,
          commentCount: 10,
          publishedAt: new Date(),
          channel: {
            id: 'channel1',
            title: 'Test Channel',
            thumbnailUrl: 'http://example.com/thumb.jpg'
          },
          tags: []
        }
      ];

      // Mock getFeed
      const getFeedSpy = jest.spyOn(FeedsService, 'getFeed');
      getFeedSpy.mockResolvedValue(mockFeed);

      mockedPrisma.video.findMany.mockResolvedValue(mockVideos);
      mockedPrisma.video.count.mockResolvedValue(1);

      const result = await FeedsService.getFeedVideos('feed-id', 1, 20);

      expect(result).toEqual({
        videos: mockVideos,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1
        }
      });

      expect(mockedPrisma.video.findMany).toHaveBeenCalledWith({
        where: {
          channelId: { in: ['channel1', 'channel2'] },
          tags: {
            some: {
              name: { in: ['tag1', 'tag2'] }
            }
          }
        },
        orderBy: { viewCount: 'DESC' },
        skip: 0,
        take: 20,
        include: {
          channel: {
            select: { id: true, title: true, thumbnailUrl: true }
          },
          tags: {
            select: { id: true, name: true }
          }
        }
      });

      getFeedSpy.mockRestore();
    });

    it('deve aplicar filtros de duração', async () => {
      const mockFeed = {
        id: 'feed-id',
        filters: JSON.stringify({
          duration: { min: 300, max: 600 }
        }),
        sortBy: 'RECENT',
        sortOrder: 'DESC'
      };

      const getFeedSpy = jest.spyOn(FeedsService, 'getFeed');
      getFeedSpy.mockResolvedValue(mockFeed);

      mockedPrisma.video.findMany.mockResolvedValue([]);
      mockedPrisma.video.count.mockResolvedValue(0);

      await FeedsService.getFeedVideos('feed-id', 1, 20);

      expect(mockedPrisma.video.findMany).toHaveBeenCalledWith({
        where: {
          duration: {
            gte: 300,
            lte: 600
          }
        },
        orderBy: { publishedAt: 'DESC' },
        skip: 0,
        take: 20,
        include: {
          channel: {
            select: { id: true, title: true, thumbnailUrl: true }
          },
          tags: {
            select: { id: true, name: true }
          }
        }
      });

      getFeedSpy.mockRestore();
    });

    it('deve aplicar filtros de data', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      const mockFeed = {
        id: 'feed-id',
        filters: JSON.stringify({
          dateRange: { start: startDate, end: endDate }
        }),
        sortBy: 'RECENT',
        sortOrder: 'DESC'
      };

      const getFeedSpy = jest.spyOn(FeedsService, 'getFeed');
      getFeedSpy.mockResolvedValue(mockFeed);

      mockedPrisma.video.findMany.mockResolvedValue([]);
      mockedPrisma.video.count.mockResolvedValue(0);

      await FeedsService.getFeedVideos('feed-id', 1, 20);

      expect(mockedPrisma.video.findMany).toHaveBeenCalledWith({
        where: {
          publishedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { publishedAt: 'DESC' },
        skip: 0,
        take: 20,
        include: {
          channel: {
            select: { id: true, title: true, thumbnailUrl: true }
          },
          tags: {
            select: { id: true, name: true }
          }
        }
      });

      getFeedSpy.mockRestore();
    });

    it('deve aplicar filtros de busca', async () => {
      const mockFeed = {
        id: 'feed-id',
        filters: JSON.stringify({
          searchQuery: 'test query'
        }),
        sortBy: 'RECENT',
        sortOrder: 'DESC'
      };

      const getFeedSpy = jest.spyOn(FeedsService, 'getFeed');
      getFeedSpy.mockResolvedValue(mockFeed);

      mockedPrisma.video.findMany.mockResolvedValue([]);
      mockedPrisma.video.count.mockResolvedValue(0);

      await FeedsService.getFeedVideos('feed-id', 1, 20);

      expect(mockedPrisma.video.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test query', mode: 'insensitive' } },
            { description: { contains: 'test query', mode: 'insensitive' } }
          ]
        },
        orderBy: { publishedAt: 'DESC' },
        skip: 0,
        take: 20,
        include: {
          channel: {
            select: { id: true, title: true, thumbnailUrl: true }
          },
          tags: {
            select: { id: true, name: true }
          }
        }
      });

      getFeedSpy.mockRestore();
    });

    it('deve lançar erro para feed inexistente', async () => {
      const getFeedSpy = jest.spyOn(FeedsService, 'getFeed');
      getFeedSpy.mockResolvedValue(null);

      await expect(
        FeedsService.getFeedVideos('non-existent-feed')
      ).rejects.toThrow('Feed não encontrado');

      getFeedSpy.mockRestore();
    });
  });

  describe('updateFeed', () => {
    it('deve atualizar feed', async () => {
      const mockUpdatedFeed = {
        id: 'feed-id',
        title: 'Updated Feed',
        description: 'Updated Description',
        collection: {
          id: 'collection-id',
          name: 'Test Collection'
        }
      };

      mockedPrisma.collectionFeed.update.mockResolvedValue(mockUpdatedFeed);

      const result = await FeedsService.updateFeed('feed-id', {
        title: 'Updated Feed',
        description: 'Updated Description'
      });

      expect(result).toEqual(mockUpdatedFeed);
      expect(mockedPrisma.collectionFeed.update).toHaveBeenCalledWith({
        where: { id: 'feed-id' },
        data: {
          title: 'Updated Feed',
          description: 'Updated Description'
        },
        include: {
          collection: {
            select: { id: true, name: true }
          }
        }
      });
    });
  });

  describe('deleteFeed', () => {
    it('deve excluir feed', async () => {
      const mockDeletedFeed = {
        id: 'feed-id',
        title: 'Deleted Feed'
      };

      mockedPrisma.collectionFeed.delete.mockResolvedValue(mockDeletedFeed);

      const result = await FeedsService.deleteFeed('feed-id');

      expect(result).toEqual(mockDeletedFeed);
      expect(mockedPrisma.collectionFeed.delete).toHaveBeenCalledWith({
        where: { id: 'feed-id' }
      });
    });
  });

  describe('getRecommendedFeeds', () => {
    it('deve retornar feeds recomendados', async () => {
      const mockFeeds = [
        {
          id: 'feed1',
          title: 'Recommended Feed 1',
          collection: {
            id: 'collection1',
            name: 'Collection 1'
          }
        },
        {
          id: 'feed2',
          title: 'Recommended Feed 2',
          collection: {
            id: 'collection2',
            name: 'Collection 2'
          }
        }
      ];

      mockedPrisma.collectionFeed.findMany.mockResolvedValue(mockFeeds);

      const result = await FeedsService.getRecommendedFeeds('user-id', 5);

      expect(result).toEqual(mockFeeds);
      expect(mockedPrisma.collectionFeed.findMany).toHaveBeenCalledWith({
        where: {
          collection: {
            userId: 'user-id'
          },
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        include: {
          collection: {
            select: { id: true, name: true }
          }
        }
      });
    });
  });
});

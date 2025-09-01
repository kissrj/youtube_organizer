import { CollectionsService } from '@/lib/services/collections';
import { prisma } from '@/lib/prisma';

// Mock do Prisma
jest.mock('@/lib/prisma');
const mockedPrisma = prisma as any;

describe('CollectionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCollection', () => {
    it('deve criar uma nova coleção com sucesso', async () => {
      const mockCollection = {
        id: 'test-id',
        name: 'Test Collection',
        description: 'Test Description',
        userId: 'test-user-id',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.collection.create.mockResolvedValue(mockCollection);
      mockedPrisma.collectionSettings.create.mockResolvedValue({});

      const result = await CollectionsService.createCollection({
        name: 'Test Collection',
        description: 'Test Description',
        userId: 'test-user-id'
      });

      expect(result).toEqual(mockCollection);
      expect(mockedPrisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Collection',
          description: 'Test Description',
          userId: 'test-user-id'
        },
        include: {
          children: true,
          videos: true,
          channels: true,
          playlists: true,
          tags: true,
          settings: true
        }
      });
    });

    it('deve criar coleção com nome válido', async () => {
      const mockCollection = {
        id: 'test-id',
        name: 'Test Collection',
        description: 'Test Description',
        userId: 'test-user-id',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.collection.create.mockResolvedValue(mockCollection);
      mockedPrisma.collectionSettings.create.mockResolvedValue({});

      const result = await CollectionsService.createCollection({
        name: 'Test Collection',
        userId: 'test-user-id'
      });

      expect(result).toEqual(mockCollection);
      expect(mockedPrisma.collection.create).toHaveBeenCalled();
    });

    it('deve lançar erro quando já existe coleção com mesmo nome', async () => {
      mockedPrisma.collection.findFirst.mockResolvedValue({
        id: 'existing-id',
        name: 'Test Collection'
      });

      await expect(
        CollectionsService.createCollection({
          name: 'Test Collection',
          userId: 'test-user-id'
        })
      ).rejects.toThrow('Já existe uma coleção com este nome');
    });
  });

  describe('getCollectionContent', () => {
    it('deve retornar conteúdo da coleção', async () => {
      const mockVideos = [
        {
          id: 'video1',
          video: {
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
        }
      ];

      mockedPrisma.collectionVideo.findMany.mockResolvedValue(mockVideos);
      mockedPrisma.collectionVideo.count.mockResolvedValue(1);

      const result = await CollectionsService.getCollectionContent('test-collection-id', {
        type: 'videos',
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        videos: mockVideos.map(cv => cv.video),
        channels: [],
        playlists: [],
        total: { videos: 1, channels: 0, playlists: 0 }
      });
    });

    it('deve filtrar por tipo de conteúdo', async () => {
      mockedPrisma.collectionVideo.findMany.mockResolvedValue([]);
      mockedPrisma.collectionVideo.count.mockResolvedValue(0);

      await CollectionsService.getCollectionContent('test-collection-id', {
        type: 'channels',
        limit: 10
      });

      expect(mockedPrisma.collectionChannel.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'test-collection-id' },
        orderBy: { addedAt: 'desc' },
        take: 10,
        skip: 0
      });
    });
  });

  describe('moveCollection', () => {
    it('deve mover coleção para novo pai', async () => {
      const mockCollection = {
        id: 'test-id',
        name: 'Test Collection',
        parentId: 'old-parent-id'
      };

      mockedPrisma.collection.findFirst.mockResolvedValue(mockCollection);
      mockedPrisma.collection.update.mockResolvedValue({
        ...mockCollection,
        parentId: 'new-parent-id'
      });

      const result = await CollectionsService.moveCollection('test-id', 'new-parent-id');

      expect(result).toEqual({
        ...mockCollection,
        parentId: 'new-parent-id'
      });
      expect(mockedPrisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          parentId: 'new-parent-id',
          position: undefined,
          updatedAt: expect.any(Date)
        },
        include: {
          children: true,
          _count: {
            select: {
              videos: true,
              channels: true,
              playlists: true,
              children: true
            }
          }
        }
      });
    });

    it('deve lançar erro ao tentar mover para si mesmo', async () => {
      await expect(
        CollectionsService.moveCollection('test-id', 'test-id')
      ).rejects.toThrow('Não é possível mover uma coleção para dentro de si mesma');
    });
  });

  describe('addItemsToCollection', () => {
    it('deve adicionar vídeos à coleção', async () => {
      mockedPrisma.collection.findFirst.mockResolvedValue({
        id: 'collection-id',
        name: 'Test Collection'
      });

      mockedPrisma.collectionVideo.create.mockResolvedValue({});

      const result = await CollectionsService.addItemsToCollection('collection-id', {
        videos: ['video1', 'video2']
      });

      expect(result.added.videos).toEqual(['video1', 'video2']);
      expect(result.errors.videos).toEqual([]);
    });

    it('deve lidar com erros ao adicionar itens', async () => {
      mockedPrisma.collection.findFirst.mockResolvedValue({
        id: 'collection-id',
        name: 'Test Collection'
      });

      mockedPrisma.collectionVideo.create
        .mockRejectedValueOnce(new Error('Duplicate'))
        .mockResolvedValueOnce({});

      const result = await CollectionsService.addItemsToCollection('collection-id', {
        videos: ['video1', 'video2']
      });

      expect(result.added.videos).toEqual(['video2']);
      expect(result.errors.videos).toEqual(['video1']);
    });
  });

  describe('removeItemsFromCollection', () => {
    it('deve remover itens da coleção', async () => {
      const result = await CollectionsService.removeItemsFromCollection('collection-id', {
        videos: ['video1', 'video2'],
        channels: ['channel1']
      });

      expect(result.removed.videos).toEqual(['video1', 'video2']);
      expect(result.removed.channels).toEqual(['channel1']);
    });
  });

  describe('searchCollections', () => {
    it('deve buscar coleções por nome', async () => {
      const mockCollections = [
        {
          id: 'collection1',
          name: 'Test Collection',
          description: 'Test Description'
        }
      ];

      mockedPrisma.collection.findMany.mockResolvedValue(mockCollections);

      const result = await CollectionsService.searchCollections('user-id', 'test', {
        limit: 10
      });

      expect(result).toEqual(mockCollections);
      expect(mockedPrisma.collection.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        include: {},
        take: 10
      });
    });
  });

  describe('exportCollections', () => {
    it('deve exportar coleções em formato JSON', async () => {
      const mockCollections = [
        {
          id: 'collection1',
          name: 'Test Collection'
        }
      ];

      // Mock getCollections
      const getCollectionsSpy = jest.spyOn(CollectionsService, 'getCollections');
      getCollectionsSpy.mockResolvedValue(mockCollections);

      const result = await CollectionsService.exportCollections('user-id', {
        format: 'json'
      });

      expect(result).toEqual({
        data: JSON.stringify(mockCollections, null, 2),
        filename: 'collections.json',
        contentType: 'application/json'
      });

      getCollectionsSpy.mockRestore();
    });
  });

  describe('batchOperations', () => {
    it('deve executar operações em lote', async () => {
      const deleteSpy = jest.spyOn(CollectionsService, 'deleteCollection');
      deleteSpy.mockResolvedValue({ success: true });

      const result = await CollectionsService.batchOperations({
        operation: 'delete',
        collectionIds: ['collection1', 'collection2']
      });

      expect(result.success).toEqual(['collection1', 'collection2']);
      expect(result.errors).toEqual([]);

      deleteSpy.mockRestore();
    });

    it('deve lidar com erros em operações em lote', async () => {
      const deleteSpy = jest.spyOn(CollectionsService, 'deleteCollection');
      deleteSpy
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await CollectionsService.batchOperations({
        operation: 'delete',
        collectionIds: ['collection1', 'collection2']
      });

      expect(result.success).toEqual(['collection1']);
      expect(result.errors).toEqual(['collection2']);

      deleteSpy.mockRestore();
    });
  });
});

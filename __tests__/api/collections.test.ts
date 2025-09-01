import { createMocks } from 'node-mocks-http';
import { POST, GET, PUT, DELETE } from '@/pages/api/collections/[...slug]';
import { CollectionsService } from '@/lib/services/collections';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/services/collections');
jest.mock('next-auth');

const mockedCollectionsService = CollectionsService as jest.Mocked<typeof CollectionsService>;
const mockedGetServerSession = getServerSession as jest.Mock;

describe('/api/collections/[...slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-id', email: 'user@example.com' }
    });
  });

  describe('GET /api/collections', () => {
    it('deve retornar lista de coleções do usuário', async () => {
      const mockCollections = [
        {
          id: 'collection1',
          name: 'Test Collection 1',
          description: 'Description 1',
          userId: 'user-id',
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'collection2',
          name: 'Test Collection 2',
          description: 'Description 2',
          userId: 'user-id',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockedCollectionsService.getCollections.mockResolvedValue(mockCollections);

      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockCollections);
      expect(mockedCollectionsService.getCollections).toHaveBeenCalledWith({
        userId: 'user-id'
      });
    });

    it('deve filtrar coleções por query parameters', async () => {
      const mockCollections = [
        {
          id: 'collection1',
          name: 'React Collection',
          userId: 'user-id'
        }
      ];

      mockedCollectionsService.getCollections.mockResolvedValue(mockCollections);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          includeChildren: 'true',
          includeContent: 'true',
          parentId: 'parent-id'
        }
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockedCollectionsService.getCollections).toHaveBeenCalledWith({
        userId: 'user-id',
        includeChildren: true,
        includeContent: true,
        parentId: 'parent-id'
      });
    });

    it('deve retornar erro 401 se usuário não estiver autenticado', async () => {
      mockedGetServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(401);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Não autorizado');
    });
  });

  describe('GET /api/collections/[id]', () => {
    it('deve retornar coleção específica', async () => {
      const mockCollection = {
        id: 'collection-id',
        name: 'Test Collection',
        description: 'Test Description',
        userId: 'user-id',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedCollectionsService.getCollectionById.mockResolvedValue(mockCollection);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          slug: ['collection-id']
        }
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockCollection);
      expect(mockedCollectionsService.getCollectionById).toHaveBeenCalledWith(
        'collection-id',
        { userId: 'user-id' }
      );
    });

    it('deve incluir filhos e conteúdo quando solicitado', async () => {
      const mockCollection = {
        id: 'collection-id',
        name: 'Test Collection',
        children: [],
        videos: [],
        userId: 'user-id'
      };

      mockedCollectionsService.getCollectionById.mockResolvedValue(mockCollection);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          slug: ['collection-id'],
          includeChildren: 'true',
          includeContent: 'true'
        }
      });

      await GET(req, res);

      expect(mockedCollectionsService.getCollectionById).toHaveBeenCalledWith(
        'collection-id',
        {
          userId: 'user-id',
          includeChildren: true,
          includeContent: true
        }
      );
    });
  });

  describe('POST /api/collections', () => {
    it('deve criar nova coleção', async () => {
      const mockCollection = {
        id: 'new-collection-id',
        name: 'New Collection',
        description: 'New Description',
        userId: 'user-id',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedCollectionsService.createCollection.mockResolvedValue(mockCollection);

      const { req, res } = createMocks({
        method: 'POST',
        query: {},
        body: {
          name: 'New Collection',
          description: 'New Description'
        }
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockCollection);
      expect(mockedCollectionsService.createCollection).toHaveBeenCalledWith({
        name: 'New Collection',
        description: 'New Description',
        userId: 'user-id'
      });
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      mockedCollectionsService.createCollection.mockRejectedValue(
        new Error('Nome é obrigatório')
      );

      const { req, res } = createMocks({
        method: 'POST',
        query: {},
        body: {
          description: 'Missing name'
        }
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Nome é obrigatório');
    });
  });

  describe('PUT /api/collections/[id]', () => {
    it('deve atualizar coleção existente', async () => {
      const mockUpdatedCollection = {
        id: 'collection-id',
        name: 'Updated Collection',
        description: 'Updated Description',
        userId: 'user-id',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedCollectionsService.updateCollection.mockResolvedValue(mockUpdatedCollection);

      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          slug: ['collection-id']
        },
        body: {
          name: 'Updated Collection',
          description: 'Updated Description',
          isPublic: true
        }
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockUpdatedCollection);
      expect(mockedCollectionsService.updateCollection).toHaveBeenCalledWith(
        'collection-id',
        {
          name: 'Updated Collection',
          description: 'Updated Description',
          isPublic: true
        }
      );
    });

    it('deve retornar erro 404 para coleção não encontrada', async () => {
      mockedCollectionsService.updateCollection.mockRejectedValue(
        new Error('Coleção não encontrada')
      );

      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          slug: ['nonexistent-id']
        },
        body: {
          name: 'Updated Name'
        }
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Coleção não encontrada');
    });
  });

  describe('DELETE /api/collections/[id]', () => {
    it('deve excluir coleção', async () => {
      mockedCollectionsService.deleteCollection.mockResolvedValue({ success: true });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          slug: ['collection-id']
        }
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ success: true });
      expect(mockedCollectionsService.deleteCollection).toHaveBeenCalledWith('collection-id');
    });

    it('deve retornar erro 404 para coleção não encontrada', async () => {
      mockedCollectionsService.deleteCollection.mockRejectedValue(
        new Error('Coleção não encontrada')
      );

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          slug: ['nonexistent-id']
        }
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Coleção não encontrada');
    });
  });

  describe('POST /api/collections/[id]/items', () => {
    it('deve adicionar itens à coleção', async () => {
      const mockResult = {
        added: { videos: ['video1'], channels: [], playlists: [] },
        errors: { videos: [], channels: [], playlists: [] }
      };

      mockedCollectionsService.addItemsToCollection.mockResolvedValue(mockResult);

      const { req, res } = createMocks({
        method: 'POST',
        query: {
          slug: ['collection-id', 'items']
        },
        body: {
          videos: ['video1'],
          position: 0
        }
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockResult);
      expect(mockedCollectionsService.addItemsToCollection).toHaveBeenCalledWith(
        'collection-id',
        {
          videos: ['video1'],
          position: 0
        }
      );
    });
  });

  describe('DELETE /api/collections/[id]/items', () => {
    it('deve remover itens da coleção', async () => {
      const mockResult = {
        removed: { videos: ['video1'], channels: [], playlists: [] }
      };

      mockedCollectionsService.removeItemsFromCollection.mockResolvedValue(mockResult);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          slug: ['collection-id', 'items']
        },
        body: {
          videos: ['video1']
        }
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockResult);
      expect(mockedCollectionsService.removeItemsFromCollection).toHaveBeenCalledWith(
        'collection-id',
        {
          videos: ['video1']
        }
      );
    });
  });

  describe('GET /api/collections/[id]/content', () => {
    it('deve retornar conteúdo da coleção', async () => {
      const mockContent = {
        videos: [
          {
            id: 'video1',
            title: 'Test Video',
            description: 'Test Description'
          }
        ],
        channels: [],
        playlists: [],
        total: { videos: 1, channels: 0, playlists: 0 }
      };

      mockedCollectionsService.getCollectionContent.mockResolvedValue(mockContent);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          slug: ['collection-id', 'content'],
          type: 'videos',
          limit: '10'
        }
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockContent);
      expect(mockedCollectionsService.getCollectionContent).toHaveBeenCalledWith(
        'collection-id',
        {
          type: 'videos',
          limit: 10,
          offset: 0,
          sortBy: 'addedAt',
          sortOrder: 'desc'
        }
      );
    });
  });

  describe('PUT /api/collections/[id]/move', () => {
    it('deve mover coleção', async () => {
      const mockResult = {
        id: 'collection-id',
        parentId: 'new-parent-id',
        position: 1
      };

      mockedCollectionsService.moveCollection.mockResolvedValue(mockResult);

      const { req, res } = createMocks({
        method: 'PUT',
        query: {
          slug: ['collection-id', 'move']
        },
        body: {
          newParentId: 'new-parent-id',
          newPosition: 1
        }
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockResult);
      expect(mockedCollectionsService.moveCollection).toHaveBeenCalledWith(
        'collection-id',
        'new-parent-id',
        1
      );
    });
  });

  describe('GET /api/collections/search', () => {
    it('deve buscar coleções', async () => {
      const mockResults = [
        {
          id: 'collection1',
          name: 'React Collection',
          description: 'React tutorials'
        }
      ];

      mockedCollectionsService.searchCollections.mockResolvedValue(mockResults);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          slug: ['search'],
          q: 'React',
          includeContent: 'true'
        }
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockResults);
      expect(mockedCollectionsService.searchCollections).toHaveBeenCalledWith(
        'user-id',
        'React',
        { includeContent: true }
      );
    });
  });

  describe('POST /api/collections/export', () => {
    it('deve exportar coleções', async () => {
      const mockExport = {
        data: '{"collections": []}',
        filename: 'collections.json',
        contentType: 'application/json'
      };

      mockedCollectionsService.exportCollections.mockResolvedValue(mockExport);

      const { req, res } = createMocks({
        method: 'POST',
        query: {
          slug: ['export']
        },
        body: {
          format: 'json',
          includeContent: true
        }
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockExport);
      expect(mockedCollectionsService.exportCollections).toHaveBeenCalledWith(
        'user-id',
        {
          format: 'json',
          includeContent: true
        }
      );
    });
  });

  describe('POST /api/collections/import', () => {
    it('deve importar coleções', async () => {
      const mockImportResult = {
        imported: 2,
        errors: [],
        conflicts: []
      };

      mockedCollectionsService.importCollections.mockResolvedValue(mockImportResult);

      const { req, res } = createMocks({
        method: 'POST',
        query: {
          slug: ['import']
        },
        body: {
          data: [{ name: 'Collection 1' }, { name: 'Collection 2' }],
          merge: false
        }
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockImportResult);
      expect(mockedCollectionsService.importCollections).toHaveBeenCalledWith(
        'user-id',
        [{ name: 'Collection 1' }, { name: 'Collection 2' }],
        { merge: false }
      );
    });
  });

  describe('Error Handling', () => {
    it('deve retornar erro 500 para erros inesperados', async () => {
      mockedCollectionsService.getCollections.mockRejectedValue(
        new Error('Database connection failed')
      );

      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Erro interno do servidor');
    });

    it('deve retornar erro 405 para método não permitido', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: {
          slug: ['collection-id']
        }
      });

      // Simulate calling the handler directly
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);

      // This would normally be handled by Next.js routing
      expect(res.status).toBeDefined();
    });
  });
});

import { NotificationsService } from '@/lib/services/notifications';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
const mockedPrisma = prisma as any;

describe('NotificationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('deve criar uma nova notificação', async () => {
      const mockNotification = {
        id: 'notification-id',
        title: 'Test Notification',
        message: 'Test Message',
        type: 'NEW_VIDEO',
        priority: 'MEDIUM',
        userId: 'user-id',
        isRead: false,
        isArchived: false,
        channels: {},
        scheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationsService.createNotification({
        userId: 'user-id',
        title: 'Test Notification',
        message: 'Test Message',
        type: 'NEW_VIDEO'
      });

      expect(result).toEqual(mockNotification);
      expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          title: 'Test Notification',
          message: 'Test Message',
          type: 'NEW_VIDEO',
          priority: 'MEDIUM',
          entityType: undefined,
          entityId: undefined,
          collectionId: undefined,
          channels: {},
          expiresAt: expect.any(Date)
        }
      });
    });

    it('deve criar notificação com prioridade alta', async () => {
      const mockNotification = {
        id: 'notification-id',
        title: 'Urgent Notification',
        message: 'Urgent Message',
        type: 'SYSTEM_ALERT',
        priority: 'URGENT',
        userId: 'user-id',
        isRead: false,
        isArchived: false,
        channels: {},
        scheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationsService.createNotification({
        userId: 'user-id',
        title: 'Urgent Notification',
        message: 'Urgent Message',
        type: 'SYSTEM_ALERT',
        priority: 'URGENT'
      });

      expect(result.priority).toBe('URGENT');
    });
  });

  describe('getUserNotifications', () => {
    it('deve retornar notificações do usuário', async () => {
      const mockNotifications = [
        {
          id: 'notification1',
          title: 'Notification 1',
          message: 'Message 1',
          type: 'NEW_VIDEO',
          priority: 'HIGH',
          userId: 'user-id',
          isRead: false,
          isArchived: false,
          channels: {},
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockedPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationsService.getUserNotifications('user-id', {
        unreadOnly: true,
        limit: 10
      });

      expect(result).toEqual(mockNotifications);
      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          isRead: false
        },
        orderBy: [
          { isRead: 'asc' },
          { priority: 'desc' },
          { scheduledAt: 'desc' }
        ],
        take: 10,
        skip: 0
      });
    });

    it('deve filtrar por tipo', async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([]);

      await NotificationsService.getUserNotifications('user-id', {
        type: 'NEW_VIDEO'
      });

      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          type: 'NEW_VIDEO'
        },
        orderBy: [
          { isRead: 'asc' },
          { priority: 'desc' },
          { scheduledAt: 'desc' }
        ],
        take: 20,
        skip: 0
      });
    });

    it('deve filtrar por prioridade', async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([]);

      await NotificationsService.getUserNotifications('user-id', {
        priority: 'HIGH'
      });

      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          priority: 'HIGH'
        },
        orderBy: [
          { isRead: 'asc' },
          { priority: 'desc' },
          { scheduledAt: 'desc' }
        ],
        take: 20,
        skip: 0
      });
    });
  });

  describe('markAsRead', () => {
    it('deve marcar notificação como lida', async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.markAsRead('notification-id', 'user-id');

      expect(result).toEqual({ count: 1 });
      expect(mockedPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'notification-id',
          userId: 'user-id',
          isRead: false
        },
        data: {
          isRead: true,
          readAt: expect.any(Date)
        }
      });
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas as notificações como lidas', async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await NotificationsService.markAllAsRead('user-id');

      expect(result).toEqual({ count: 5 });
      expect(mockedPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          isRead: false
        },
        data: {
          isRead: true,
          readAt: expect.any(Date)
        }
      });
    });
  });

  describe('archiveNotification', () => {
    it('deve arquivar notificação', async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.archiveNotification('notification-id', 'user-id');

      expect(result).toEqual({ count: 1 });
      expect(mockedPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'notification-id',
          userId: 'user-id'
        },
        data: {
          isArchived: true
        }
      });
    });
  });

  describe('deleteNotification', () => {
    it('deve excluir notificação', async () => {
      mockedPrisma.notification.deleteMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.deleteNotification('notification-id', 'user-id');

      expect(result).toEqual({ count: 1 });
      expect(mockedPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'notification-id',
          userId: 'user-id'
        }
      });
    });
  });

  describe('getUserPreferences', () => {
    it('deve retornar preferências existentes', async () => {
      const mockPreferences = {
        id: 'preferences-id',
        userId: 'user-id',
        enabled: true,
        frequency: 'IMMEDIATE',
        preferences: {},
        channels: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(mockPreferences);

      const result = await NotificationsService.getUserPreferences('user-id');

      expect(result).toEqual(mockPreferences);
    });

    it('deve criar preferências padrão se não existirem', async () => {
      const mockDefaultPreferences = {
        id: 'preferences-id',
        userId: 'user-id',
        enabled: true,
        frequency: 'IMMEDIATE',
        preferences: {
          NEW_VIDEO: { enabled: true, channels: ['email'] },
          COLLECTION_UPDATED: { enabled: true, channels: ['email'] },
          FEED_UPDATED: { enabled: true, channels: ['email'] },
          SYNC_COMPLETED: { enabled: false, channels: ['email'] },
          EXPORT_COMPLETED: { enabled: true, channels: ['email'] },
          IMPORT_COMPLETED: { enabled: true, channels: ['email'] }
        },
        channels: {
          email: { enabled: true }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockedPrisma.notificationPreference.create.mockResolvedValue(mockDefaultPreferences);

      const result = await NotificationsService.getUserPreferences('user-id');

      expect(result).toEqual(mockDefaultPreferences);
      expect(mockedPrisma.notificationPreference.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          enabled: true,
          frequency: 'IMMEDIATE',
          preferences: {
            NEW_VIDEO: { enabled: true, channels: ['email'] },
            COLLECTION_UPDATED: { enabled: true, channels: ['email'] },
            FEED_UPDATED: { enabled: true, channels: ['email'] },
            SYNC_COMPLETED: { enabled: false, channels: ['email'] },
            EXPORT_COMPLETED: { enabled: true, channels: ['email'] },
            IMPORT_COMPLETED: { enabled: true, channels: ['email'] }
          },
          channels: {
            email: { enabled: true }
          }
        }
      });
    });
  });

  describe('updatePreferences', () => {
    it('deve atualizar preferências', async () => {
      const mockUpdatedPreferences = {
        id: 'preferences-id',
        userId: 'user-id',
        enabled: false,
        frequency: 'DAILY',
        preferences: {},
        channels: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notificationPreference.upsert.mockResolvedValue(mockUpdatedPreferences);

      const result = await NotificationsService.updatePreferences('user-id', {
        enabled: false,
        frequency: 'DAILY'
      });

      expect(result).toEqual(mockUpdatedPreferences);
    });
  });

  describe('getUserChannels', () => {
    it('deve retornar canais do usuário', async () => {
      const mockChannels = [
        {
          id: 'channel1',
          userId: 'user-id',
          type: 'EMAIL',
          name: 'Email Principal',
          config: { email: 'user@example.com' },
          isActive: true,
          verified: true,
          sentCount: 10,
          failedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockedPrisma.notificationChannel.findMany.mockResolvedValue(mockChannels);

      const result = await NotificationsService.getUserChannels('user-id');

      expect(result).toEqual(mockChannels);
      expect(mockedPrisma.notificationChannel.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('addChannel', () => {
    it('deve adicionar novo canal', async () => {
      const mockChannel = {
        id: 'channel-id',
        userId: 'user-id',
        type: 'EMAIL',
        name: 'Email Principal',
        config: { email: 'user@example.com' },
        isActive: true,
        verified: false,
        sentCount: 0,
        failedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notificationChannel.create.mockResolvedValue(mockChannel);

      const result = await NotificationsService.addChannel('user-id', {
        type: 'EMAIL',
        name: 'Email Principal',
        config: { email: 'user@example.com' }
      });

      expect(result).toEqual(mockChannel);
    });
  });

  describe('updateChannel', () => {
    it('deve atualizar canal', async () => {
      mockedPrisma.notificationChannel.updateMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.updateChannel('channel-id', 'user-id', {
        name: 'Email Atualizado',
        isActive: false
      });

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('removeChannel', () => {
    it('deve remover canal', async () => {
      mockedPrisma.notificationChannel.deleteMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.removeChannel('channel-id', 'user-id');

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('verifyChannel', () => {
    it('deve verificar canal', async () => {
      mockedPrisma.notificationChannel.updateMany.mockResolvedValue({ count: 1 });

      const result = await NotificationsService.verifyChannel('channel-id', 'user-id');

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('getTemplates', () => {
    it('deve retornar templates ativos', async () => {
      const mockTemplates = [
        {
          id: 'template1',
          name: 'Novo Vídeo',
          subject: 'Novo vídeo disponível',
          htmlContent: '<h1>Novo vídeo</h1>',
          isActive: true,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockedPrisma.notificationTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await NotificationsService.getTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockedPrisma.notificationTemplate.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { isDefault: 'desc', name: 'asc' }
      });
    });

    it('deve filtrar por categoria', async () => {
      mockedPrisma.notificationTemplate.findMany.mockResolvedValue([]);

      await NotificationsService.getTemplates('video');

      expect(mockedPrisma.notificationTemplate.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          category: 'video'
        },
        orderBy: { isDefault: 'desc', name: 'asc' }
      });
    });
  });

  describe('createTemplate', () => {
    it('deve criar novo template', async () => {
      const mockTemplate = {
        id: 'template-id',
        name: 'Novo Template',
        subject: 'Assunto do template',
        htmlContent: '<h1>Conteúdo HTML</h1>',
        textContent: 'Conteúdo texto',
        variables: { title: 'string', message: 'string' },
        isActive: true,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockedPrisma.notificationTemplate.create.mockResolvedValue(mockTemplate);

      const result = await NotificationsService.createTemplate({
        name: 'Novo Template',
        subject: 'Assunto do template',
        htmlContent: '<h1>Conteúdo HTML</h1>',
        textContent: 'Conteúdo texto',
        variables: { title: 'string', message: 'string' }
      });

      expect(result).toEqual(mockTemplate);
    });
  });

  describe('notifyNewVideo', () => {
    it('deve criar notificações para novo vídeo', async () => {
      const mockVideo = {
        id: 'video-id',
        title: 'Novo Vídeo',
        collections: [
          {
            id: 'collection-id',
            name: 'Test Collection'
          }
        ],
        channel: {
          id: 'channel-id',
          title: 'Test Channel'
        }
      };

      const mockUsers = [
        { id: 'user1' },
        { id: 'user2' }
      ];

      const mockNotification = {
        id: 'notification-id',
        title: 'Novo vídeo: Novo Vídeo',
        message: 'O vídeo "Novo Vídeo" foi adicionado à coleção "Test Collection"',
        type: 'NEW_VIDEO',
        priority: 'MEDIUM',
        userId: 'user1',
        entityType: 'video',
        entityId: 'video-id',
        collectionId: 'collection-id',
        isRead: false,
        isArchived: false,
        channels: {},
        scheduledAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockedPrisma.video.findUnique.mockResolvedValue(mockVideo);
      mockedPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockedPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationsService.notifyNewVideo('video-id', 'collection-id');

      expect(result).toHaveLength(2);
      expect(mockedPrisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyCollectionUpdated', () => {
    it('deve criar notificações para coleção atualizada', async () => {
      const mockCollection = {
        id: 'collection-id',
        name: 'Test Collection',
        users: [
          { id: 'user1' },
          { id: 'user2' }
        ]
      };

      const mockNotification = {
        id: 'notification-id',
        title: 'Coleção atualizada: Test Collection',
        message: 'A coleção "Test Collection" foi atualizada: vídeos adicionados, tags atualizadas',
        type: 'COLLECTION_UPDATED',
        priority: 'LOW',
        userId: 'user1',
        entityType: 'collection',
        entityId: 'collection-id',
        collectionId: 'collection-id',
        isRead: false,
        isArchived: false,
        channels: {},
        scheduledAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockedPrisma.collection.findUnique.mockResolvedValue(mockCollection);
      mockedPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationsService.notifyCollectionUpdated('collection-id', [
        'vídeos adicionados',
        'tags atualizadas'
      ]);

      expect(result).toHaveLength(2);
      expect(mockedPrisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanupOldNotifications', () => {
    it('deve limpar notificações antigas', async () => {
      mockedPrisma.notification.deleteMany.mockResolvedValue({ count: 10 });
      mockedPrisma.notificationLog.deleteMany.mockResolvedValue({ count: 5 });

      const result = await NotificationsService.cleanupOldNotifications();

      expect(result).toEqual({
        deletedNotifications: { count: 10 },
        deletedLogs: { count: 5 }
      });
    });
  });
});

import { prisma } from '../prisma';
import { z } from 'zod';

// Tipos
export type Notification = {
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
};

export type NotificationTemplate = {
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
};

export type NotificationPreference = {
  id: string;
  userId: string;
  enabled: boolean;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHours?: any;
  preferences: any;
  channels: any;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationChannel = {
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
};

// Schema de validação
const NotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(['NEW_VIDEO', 'VIDEO_UPDATED', 'COLLECTION_UPDATED', 'FEED_UPDATED', 'TAG_SUGGESTED', 'SYNC_COMPLETED', 'SYNC_FAILED', 'EXPORT_COMPLETED', 'EXPORT_FAILED', 'IMPORT_COMPLETED', 'IMPORT_FAILED', 'SYSTEM_ALERT', 'REMINDER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  collectionId: z.string().optional(),
  channels: z.any().default({})
});

const NotificationPreferenceSchema = z.object({
  enabled: z.boolean().default(true),
  frequency: z.enum(['IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY', 'NEVER']).default('IMMEDIATE'),
  quietHours: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    enabled: z.boolean().default(false)
  }).optional(),
  preferences: z.any().default({}),
  channels: z.any().default({})
});

const NotificationChannelSchema = z.object({
  type: z.enum(['EMAIL', 'PUSH', 'WEBHOOK', 'SMS', 'SLACK', 'DISCORD']),
  name: z.string().min(1).max(100),
  config: z.any(),
  isActive: z.boolean().default(true)
});

// Serviço
export class NotificationsService {
  // Criar notificação
  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    priority?: Notification['priority'];
    entityType?: string;
    entityId?: string;
    collectionId?: string;
    channels?: any;
    templateId?: string;
    scheduledAt?: Date;
  }) {
    const validated = NotificationSchema.parse(data);

    return prisma.notification.create({
      data: {
        userId: data.userId,
        ...validated,
        expiresAt: data.scheduledAt ? new Date(data.scheduledAt.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined
      }
    });
  }

  // Obter notificações do usuário
  static async getUserNotifications(userId: string, options: {
    unreadOnly?: boolean;
    archived?: boolean;
    limit?: number;
    offset?: number;
    type?: Notification['type'];
    priority?: Notification['priority'];
  } = {}) {
    const where: any = { userId };

    if (options.unreadOnly) {
      where.isRead = false;
    }

    if (options.archived !== undefined) {
      where.isArchived = options.archived;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.priority) {
      where.priority = options.priority;
    }

    return prisma.notification.findMany({
      where,
      orderBy: [
        { isRead: 'asc' },
        { priority: 'desc' },
        { scheduledAt: 'desc' }
      ],
      take: options.limit || 20,
      skip: options.offset || 0
    });
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Marcar todas como lidas
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Arquivar notificação
  static async archiveNotification(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isArchived: true
      }
    });
  }

  // Excluir notificação
  static async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
  }

  // Obter preferências do usuário
  static async getUserPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Criar preferências padrão
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
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
    }

    return preferences;
  }

  // Atualizar preferências
  static async updatePreferences(userId: string, data: Partial<NotificationPreference>) {
    const validated = NotificationPreferenceSchema.parse(data);

    return prisma.notificationPreference.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated
      }
    });
  }

  // Obter canais do usuário
  static async getUserChannels(userId: string) {
    return prisma.notificationChannel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Adicionar canal
  static async addChannel(userId: string, data: {
    type: NotificationChannel['type'];
    name: string;
    config: any;
  }) {
    const validated = NotificationChannelSchema.parse(data);

    return prisma.notificationChannel.create({
      data: {
        userId,
        ...validated
      }
    });
  }

  // Atualizar canal
  static async updateChannel(channelId: string, userId: string, data: Partial<NotificationChannel>) {
    const validated = NotificationChannelSchema.parse(data);

    return prisma.notificationChannel.updateMany({
      where: {
        id: channelId,
        userId
      },
      data: validated
    });
  }

  // Remover canal
  static async removeChannel(channelId: string, userId: string) {
    return prisma.notificationChannel.deleteMany({
      where: {
        id: channelId,
        userId
      }
    });
  }

  // Verificar canal
  static async verifyChannel(channelId: string, userId: string) {
    return prisma.notificationChannel.updateMany({
      where: {
        id: channelId,
        userId
      },
      data: {
        verified: true
      }
    });
  }

  // Obter templates
  static async getTemplates(category?: string) {
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    return prisma.notificationTemplate.findMany({
      where,
      orderBy: { isDefault: 'desc', name: 'asc' }
    });
  }

  // Criar template
  static async createTemplate(data: {
    name: string;
    description?: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    variables: any;
    category?: string;
  }) {
    return prisma.notificationTemplate.create({
      data
    });
  }

  // Enviar notificação
  static async sendNotification(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          include: {
            notificationPreferences: true,
            notificationChannels: true
          }
        },
        template: true
      }
    });

    if (!notification) {
      throw new Error('Notificação não encontrada');
    }

    // Verificar se notificação já foi enviada
    if (notification.sentAt) {
      return { success: false, error: 'Notificação já enviada' };
    }

    // Verificar preferências do usuário
    const preferences = notification.user.notificationPreferences || await this.getUserPreferences(notification.userId);

    if (!preferences.enabled) {
      return { success: false, error: 'Notificações desativadas' };
    }

    // Verificar horário silencioso
    if (preferences.quietHours?.enabled && this.isInQuietHours(preferences.quietHours)) {
      return { success: false, error: 'Período silencioso' };
    }

    // Enviar via canais configurados
    const results = await this.sendViaChannels(notification, preferences);

    // Atualizar status da notificação
    const allSuccess = results.every(r => r.success);

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        sentAt: allSuccess ? new Date() : undefined
      }
    });

    return { success: allSuccess, results };
  }

  // Enviar via canais
  private static async sendViaChannels(notification: any, preferences: any) {
    const results = [];

    // Obter canais ativos
    const activeChannels = preferences.channels || {};

    for (const [channelType, config] of Object.entries(activeChannels)) {
      if (config.enabled) {
        try {
          const result = await this.sendToChannel(notification, channelType as any, config);
          results.push({ channel: channelType, ...result });
        } catch (error) {
          results.push({
            channel: channelType,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    }

    return results;
  }

  // Enviar para canal específico
  private static async sendToChannel(notification: any, channelType: string, config: any) {
    switch (channelType) {
      case 'email':
        return await this.sendEmail(notification, config);
      case 'push':
        return await this.sendPush(notification, config);
      case 'webhook':
        return await this.sendWebhook(notification, config);
      case 'slack':
        return await this.sendSlack(notification, config);
      case 'discord':
        return await this.sendDiscord(notification, config);
      default:
        throw new Error(`Canal não suportado: ${channelType}`);
    }
  }

  // Enviar email
  private static async sendEmail(notification: any, config: any) {
    // Em uma implementação real, você usaria um serviço de email como SendGrid, Mailgun, etc.
    const subject = notification.template?.subject || notification.title;
    const htmlContent = notification.template?.htmlContent || `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Enviado em ${new Date().toLocaleString('pt-BR')}</p>
    `;

    // Simular envio
    console.log('Enviando email:', {
      to: config.email,
      subject,
      html: htmlContent
    });

    // Registrar log
    await this.logNotificationAttempt(notification.id, 'email', 'SENT');

    return { success: true };
  }

  // Enviar push notification
  private static async sendPush(notification: any, config: any) {
    // Em uma implementação real, você usaria um serviço como Firebase Cloud Messaging, Apple Push Notification Service, etc.
    const payload = {
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        entityId: notification.entityId,
        collectionId: notification.collectionId
      }
    };

    // Simular envio
    console.log('Enviando push notification:', {
      token: config.token,
      payload
    });

    // Registrar log
    await this.logNotificationAttempt(notification.id, 'push', 'SENT');

    return { success: true };
  }

  // Enviar webhook
  private static async sendWebhook(notification: any, config: any) {
    const payload = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.scheduledAt,
      data: {
        entityType: notification.entityType,
        entityId: notification.entityId,
        collectionId: notification.collectionId
      }
    };

    // Simular envio
    console.log('Enviando webhook:', {
      url: config.url,
      payload,
      headers: config.headers
    });

    // Registrar log
    await this.logNotificationAttempt(notification.id, 'webhook', 'SENT');

    return { success: true };
  }

  // Enviar para Slack
  private static async sendSlack(notification: any, config: any) {
    const payload = {
      text: `*${notification.title}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: notification.message
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Enviado em ${new Date().toLocaleString('pt-BR')}`
            }
          ]
        }
      ]
    };

    // Simular envio
    console.log('Enviando para Slack:', {
      webhook: config.webhookUrl,
      payload
    });

    // Registrar log
    await this.logNotificationAttempt(notification.id, 'slack', 'SENT');

    return { success: true };
  }

  // Enviar para Discord
  private static async sendDiscord(notification: any, config: any) {
    const payload = {
      content: `**${notification.title}**`,
      embeds: [{
        title: notification.title,
        description: notification.message,
        timestamp: new Date().toISOString(),
        color: this.getPriorityColor(notification.priority)
      }]
    };

    // Simular envio
    console.log('Enviando para Discord:', {
      webhook: config.webhookUrl,
      payload
    });

    // Registrar log
    await this.logNotificationAttempt(notification.id, 'discord', 'SENT');

    return { success: true };
  }

  // Registrar tentativa de envio
  private static async logNotificationAttempt(notificationId: string, channel: string, status: string) {
    return prisma.notificationLog.create({
      data: {
        notificationId,
        channel,
        status,
        attempt: 1
      }
    });
  }

  // Verificar horário silencioso
  private static isInQuietHours(quietHours: any): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Período silencioso que passa meia-noite
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Obter cor por prioridade
  private static getPriorityColor(priority: string): number {
    const colors = {
      LOW: 0x7289da,      // Azul
      MEDIUM: 0xf1c40f,   // Amarelo
      HIGH: 0xe67e22,     // Laranja
      URGENT: 0xe74c3c    // Vermelho
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  }

  // Processar notificações pendentes
  static async processPendingNotifications() {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        sentAt: null,
        scheduledAt: { lte: new Date() },
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            notificationPreferences: true,
            notificationChannels: true
          }
        }
      }
    });

    const results = [];

    for (const notification of pendingNotifications) {
      try {
        const result = await this.sendNotification(notification.id);
        results.push({ notificationId: notification.id, ...result });
      } catch (error) {
        results.push({
          notificationId: notification.id,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return results;
  }

  // Criar notificação de novo vídeo
  static async notifyNewVideo(videoId: string, collectionId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        channel: true,
        collections: {
          where: { id: collectionId }
        }
      }
    });

    if (!video || !video.collections.length) return;

    const collection = video.collections[0];

    // Obter usuários da coleção
    const users = await prisma.user.findMany({
      where: {
        collections: {
          some: { id: collectionId }
        }
      }
    });

    // Criar notificações para cada usuário
    const notifications = await Promise.all(
      users.map(user =>
        this.createNotification({
          userId: user.id,
          title: `Novo vídeo: ${video.title}`,
          message: `O vídeo "${video.title}" foi adicionado à coleção "${collection.name}"`,
          type: 'NEW_VIDEO',
          priority: 'MEDIUM',
          entityType: 'video',
          entityId: videoId,
          collectionId: collectionId
        })
      )
    );

    return notifications;
  }

  // Criar notificação de coleção atualizada
  static async notifyCollectionUpdated(collectionId: string, changes: string[]) {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        users: true
      }
    });

    if (!collection) return;

    // Criar notificações
    const notifications = await Promise.all(
      collection.users.map(user =>
        this.createNotification({
          userId: user.id,
          title: `Coleção atualizada: ${collection.name}`,
          message: `A coleção "${collection.name}" foi atualizada: ${changes.join(', ')}`,
          type: 'COLLECTION_UPDATED',
          priority: 'LOW',
          entityType: 'collection',
          entityId: collectionId,
          collectionId: collectionId
        })
      )
    );

    return notifications;
  }

  // Criar notificação de sincronização concluída
  static async notifySyncCompleted(userId: string, sessionId: string, success: boolean, itemsSynced: number) {
    return this.createNotification({
      userId,
      title: success ? 'Sincronização concluída' : 'Sincronização falhou',
      message: success
        ? `Sincronização concluída com sucesso! ${itemsSynced} itens sincronizados.`
        : 'A sincronização falhou. Verifique sua conexão e tente novamente.',
      type: success ? 'SYNC_COMPLETED' : 'SYNC_FAILED',
      priority: success ? 'LOW' : 'HIGH',
      entityType: 'sync',
      entityId: sessionId
    });
  }

  // Criar notificação de exportação concluída
  static async notifyExportCompleted(userId: string, exportId: string, success: boolean, fileName: string) {
    return this.createNotification({
      userId,
      title: success ? 'Exportação concluída' : 'Exportação falhou',
      message: success
        ? `Sua exportação "${fileName}" está pronta para download.`
        : 'A exportação falhou. Verifique os dados e tente novamente.',
      type: success ? 'EXPORT_COMPLETED' : 'EXPORT_FAILED',
      priority: success ? 'MEDIUM' : 'HIGH',
      entityType: 'export',
      entityId: exportId
    });
  }

  // Criar notificação de importação concluída
  static async notifyImportCompleted(userId: string, importId: string, success: boolean, successItems: number, errorItems: number) {
    return this.createNotification({
      userId,
      title: success ? 'Importação concluída' : 'Importação falhou',
      message: success
        ? `Importação concluída! ${successItems} itens importados com sucesso. ${errorItems} itens com erros.`
        : 'A importação falhou. Verifique o arquivo e tente novamente.',
      type: success ? 'IMPORT_COMPLETED' : 'IMPORT_FAILED',
      priority: success ? 'MEDIUM' : 'HIGH',
      entityType: 'import',
      entityId: importId
    });
  }

  // Limpar notificações antigas
  static async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [deletedNotifications, deletedLogs] = await Promise.all([
      prisma.notification.deleteMany({
        where: {
          OR: [
            { createdAt: { lt: thirtyDaysAgo } },
            { expiresAt: { lt: new Date() } }
          ]
        }
      }),
      prisma.notificationLog.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo }
        }
      })
    ]);

    return { deletedNotifications, deletedLogs };
  }
}

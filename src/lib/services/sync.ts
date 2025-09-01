import { prisma } from '../prisma';
import { z } from 'zod';

// Tipos
export type SyncSession = {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  os?: string;
  browser?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'COMPLETED';
  lastSync?: Date;
  nextSync?: Date;
  itemsSynced: number;
  conflicts: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SyncConflict = {
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
};

export type SyncQueue = {
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
};

// Schema de validação
const SyncSessionSchema = z.object({
  deviceName: z.string().min(1),
  deviceType: z.enum(['web', 'mobile', 'desktop']),
  os: z.string().optional(),
  browser: z.string().optional()
});

const SyncQueueSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  data: z.any(),
  priority: z.number().min(1).max(10).default(1)
});

// Serviço
export class SyncService {
  // Criar ou obter sessão de sincronização
  static async getOrCreateSession(userId: string, deviceInfo: {
    deviceName: string;
    deviceType: 'web' | 'mobile' | 'desktop';
    os?: string;
    browser?: string;
  }) {
    const validated = SyncSessionSchema.parse(deviceInfo);

    let session = await prisma.syncSession.findFirst({
      where: {
        userId,
        deviceName: validated.deviceName,
        deviceType: validated.deviceType
      }
    });

    if (!session) {
      session = await prisma.syncSession.create({
        data: {
          userId,
          ...validated
        }
      });
    }

    return session;
  }

  // Obter sessões ativas do usuário
  static async getUserSessions(userId: string) {
    return prisma.syncSession.findMany({
      where: { userId },
      orderBy: { lastSync: 'desc' }
    });
  }

  // Iniciar processo de sincronização
  static async startSync(sessionId: string) {
    const session = await prisma.syncSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Atualizar status da sessão
    await prisma.syncSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        lastSync: new Date()
      }
    });

    // Processar fila de sincronização
    await this.processSyncQueue(session.userId, sessionId);

    // Resolver conflitos pendentes
    await this.resolveConflicts(sessionId);

    return { success: true, sessionId };
  }

  // Processar fila de sincronização
  private static async processSyncQueue(userId: string, sessionId: string) {
    const queueItems = await prisma.syncQueue.findMany({
      where: {
        userId,
        status: 'PENDING'
      },
      orderBy: [
        { priority: 'asc' },
        { scheduledAt: 'asc' }
      ],
      take: 10 // Processar em lotes de 10
    });

    for (const item of queueItems) {
      try {
        // Marcar como processando
        await prisma.syncQueue.update({
          where: { id: item.id },
          data: { status: 'PROCESSING' }
        });

        // Processar operação
        await this.processSyncOperation(item);

        // Marcar como completado
        await prisma.syncQueue.update({
          where: { id: item.id },
          data: {
            status: 'COMPLETED',
            executedAt: new Date(),
            completedAt: new Date()
          }
        });

      } catch (error) {
        console.error('Erro ao processar item da fila:', error);

        // Incrementar tentativas
        const attempts = item.attempts + 1;

        if (attempts >= item.maxAttempts) {
          // Marcar como falha
          await prisma.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Erro desconhecido',
              completedAt: new Date()
            }
          });
        } else {
          // Marcar para retry
          await prisma.syncQueue.update({
            where: { id: item.id },
            data: {
              status: 'RETRYING',
              attempts,
              scheduledAt: new Date(Date.now() + Math.pow(2, attempts) * 1000) // Exponential backoff
            }
          });
        }
      }
    }
  }

  // Processar operação de sincronização
  private static async processSyncOperation(item: SyncQueue) {
    switch (item.operation) {
      case 'CREATE':
        await this.createEntity(item.entityType, item.entityId, item.data);
        break;
      case 'UPDATE':
        await this.updateEntity(item.entityType, item.entityId, item.data);
        break;
      case 'DELETE':
        await this.deleteEntity(item.entityType, item.entityId);
        break;
    }
  }

  // Criar entidade
  private static async createEntity(entityType: string, entityId: string, data: any) {
    switch (entityType) {
      case 'collection':
        await prisma.collection.create({
          data: {
            ...data,
            id: entityId
          }
        });
        break;
      case 'feed':
        await prisma.collectionFeed.create({
          data: {
            ...data,
            id: entityId
          }
        });
        break;
      case 'tag':
        await prisma.tag.create({
          data: {
            ...data,
            id: entityId
          }
        });
        break;
      default:
        throw new Error(`Tipo de entidade não suportado: ${entityType}`);
    }
  }

  // Atualizar entidade
  private static async updateEntity(entityType: string, entityId: string, data: any) {
    switch (entityType) {
      case 'collection':
        await prisma.collection.update({
          where: { id: entityId },
          data
        });
        break;
      case 'feed':
        await prisma.collectionFeed.update({
          where: { id: entityId },
          data
        });
        break;
      case 'tag':
        await prisma.tag.update({
          where: { id: entityId },
          data
        });
        break;
      default:
        throw new Error(`Tipo de entidade não suportado: ${entityType}`);
    }
  }

  // Deletar entidade
  private static async deleteEntity(entityType: string, entityId: string) {
    switch (entityType) {
      case 'collection':
        await prisma.collection.delete({
          where: { id: entityId }
        });
        break;
      case 'feed':
        await prisma.collectionFeed.delete({
          where: { id: entityId }
        });
        break;
      case 'tag':
        await prisma.tag.delete({
          where: { id: entityId }
        });
        break;
      default:
        throw new Error(`Tipo de entidade não suportado: ${entityType}`);
    }
  }

  // Adicionar operação à fila
  static async addToQueue(userId: string, operation: {
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    data: any;
    priority?: number;
  }) {
    const validated = SyncQueueSchema.parse(operation);

    return prisma.syncQueue.create({
      data: {
        userId,
        ...validated
      }
    });
  }

  // Detectar conflitos
  static async detectConflicts(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      select: { id: true, updatedAt: true }
    });

    const conflicts: SyncConflict[] = [];

    for (const collection of collections) {
      // Verificar se há versões diferentes da mesma entidade
      const otherVersions = await prisma.collection.findMany({
        where: {
          id: collection.id,
          NOT: { userId }
        },
        select: { id: true, updatedAt: true }
      });

      for (const other of otherVersions) {
        if (other.updatedAt > collection.updatedAt) {
          conflicts.push({
            id: '', // Será gerado pelo Prisma
            sessionId: '', // Será preenchido quando o conflito for criado
            entityType: 'collection',
            entityId: collection.id,
            operation: 'UPDATE',
            localData: { updatedAt: collection.updatedAt },
            remoteData: { updatedAt: other.updatedAt },
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    // Salvar conflitos no banco
    if (conflicts.length > 0) {
      await prisma.syncConflict.createMany({
        data: conflicts.map(c => ({
          sessionId: '', // Será preenchido quando o conflito for criado
          ...c
        }))
      });
    }

    return conflicts.length;
  }

  // Resolver conflitos
  private static async resolveConflicts(sessionId: string) {
    const conflicts = await prisma.syncConflict.findMany({
      where: {
        sessionId,
        status: 'PENDING'
      }
    });

    for (const conflict of conflicts) {
      // Lógica de resolução automática (última atualização vence)
      const resolution = {
        strategy: 'latest_wins',
        winner: conflict.localData?.updatedAt > conflict.remoteData?.updatedAt ? 'local' : 'remote',
        resolvedAt: new Date()
      };

      await prisma.syncConflict.update({
        where: { id: conflict.id },
        data: {
          status: 'RESOLVED',
          resolution
        }
      });

      // Aplicar resolução
      if (resolution.winner === 'remote') {
        await this.applyRemoteData(conflict);
      }
    }
  }

  // Aplicar dados remotos
  private static async applyRemoteData(conflict: SyncConflict) {
    // Aqui você aplicaria os dados remotos à entidade local
    // Isso depende da implementação específica da sua aplicação
    console.log(`Aplicando dados remotos para ${conflict.entityType}:${conflict.entityId}`);
  }

  // Obter status de sincronização
  static async getSyncStatus(userId: string) {
    const [sessions, queueStats, conflictStats] = await Promise.all([
      prisma.syncSession.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.syncQueue.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { attempts: true }
      }),
      prisma.syncConflict.count({ where: { sessionId: { userId } } })
    ]);

    return {
      activeSessions: sessions,
      queueItems: queueStats._count.id,
      totalAttempts: queueStats._sum.attempts || 0,
      conflicts: conflictStats
    };
  }

  // Gerar backup dos dados
  static async generateBackup(userId: string) {
    const [collections, feeds, tags] = await Promise.all([
      prisma.collection.findMany({
        where: { userId },
        include: {
          children: true,
          videos: true,
          channels: true,
          playlists: true,
          feeds: true
        }
      }),
      prisma.collectionFeed.findMany({
        where: { collection: { userId } },
        include: {
          collection: true
        }
      }),
      prisma.tag.findMany({
        where: { OR: [
          { collections: { some: { userId } } },
          { feeds: { some: { collection: { userId } } } }
        ]}
      })
    ]);

    return {
      collections,
      feeds,
      tags,
      metadata: {
        generatedAt: new Date(),
        version: '1.0',
        userId
      }
    };
  }

  // Restaurar backup
  static async restoreBackup(userId: string, backup: any) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Restaurar tags
      for (const tag of backup.tags) {
        await tx.tag.upsert({
          where: { id: tag.id },
          update: tag,
          create: tag
        });
      }

      // Restaurar coleções
      for (const collection of backup.collections) {
        await tx.collection.upsert({
          where: { id: collection.id },
          update: collection,
          create: collection
        });
      }

      // Restaurar feeds
      for (const feed of backup.feeds) {
        await tx.collectionFeed.upsert({
          where: { id: feed.id },
          update: feed,
          create: feed
        });
      }

      return { success: true, itemsRestored: backup.collections.length + backup.feeds.length + backup.tags.length };
    });

    return transaction;
  }

  // Limpar dados antigos
  static async cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const [deletedSessions, deletedQueue, deletedConflicts] = await Promise.all([
      prisma.syncSession.deleteMany({
        where: { lastSync: { lt: cutoffDate } }
      }),
      prisma.syncQueue.deleteMany({
        where: {
          OR: [
            { completedAt: { lt: cutoffDate } },
            { status: 'FAILED' }
          ]
        }
      }),
      prisma.syncConflict.deleteMany({
        where: {
          OR: [
            { status: { in: ['RESOLVED', 'IGNORED'] } },
            { createdAt: { lt: cutoffDate } }
          ]
        }
      })
    ]);

    return {
      deletedSessions,
      deletedQueue,
      deletedConflicts
    };
  }
}

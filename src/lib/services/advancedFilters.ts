import { prisma } from '../prisma';
import { z } from 'zod';

// Tipos
export type FilterPreset = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  filters: any;
  sortOptions: any;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type FilterHistory = {
  id: string;
  userId: string;
  filters: any;
  sortOptions: any;
  collectionId?: string;
  resultCount: number;
  executionTime: number;
  createdAt: Date;
};

export type FilterCondition = {
  id: string;
  presetId: string;
  field: string;
  operator: string;
  value: any;
  logic: string;
  createdAt: Date;
};

export type FilterOptions = {
  fields: {
    title: { type: 'string'; operators: string[]; label: string };
    description: { type: 'string'; operators: string[]; label: string };
    duration: { type: 'number'; operators: string[]; label: string };
    viewCount: { type: 'number'; operators: string[]; label: string };
    likeCount: { type: 'number'; operators: string[]; label: string };
    commentCount: { type: 'number'; operators: string[]; label: string };
    publishedAt: { type: 'date'; operators: string[]; label: string };
    channelId: { type: 'select'; operators: string[]; label: string; options: any[] };
    tags: { type: 'multiselect'; operators: string[]; label: string; options: any[] };
    category: { type: 'select'; operators: string[]; label: string; options: any[] };
  };
  operators: {
    equals: { label: 'Igual a'; type: 'exact' };
    notEquals: { label: 'Diferente de'; type: 'exact' };
    contains: { label: 'Contém'; type: 'text' };
    notContains: { label: 'Não contém'; type: 'text' };
    startsWith: { label: 'Começa com'; type: 'text' };
    endsWith: { label: 'Termina com'; type: 'text' };
    gt: { label: 'Maior que'; type: 'number' };
    gte: { label: 'Maior ou igual'; type: 'number' };
    lt: { label: 'Menor que'; type: 'number' };
    lte: { label: 'Menor ou igual'; type: 'number' };
    after: { label: 'Depois de'; type: 'date' };
    before: { label: 'Antes de'; type: 'date' };
    in: { label: 'Está em'; type: 'list' };
    notIn: { label: 'Não está em'; type: 'list' };
    has: { label: 'Possui'; type: 'list' };
    notHas: { label: 'Não possui'; type: 'list' };
  };
};

// Schema de validação
const FilterPresetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  filters: z.any(),
  sortOptions: z.any()
});

const FilterConditionSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  logic: z.string().default('AND')
});

// Serviço
export class AdvancedFiltersService {
  // Obter opções de filtros
  static getFilterOptions(): FilterOptions {
    return {
      fields: {
        title: {
          type: 'string',
          operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith', 'endsWith'],
          label: 'Título'
        },
        description: {
          type: 'string',
          operators: ['contains', 'notContains', 'equals', 'notEquals'],
          label: 'Descrição'
        },
        duration: {
          type: 'number',
          operators: ['gt', 'gte', 'lt', 'lte', 'equals', 'notEquals'],
          label: 'Duração (segundos)'
        },
        viewCount: {
          type: 'number',
          operators: ['gt', 'gte', 'lt', 'lte', 'equals', 'notEquals'],
          label: 'Visualizações'
        },
        likeCount: {
          type: 'number',
          operators: ['gt', 'gte', 'lt', 'lte', 'equals', 'notEquals'],
          label: 'Curtidas'
        },
        commentCount: {
          type: 'number',
          operators: ['gt', 'gte', 'lt', 'lte', 'equals', 'notEquals'],
          label: 'Comentários'
        },
        publishedAt: {
          type: 'date',
          operators: ['after', 'before', 'equals', 'notEquals'],
          label: 'Data de Publicação'
        },
        channelId: {
          type: 'select',
          operators: ['equals', 'notEquals', 'in', 'notIn'],
          label: 'Canal',
          options: [] // Será populado dinamicamente
        },
        tags: {
          type: 'multiselect',
          operators: ['has', 'notHas', 'in', 'notIn'],
          label: 'Tags',
          options: [] // Será populado dinamicamente
        },
        category: {
          type: 'select',
          operators: ['equals', 'notEquals', 'in', 'notIn'],
          label: 'Categoria',
          options: [
            { value: 'tecnologia', label: 'Tecnologia' },
            { value: 'educação', label: 'Educação' },
            { value: 'entretenimento', label: 'Entretenimento' },
            { value: 'notícias', label: 'Notícias' },
            { value: 'ciência', label: 'Ciência' },
            { value: 'saúde', label: 'Saúde' },
            { value: 'moda', label: 'Moda' },
            { value: 'viagem', label: 'Viagem' }
          ]
        }
      },
      operators: {
        equals: { label: 'Igual a', type: 'exact' },
        notEquals: { label: 'Diferente de', type: 'exact' },
        contains: { label: 'Contém', type: 'text' },
        notContains: { label: 'Não contém', type: 'text' },
        startsWith: { label: 'Começa com', type: 'text' },
        endsWith: { label: 'Termina com', type: 'text' },
        gt: { label: 'Maior que', type: 'number' },
        gte: { label: 'Maior ou igual', type: 'number' },
        lt: { label: 'Menor que', type: 'number' },
        lte: { label: 'Menor ou igual', type: 'number' },
        after: { label: 'Depois de', type: 'date' },
        before: { label: 'Antes de', type: 'date' },
        in: { label: 'Está em', type: 'list' },
        notIn: { label: 'Não está em', type: 'list' },
        has: { label: 'Possui', type: 'list' },
        notHas: { label: 'Não possui', type: 'list' }
      }
    };
  }

  // Criar preset de filtro
  static async createFilterPreset(userId: string, data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    isDefault?: boolean;
    filters: any;
    sortOptions: any;
  }) {
    const validated = FilterPresetSchema.parse(data);

    return prisma.filterPreset.create({
      data: {
        userId,
        ...validated
      }
    });
  }

  // Obter presets do usuário
  static async getUserFilterPresets(userId: string, options: {
    includePublic?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const where: any = { userId };

    if (options.includePublic) {
      where.OR = [
        { userId },
        { isPublic: true }
      ];
    }

    return prisma.filterPreset.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: options.limit || 20,
      skip: options.offset || 0
    });
  }

  // Obter preset por ID
  static async getFilterPreset(id: string, userId?: string) {
    const where: any = { id };

    if (userId) {
      where.OR = [
        { id: id, userId },
        { isPublic: true }
      ];
    }

    return prisma.filterPreset.findUnique({
      where,
      include: {
        conditions: true
      }
    });
  }

  // Atualizar preset
  static async updateFilterPreset(id: string, userId: string, data: Partial<FilterPreset>) {
    const validated = FilterPresetSchema.parse(data);

    return prisma.filterPreset.updateMany({
      where: {
        id,
        userId
      },
      data: validated
    });
  }

  // Excluir preset
  static async deleteFilterPreset(id: string, userId: string) {
    return prisma.filterPreset.deleteMany({
      where: {
        id,
        userId
      }
    });
  }

  // Adicionar condição ao preset
  static async addFilterCondition(presetId: string, userId: string, data: {
    field: string;
    operator: string;
    value: any;
    logic?: string;
  }) {
    // Verificar se o preset pertence ao usuário
    const preset = await this.getFilterPreset(presetId, userId);
    if (!preset) {
      throw new Error('Preset não encontrado ou acesso negado');
    }

    const validated = FilterConditionSchema.parse(data);

    return prisma.filterCondition.create({
      data: {
        presetId,
        ...validated
      }
    });
  }

  // Remover condição do preset
  static async removeFilterCondition(conditionId: string, userId: string) {
    // Verificar se o preset pertence ao usuário
    const condition = await prisma.filterCondition.findUnique({
      where: { id: conditionId },
      include: { preset: true }
    });

    if (!condition || condition.preset.userId !== userId) {
      throw new Error('Condição não encontrada ou acesso negado');
    }

    return prisma.filterCondition.delete({
      where: { id: conditionId }
    });
  }

  // Aplicar filtros a coleção
  static async applyFilters(collectionId: string, userId: string, filters: any, sortOptions: any) {
    const startTime = Date.now();

    // Verificar se o usuário tem acesso à coleção
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!collection) {
      throw new Error('Coleção não encontrada ou acesso negado');
    }

    // Construir query base
    const where: any = {};

    // Aplicar filtros
    if (filters.conditions?.length) {
      const conditions = this.buildFilterQuery(filters.conditions);
      where.AND = conditions;
    }

    // Aplicar filtros de coleção
    where.OR = [
      { collections: { some: { id: collectionId } } },
      { channels: { some: { collections: { some: { id: collectionId } } } } }
    ];

    // Aplicar ordenação
    const orderBy: any = {};
    if (sortOptions.field && sortOptions.direction) {
      orderBy[sortOptions.field] = sortOptions.direction;
    }

    // Executar query
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        include: {
          channel: {
            select: { id: true, title: true, thumbnailUrl: true }
          },
          tags: {
            select: { id: true, name: true }
          },
          collections: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.video.count({ where })
    ]);

    const executionTime = Date.now() - startTime;

    // Registrar histórico
    await this.saveFilterHistory(userId, filters, sortOptions, collectionId, total, executionTime);

    return {
      videos,
      total,
      executionTime,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  // Construir query de filtros
  private static buildFilterQuery(conditions: any[]): any[] {
    const queries: any[] = [];

    conditions.forEach((condition) => {
      const query = this.buildSingleCondition(condition);
      if (query) {
        queries.push(query);
      }
    });

    return queries;
  }

  // Construir condição individual
  private static buildSingleCondition(condition: any): any {
    const { field, operator, value, logic } = condition;
    const query: any = {};

    switch (field) {
      case 'title':
        switch (operator) {
          case 'contains':
            query.title = { contains: value, mode: 'insensitive' };
            break;
          case 'notContains':
            query.title = { not: { contains: value, mode: 'insensitive' } };
            break;
          case 'equals':
            query.title = { equals: value, mode: 'insensitive' };
            break;
          case 'notEquals':
            query.title = { not: { equals: value, mode: 'insensitive' } };
            break;
          case 'startsWith':
            query.title = { startsWith: value, mode: 'insensitive' };
            break;
          case 'endsWith':
            query.title = { endsWith: value, mode: 'insensitive' };
            break;
        }
        break;

      case 'description':
        switch (operator) {
          case 'contains':
            query.description = { contains: value, mode: 'insensitive' };
            break;
          case 'notContains':
            query.description = { not: { contains: value, mode: 'insensitive' } };
            break;
          case 'equals':
            query.description = { equals: value, mode: 'insensitive' };
            break;
          case 'notEquals':
            query.description = { not: { equals: value, mode: 'insensitive' } };
            break;
        }
        break;

      case 'duration':
        switch (operator) {
          case 'gt':
            query.duration = { gt: value };
            break;
          case 'gte':
            query.duration = { gte: value };
            break;
          case 'lt':
            query.duration = { lt: value };
            break;
          case 'lte':
            query.duration = { lte: value };
            break;
          case 'equals':
            query.duration = { equals: value };
            break;
          case 'notEquals':
            query.duration = { not: { equals: value } };
            break;
        }
        break;

      case 'viewCount':
        switch (operator) {
          case 'gt':
            query.viewCount = { gt: value };
            break;
          case 'gte':
            query.viewCount = { gte: value };
            break;
          case 'lt':
            query.viewCount = { lt: value };
            break;
          case 'lte':
            query.viewCount = { lte: value };
            break;
          case 'equals':
            query.viewCount = { equals: value };
            break;
          case 'notEquals':
            query.viewCount = { not: { equals: value } };
            break;
        }
        break;

      case 'likeCount':
        switch (operator) {
          case 'gt':
            query.likeCount = { gt: value };
            break;
          case 'gte':
            query.likeCount = { gte: value };
            break;
          case 'lt':
            query.likeCount = { lt: value };
            break;
          case 'lte':
            query.likeCount = { lte: value };
            break;
          case 'equals':
            query.likeCount = { equals: value };
            break;
          case 'notEquals':
            query.likeCount = { not: { equals: value } };
            break;
        }
        break;

      case 'commentCount':
        switch (operator) {
          case 'gt':
            query.commentCount = { gt: value };
            break;
          case 'gte':
            query.commentCount = { gte: value };
            break;
          case 'lt':
            query.commentCount = { lt: value };
            break;
          case 'lte':
            query.commentCount = { lte: value };
            break;
          case 'equals':
            query.commentCount = { equals: value };
            break;
          case 'notEquals':
            query.commentCount = { not: { equals: value } };
            break;
        }
        break;

      case 'publishedAt':
        switch (operator) {
          case 'after':
            query.publishedAt = { gt: new Date(value) };
            break;
          case 'before':
            query.publishedAt = { lt: new Date(value) };
            break;
          case 'equals':
            query.publishedAt = { equals: new Date(value) };
            break;
          case 'notEquals':
            query.publishedAt = { not: { equals: new Date(value) } };
            break;
        }
        break;

      case 'channelId':
        switch (operator) {
          case 'equals':
            query.channelId = { equals: value };
            break;
          case 'notEquals':
            query.channelId = { not: { equals: value } };
            break;
          case 'in':
            query.channelId = { in: value };
            break;
          case 'notIn':
            query.channelId = { not: { in: value } };
            break;
        }
        break;

      case 'tags':
        switch (operator) {
          case 'has':
            query.tags = {
              some: {
                name: { in: Array.isArray(value) ? value : [value] }
              }
            };
            break;
          case 'notHas':
            query.tags = {
              none: {
                name: { in: Array.isArray(value) ? value : [value] }
              }
            };
            break;
          case 'in':
            query.tags = {
              some: {
                name: { in: value }
              }
            };
            break;
          case 'notIn':
            query.tags = {
              none: {
                name: { in: value }
              }
            };
            break;
        }
        break;

      case 'category':
        switch (operator) {
          case 'equals':
            query.categoryId = { equals: value };
            break;
          case 'notEquals':
            query.categoryId = { not: { equals: value } };
            break;
          case 'in':
            query.categoryId = { in: value };
            break;
          case 'notIn':
            query.categoryId = { not: { in: value } };
            break;
        }
        break;
    }

    return query;
  }

  // Salvar histórico de filtros
  private static async saveFilterHistory(userId: string, filters: any, sortOptions: any, collectionId: string, resultCount: number, executionTime: number) {
    return prisma.filterHistory.create({
      data: {
        userId,
        filters,
        sortOptions,
        collectionId,
        resultCount,
        executionTime
      }
    });
  }

  // Obter histórico de filtros
  static async getFilterHistory(userId: string, options: {
    limit?: number;
    offset?: number;
    collectionId?: string;
  } = {}) {
    const where: any = { userId };

    if (options.collectionId) {
      where.collectionId = options.collectionId;
    }

    return prisma.filterHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
      skip: options.offset || 0
    });
  }

  // Limpar histórico
  static async clearFilterHistory(userId: string, olderThan?: Date) {
    const where: any = { userId };

    if (olderThan) {
      where.createdAt = { lt: olderThan };
    }

    return prisma.filterHistory.deleteMany({ where });
  }

  // Obter canais disponíveis para filtro
  static async getAvailableChannels(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      select: { id: true }
    });

    const collectionIds = collections.map(c => c.id);

    const channels = await prisma.channel.findMany({
      where: {
        collections: {
          some: { id: { in: collectionIds } }
        }
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true
      }
    });

    return channels.map(channel => ({
      value: channel.id,
      label: channel.title,
      thumbnail: channel.thumbnailUrl
    }));
  }

  // Obter tags disponíveis para filtro
  static async getAvailableTags(userId: string) {
    const collections = await prisma.collection.findMany({
      where: { userId },
      select: { id: true }
    });

    const collectionIds = collections.map(c => c.id);

    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { collections: { some: { id: { in: collectionIds } } } },
          { videos: { some: { collections: { some: { id: { in: collectionIds } } } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    return tags.map(tag => ({
      value: tag.id,
      label: tag.name,
      color: tag.color
    }));
  }

  // Exportar presets
  static async exportFilterPresets(userId: string) {
    const presets = await this.getUserFilterPresets(userId, { includePublic: true });

    return {
      presets,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Importar presets
  static async importFilterPresets(userId: string, data: any) {
    const { presets } = data;

    const results = [];

    for (const preset of presets) {
      try {
        // Verificar se já existe um preset com o mesmo nome
        const existing = await prisma.filterPreset.findFirst({
          where: {
            userId,
            name: preset.name
          }
        });

        if (!existing) {
          const created = await this.createFilterPreset(userId, preset);
          results.push({ preset: preset.name, status: 'created', id: created.id });
        } else {
          results.push({ preset: preset.name, status: 'skipped', reason: 'already_exists' });
        }
      } catch (error) {
        results.push({ preset: preset.name, status: 'error', error: error.message });
      }
    }

    return results;
  }

  // Gerar relatório de uso de filtros
  static async generateFilterUsageReport(userId: string, dateRange: { start: Date; end: Date }) {
    const history = await prisma.filterHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });

    // Analisar padrões de uso
    const fieldUsage = {};
    const operatorUsage = {};
    const totalQueries = history.length;
    const avgExecutionTime = history.reduce((sum, h) => sum + h.executionTime, 0) / totalQueries;

    history.forEach(h => {
      // Analisar campos usados
      Object.keys(h.filters.conditions || {}).forEach(field => {
        fieldUsage[field] = (fieldUsage[field] || 0) + 1;
      });

      // Analisar operadores usados
      h.filters.conditions?.forEach((condition: any) => {
        operatorUsage[condition.operator] = (operatorUsage[condition.operator] || 0) + 1;
      });
    });

    return {
      totalQueries,
      avgExecutionTime,
      fieldUsage: Object.entries(fieldUsage).sort(([,a], [,b]) => b - a),
      operatorUsage: Object.entries(operatorUsage).sort(([,a], [,b]) => b - a),
      topPresets: history
        .filter(h => h.filters.presetId)
        .reduce((acc, h) => {
          acc[h.filters.presetId] = (acc[h.filters.presetId] || 0) + 1;
          return acc;
        }, {}),
      dateRange
    };
  }
}

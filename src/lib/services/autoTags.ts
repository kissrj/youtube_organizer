import { prisma } from '@/lib/prisma'

// Tipos
export type AutoTagRule = {
  id: string;
  name: string;
  description?: string;
  titlePattern?: string;
  descriptionPattern?: string;
  category?: string;
  keywords?: string[];
  isActive: boolean;
  priority: number;
};

export type VideoAnalysis = {
  id: string;
  videoId: string;
  titleAnalysis: {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
  };
  descriptionAnalysis: {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
  };
  categoryAnalysis: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  suggestedTags: string[];
  confidenceScore: number;
};

// Serviço
export class AutoTagsService {
  // Criar regra de tag automática
  static async createAutoTagRule(data: {
    name: string;
    description?: string;
    titlePattern?: string;
    descriptionPattern?: string;
    category?: string;
    keywords?: string[];
    isActive?: boolean;
    priority?: number;
    userId: string;
  }) {
    return prisma.autoTagRule.create({
      data: {
        name: data.name,
        description: data.description,
        titlePattern: data.titlePattern,
        descriptionPattern: data.descriptionPattern,
        category: data.category,
        keywords: data.keywords ? JSON.stringify(data.keywords) : null,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 1,
        userId: data.userId
      }
    });
  }

  // Obter todas as regras
  static async getAutoTagRules(userId: string) {
    const rules = await prisma.autoTagRule.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
      include: {
        tags: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    return rules.map(rule => ({
      ...rule,
      keywords: rule.keywords ? JSON.parse(rule.keywords) : []
    }));
  }

  // Atualizar regra
  static async updateAutoTagRule(id: string, data: Partial<AutoTagRule>) {
    const updateData: any = {
      name: data.name,
      description: data.description,
      titlePattern: data.titlePattern,
      descriptionPattern: data.descriptionPattern,
      category: data.category,
      isActive: data.isActive,
      priority: data.priority
    };

    if (data.keywords) {
      updateData.keywords = JSON.stringify(data.keywords);
    }

    return prisma.autoTagRule.update({
      where: { id },
      data: updateData
    });
  }

  // Excluir regra
  static async deleteAutoTagRule(id: string) {
    return prisma.autoTagRule.delete({
      where: { id }
    });
  }

  // Analisar vídeo e sugerir tags
  static async analyzeVideo(videoId: string): Promise<VideoAnalysis> {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        tags: true
      }
    });

    if (!video) {
      throw new Error('Vídeo não encontrado');
    }

    // Análise de título
    const titleAnalysis = this.analyzeText(video.title);

    // Análise de descrição
    const descriptionAnalysis = video.description
      ? this.analyzeText(video.description)
      : { keywords: [], sentiment: 'neutral' as const, topics: [] };

    // Análise de categoria
    const categoryAnalysis = this.analyzeCategory(video);

    // Sugestão de tags
    const suggestedTags = await this.suggestTags(video, titleAnalysis, descriptionAnalysis, categoryAnalysis);

    // Criar registro de análise
    const analysis = await prisma.videoAnalysis.create({
      data: {
        videoId,
        titleAnalysis: JSON.stringify(titleAnalysis),
        descriptionAnalysis: JSON.stringify(descriptionAnalysis),
        categoryAnalysis: JSON.stringify(categoryAnalysis),
        suggestedTags: JSON.stringify(suggestedTags),
        confidenceScore: this.calculateConfidence(titleAnalysis, descriptionAnalysis, categoryAnalysis)
      }
    });

    return {
      id: analysis.id,
      videoId,
      titleAnalysis,
      descriptionAnalysis,
      categoryAnalysis,
      suggestedTags,
      confidenceScore: analysis.confidenceScore
    };
  }

  // Análise de texto (palavras-chave, sentimento, tópicos)
  private static analyzeText(text: string) {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const words = cleanText.split(' ').filter(word => word.length > 0);

    // Extração de palavras-chave (palavras com mais de 3 caracteres e não muito comuns)
    const stopWords = ['o', 'a', 'e', 'é', 'um', 'uma', 'para', 'com', 'sem', 'por', 'que', 'de', 'do', 'da', 'em', 'no', 'na', 'os', 'as', 'dos', 'das'];
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remover duplicatas
      .slice(0, 10); // Limitar a 10 palavras

    // Análise de sentimento (simplificada)
    const positiveWords = ['bom', 'ótimo', 'excelente', 'maravilhoso', 'incrível', 'fantástico', 'legal', 'show', 'top'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'terrível', 'fraco', 'chato', 'não', 'nada'];

    const positiveCount = keywords.filter(kw => positiveWords.includes(kw)).length;
    const negativeCount = keywords.filter(kw => negativeWords.includes(kw)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // Identificação de tópicos (categorias baseadas em palavras)
    const topics = this.identifyTopics(keywords);

    return {
      keywords,
      sentiment,
      topics
    };
  }

  // Análise de categoria
  private static analyzeCategory(video: any) {
    const categoryMap: Record<string, string[]> = {
      'tecnologia': ['tech', 'tecnologia', 'software', 'programação', 'coding', 'desenvolvimento', 'python', 'javascript', 'java'],
      'educação': ['educação', 'ensino', 'aprendizado', 'curso', 'aula', 'tutorial', 'lição'],
      'entretenimento': ['entretenimento', 'filme', 'série', 'música', 'jogo', 'game', 'diversão'],
      'notícias': ['notícia', 'notícias', 'jornal', 'política', 'economia', 'atualidade'],
      'ciência': ['ciência', 'pesquisa', 'estudo', 'experimento', 'descoberta', 'tecnologia'],
      'saúde': ['saúde', 'medicina', 'bem-estar', 'fitness', 'nutrição', 'doença'],
      'moda': ['moda', 'vestuário', 'estilo', 'beleza', 'maquiagem', 'roupa'],
      'viagem': ['viagem', 'turismo', 'destino', 'hotel', 'passagem', 'lazer']
    };

    let primaryCategory = 'geral';
    let secondaryCategories: string[] = [];
    let maxScore = 0;

    Object.entries(categoryMap).forEach(([category, keywords]) => {
      const score = keywords.filter(keyword =>
        video.title.toLowerCase().includes(keyword) ||
        (video.description && video.description.toLowerCase().includes(keyword))
      ).length;

      if (score > maxScore) {
        maxScore = score;
        primaryCategory = category;
      }

      if (score > 0 && category !== primaryCategory) {
        secondaryCategories.push(category);
      }
    });

    return {
      primary: primaryCategory,
      secondary: secondaryCategories.slice(0, 3), // Limitar a 3 categorias secundárias
      confidence: Math.min(maxScore / 3, 1) // Normalizar para 0-1
    };
  }

  // Identificar tópicos baseado em palavras-chave
  private static identifyTopics(keywords: string[]): string[] {
    const topicMap: Record<string, string[]> = {
      'programação': ['python', 'javascript', 'java', 'coding', 'desenvolvimento', 'software'],
      'design': ['design', 'ui', 'ux', 'interface', 'gráfico', 'visual'],
      'marketing': ['marketing', 'vendas', 'publicidade', 'promoção', 'branding'],
      'negócios': ['negócio', 'empresa', 'startup', 'empreendedorismo', 'finanças'],
      'criatividade': ['arte', 'criatividade', 'inspiração', 'ideias', 'inovação'],
      'produtividade': ['produtividade', 'eficiência', 'organização', 'gestão', 'tempo']
    };

    const identifiedTopics: string[] = [];

    Object.entries(topicMap).forEach(([topic, topicKeywords]) => {
      if (topicKeywords.some(keyword => keywords.includes(keyword))) {
        identifiedTopics.push(topic);
      }
    });

    return identifiedTopics;
  }

  // Calcular score de confiança
  private static calculateConfidence(
    titleAnalysis: any,
    descriptionAnalysis: any,
    categoryAnalysis: any
  ): number {
    const titleWeight = 0.4;
    const descriptionWeight = 0.3;
    const categoryWeight = 0.3;

    const titleScore = titleAnalysis.keywords.length > 0 ? 1 : 0;
    const descriptionScore = descriptionAnalysis.keywords.length > 0 ? 1 : 0;
    const categoryScore = categoryAnalysis.confidence;

    return (
      titleScore * titleWeight +
      descriptionScore * descriptionWeight +
      categoryScore * categoryWeight
    );
  }

  // Sugerir tags baseado em análise
  private static async suggestTags(
    video: any,
    titleAnalysis: any,
    descriptionAnalysis: any,
    categoryAnalysis: any
  ): Promise<string[]> {
    const allKeywords = [
      ...titleAnalysis.keywords,
      ...descriptionAnalysis.keywords,
      ...categoryAnalysis.primary,
      ...categoryAnalysis.secondary,
      ...titleAnalysis.topics,
      ...descriptionAnalysis.topics
    ];

    // Remover duplicatas
    const uniqueKeywords = [...new Set(allKeywords)];

    // Buscar tags existentes que correspondem às palavras-chave
    const existingTags = await prisma.tag.findMany({
      where: {
        userId: video.userId,
        OR: uniqueKeywords.map(keyword => ({
          name: { contains: keyword, mode: 'insensitive' }
        }))
      }
    });

    // Se não encontrar tags existentes, criar tags automáticas
    if (existingTags.length === 0) {
      const autoTags = uniqueKeywords.slice(0, 5).map(keyword => ({
        name: keyword,
        isAuto: true,
        category: categoryAnalysis.primary
      }));

      return autoTags.map(tag => tag.name);
    }

    // Filtrar tags por relevância
    const relevantTags = existingTags.filter(tag => {
      const relevanceScore = uniqueKeywords.filter(keyword =>
        tag.name.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      return relevanceScore > 0;
    });

    return relevantTags.slice(0, 10).map(tag => tag.name);
  }

  // Aplicar tags automáticas a um vídeo
  static async applyAutoTags(videoId: string) {
    try {
      // Analisar vídeo
      const analysis = await this.analyzeVideo(videoId);

      // Buscar tags existentes
      const existingTags = await prisma.tag.findMany({
        where: {
          name: { in: analysis.suggestedTags }
        }
      });

      // Criar tags que não existem
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (!video) throw new Error('Vídeo não encontrado');

      const newTags = analysis.suggestedTags.filter(tagName =>
        !existingTags.some(tag => tag.name === tagName)
      );

      if (newTags.length > 0) {
        await prisma.tag.createMany({
          data: newTags.map((name: string) => ({
            name,
            isAuto: true,
            category: 'automático',
            userId: video.userId
          }))
        });
      }

      // Atualizar lista de tags existentes
      const allTags = [...existingTags, ...newTags.map(name => ({ name } as any))];

      // Associar tags ao vídeo
      await prisma.video.update({
        where: { id: videoId },
        data: {
          tags: {
            connect: allTags.map(tag => ({ id: tag.id }))
          }
        }
      });

      // Criar sugestões de tags
      const tagSuggestions = await prisma.tagSuggestion.createMany({
        data: allTags.map(tag => ({
          videoId,
          tagId: tag.id,
          confidence: analysis.confidenceScore,
          source: 'auto'
        }))
      });

      return {
        success: true,
        tagsApplied: allTags.length,
        analysis: analysis
      };
    } catch (error) {
      console.error('Erro ao aplicar tags automáticas:', error);
      throw new Error('Falha ao aplicar tags automáticas');
    }
  }

  // Aplicar tags automáticas a múltiplos vídeos
  static async applyAutoToMultipleVideos(videoIds: string[]) {
    const results = await Promise.allSettled(
      videoIds.map(videoId => this.applyAutoTags(videoId))
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: videoIds.length,
      success,
      failed,
      results: results.map((r, index) => ({
        videoId: videoIds[index],
        success: r.status === 'fulfilled',
        result: r.status === 'fulfilled' ? r.value : (r.reason as Error).message
      }))
    };
  }

  // Aceitar sugestão de tag
  static async acceptTagSuggestion(videoId: string, tagId: string) {
    return prisma.tagSuggestion.update({
      where: {
        videoId_tagId: {
          videoId,
          tagId
        }
      },
      data: {
        isAccepted: true,
        acceptedAt: new Date()
      }
    });
  }

  // Rejeitar sugestão de tag
  static async rejectTagSuggestion(videoId: string, tagId: string) {
    return prisma.tagSuggestion.update({
      where: {
        videoId_tagId: {
          videoId,
          tagId
        }
      },
      data: {
        isAccepted: false,
        rejectedAt: new Date()
      }
    });
  }

  // Obter estatísticas de tags automáticas
  static async getAutoTagStats(userId: string) {
    const [totalTags, autoTags, totalVideos, analyzedVideos] = await Promise.all([
      prisma.tag.count({ where: { userId } }),
      prisma.tag.count({ where: { userId, isAuto: true } }),
      prisma.video.count({ where: { userId } }),
      prisma.videoAnalysis.count({
        where: {
          video: { userId }
        }
      })
    ]);

    return {
      totalTags,
      autoTags,
      manualTags: totalTags - autoTags,
      totalVideos,
      analyzedVideos,
      coverage: totalVideos > 0 ? (analyzedVideos / totalVideos) * 100 : 0
    };
  }
}

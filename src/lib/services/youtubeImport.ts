import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { syncVideoFromYouTube } from './video';
import { OpenRouterService } from './openRouter';
import { TagValidator } from './autoTags';

export interface ImportOptions {
  importHistory: boolean;
  importPlaylists: boolean;
  days: number;
  applyAITags: boolean;
}

export interface ImportProgress {
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  overallProgress: number;
  currentStep: string;
  videosImported: number;
  playlistsImported: number;
  tagsCreated: number;
  categoriesCreated: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
  userId: string; // Adicionar userId para identificação
}

export class YouTubeImportService {
  private openRouter = new OpenRouterService();

  constructor() {
    // Limpar jobs antigos ao iniciar (mais de 2 horas para dar mais tempo)
    this.cleanupOldJobs();
    setInterval(() => this.cleanupOldJobs(), 10 * 60 * 1000); // Verificar a cada 10 minutos
  }

  private async cleanupOldJobs() {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const expiredJobs = await prisma.importJob.findMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              startedAt: { lt: twoHoursAgo },
              status: { in: ['RUNNING', 'FAILED'] }
            }
          ]
        }
      });

      if (expiredJobs.length > 0) {
        await prisma.importJob.updateMany({
          where: {
            id: { in: expiredJobs.map(job => job.id) }
          },
          data: {
            status: 'EXPIRED',
            completedAt: new Date()
          }
        });

        console.log(`🧹 Limpos ${expiredJobs.length} jobs antigos`);
      }
    } catch (error) {
      console.warn('Erro ao limpar jobs antigos:', error);
    }
  }

  async startImport(userId: string, options: ImportOptions): Promise<ImportProgress> {
    const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar job no banco de dados
    const dbJob = await prisma.importJob.create({
      data: {
        jobId,
        userId,
        jobType: 'youtube_import',
        status: 'RUNNING',
        overallProgress: 0,
        currentStep: 'Iniciando importação...',
        videosImported: 0,
        playlistsImported: 0,
        tagsCreated: 0,
        categoriesCreated: 0,
        options: JSON.stringify(options),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas
      }
    });

    console.log(`✅ Job criado no banco: ${jobId} para usuário: ${userId}`);

    const progress: ImportProgress = {
      jobId,
      status: 'running',
      overallProgress: 0,
      currentStep: 'Iniciando importação...',
      videosImported: 0,
      playlistsImported: 0,
      tagsCreated: 0,
      categoriesCreated: 0,
      errors: [],
      startedAt: dbJob.startedAt,
      userId
    };

    // Executar importação em background
    this.runImport(jobId, userId, options).catch(async (error) => {
      console.error(`❌ Erro na importação ${jobId}:`, error);

      // Atualizar job no banco
      await prisma.importJob.update({
        where: { jobId },
        data: {
          status: 'FAILED',
          errors: JSON.stringify([error.message]),
          completedAt: new Date()
        }
      });
    });

    return progress;
  }

  async getImportStatus(jobId: string): Promise<ImportProgress | null> {
    console.log(`📊 Verificando status do job: ${jobId}`);

    try {
      const dbJob = await prisma.importJob.findUnique({
        where: { jobId }
      });

      if (!dbJob) {
        console.log(`❌ Job não encontrado no banco: ${jobId}`);

        // Verificar se há jobs similares
        const similarJobs = await prisma.importJob.findMany({
          where: {
            jobId: { contains: jobId.substring(0, 15) },
            status: 'RUNNING'
          },
          select: { jobId: true }
        });

        if (similarJobs.length > 0) {
          console.log(`🔍 Jobs similares encontrados:`, similarJobs.map(j => j.jobId));
        }

        // Retornar um job "falhado" simulado
        const errorMessages = [
          'Job não encontrado. Pode ter expirado ou o servidor foi reiniciado.',
          'Tente iniciar uma nova importação.',
        ];

        if (similarJobs.length > 0) {
          errorMessages.push(`Jobs similares ativos: ${similarJobs.map(j => j.jobId).join(', ')}`);
        }

        return {
          jobId,
          status: 'failed',
          overallProgress: 0,
          currentStep: 'Job não encontrado ou expirado',
          videosImported: 0,
          playlistsImported: 0,
          tagsCreated: 0,
          categoriesCreated: 0,
          errors: errorMessages,
          startedAt: new Date(Date.now() - 120000), // 2 minutos atrás
          completedAt: new Date(),
          userId: 'unknown'
        };
      }

      console.log(`✅ Job encontrado no banco: ${dbJob.status} - ${dbJob.currentStep}`);
      console.log(`📊 Progresso: ${dbJob.overallProgress}%`);
      console.log(`🎬 Vídeos: ${dbJob.videosImported}, Playlists: ${dbJob.playlistsImported}, Tags: ${dbJob.tagsCreated}`);

      // Verificar se o job está muito antigo
      const now = Date.now();
      const jobAge = now - dbJob.startedAt.getTime();
      const maxAge = 2 * 60 * 60 * 1000; // 2 horas

      if (jobAge > maxAge && dbJob.status === 'RUNNING') {
        console.log(`⚠️ Job antigo detectado (${Math.round(jobAge / 60000)} minutos)`);

        // Atualizar job como expirado
        await prisma.importJob.update({
          where: { jobId },
          data: {
            status: 'EXPIRED',
            errors: JSON.stringify(['Job expirou devido ao tempo limite']),
            completedAt: new Date()
          }
        });

        dbJob.status = 'EXPIRED';
        dbJob.errors = JSON.stringify(['Job expirou devido ao tempo limite']);
        dbJob.completedAt = new Date();
      }

      // Converter dados do banco para o formato esperado
      return {
        jobId: dbJob.jobId,
        status: dbJob.status.toLowerCase() as 'running' | 'completed' | 'failed',
        overallProgress: dbJob.overallProgress,
        currentStep: dbJob.currentStep || 'Processando...',
        videosImported: dbJob.videosImported,
        playlistsImported: dbJob.playlistsImported,
        tagsCreated: dbJob.tagsCreated,
        categoriesCreated: dbJob.categoriesCreated,
        errors: dbJob.errors ? JSON.parse(dbJob.errors) : [],
        startedAt: dbJob.startedAt,
        completedAt: dbJob.completedAt || undefined,
        userId: dbJob.userId
      };

    } catch (error) {
      console.error('Erro ao buscar status do job:', error);
      return null;
    }
  }

  async getActiveJobs(): Promise<string[]> {
    try {
      const activeJobs = await prisma.importJob.findMany({
        where: {
          status: 'RUNNING',
          expiresAt: { gt: new Date() }
        },
        select: { jobId: true }
      });

      return activeJobs.map(job => job.jobId);
    } catch (error) {
      console.warn('Erro ao buscar jobs ativos:', error);
      return [];
    }
  }

  private async runImport(jobId: string, userId: string, options: ImportOptions) {
    try {
      // 1. Importar histórico de vídeos
      if (options.importHistory) {
        await this.updateJobProgress(jobId, {
          currentStep: 'Importando histórico de vídeos...',
          overallProgress: 10
        });

        const historyResult = await this.importWatchHistory(userId, options.days);

        await this.updateJobProgress(jobId, {
          videosImported: { increment: historyResult.videosImported },
          tagsCreated: { increment: historyResult.tagsCreated },
          overallProgress: 25
        });
      }

      // 2. Importar playlists
      if (options.importPlaylists) {
        await this.updateJobProgress(jobId, {
          currentStep: 'Importando playlists...',
          overallProgress: 40
        });

        const playlistResult = await this.importAllPlaylists(userId);

        await this.updateJobProgress(jobId, {
          playlistsImported: { increment: playlistResult.playlistsImported },
          videosImported: { increment: playlistResult.videosImported },
          tagsCreated: { increment: playlistResult.tagsCreated },
          overallProgress: 75
        });
      }

      // 3. Aplicar tags com IA
      if (options.applyAITags) {
        await this.updateJobProgress(jobId, {
          currentStep: 'Aplicando tags com IA...',
          overallProgress: 90
        });

        const aiResult = await this.applyAITagsToAll(userId);

        await this.updateJobProgress(jobId, {
          tagsCreated: { increment: aiResult.tagsCreated },
          overallProgress: 100
        });
      }

      // Finalizar job
      await this.updateJobProgress(jobId, {
        currentStep: 'Importação concluída!',
        status: 'COMPLETED',
        completedAt: new Date()
      });

    } catch (error) {
      console.error('Erro durante importação:', error);

      await this.updateJobProgress(jobId, {
        status: 'FAILED',
        errors: JSON.stringify([error instanceof Error ? error.message : 'Erro desconhecido']),
        completedAt: new Date()
      });
    }
  }

  private async updateJobProgress(jobId: string, updates: any) {
    try {
      await prisma.importJob.update({
        where: { jobId },
        data: updates
      });
    } catch (error) {
      console.warn(`Erro ao atualizar progresso do job ${jobId}:`, error);
    }
  }

  private async importWatchHistory(userId: string, days: number) {
    const youtube = await this.getYouTubeClient(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let nextPageToken = '';
    const importedVideos = new Set();
    let totalImported = 0;
    let tagsCreated = 0;

    do {
      const response = await youtube.activities.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
        publishedAfter: cutoffDate.toISOString()
      });

      for (const item of response.data.items || []) {
        if (item.snippet?.type === 'video' && item.contentDetails?.upload?.videoId) {
          const videoId = item.contentDetails.upload.videoId;

          if (!importedVideos.has(videoId)) {
            try {
              const video = await syncVideoFromYouTube(videoId, userId);

              // Mark video as watched since it's from watch history
              await prisma.video.update({
                where: { id: video.id },
                data: {
                  isWatched: true,
                  watchedAt: item.snippet.publishedAt ? new Date(item.snippet.publishedAt) : new Date()
                }
              });

              // Aplicar tags com IA
              const aiResult = await this.applyAITagsToVideo(video.id);
              tagsCreated += aiResult.tagsCreated;

              importedVideos.add(videoId);
              totalImported++;
            } catch (error) {
              console.warn(`Erro ao importar vídeo ${videoId}:`, error);
            }
          }
        }
      }

      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken);

    return { videosImported: totalImported, tagsCreated };
  }

  private async importAllPlaylists(userId: string) {
    const youtube = await this.getYouTubeClient(userId);
    let nextPageToken = '';
    let totalPlaylists = 0;
    let totalVideos = 0;
    let tagsCreated = 0;

    do {
      const response = await youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });

      for (const playlist of response.data.items || []) {
        try {
          const playlistResult = await this.importPlaylist(playlist, userId);
          totalPlaylists++;
          totalVideos += playlistResult.videosImported;
          tagsCreated += playlistResult.tagsCreated;
        } catch (error) {
          console.warn(`Erro ao importar playlist ${playlist.id}:`, error);
        }
      }

      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken);

    return { playlistsImported: totalPlaylists, videosImported: totalVideos, tagsCreated };
  }

  private async importPlaylist(playlistData: any, userId: string) {
    // Lógica para importar playlist
    const playlist = await prisma.playlist.upsert({
      where: { youtubeId: playlistData.id },
      update: {
        title: playlistData.snippet.title,
        description: playlistData.snippet.description,
        thumbnailUrl: playlistData.snippet.thumbnails?.default?.url,
        itemCount: playlistData.contentDetails?.itemCount || 0
      },
      create: {
        youtubeId: playlistData.id,
        title: playlistData.snippet.title,
        description: playlistData.snippet.description,
        thumbnailUrl: playlistData.snippet.thumbnails?.default?.url,
        channelTitle: playlistData.snippet.channelTitle,
        itemCount: playlistData.contentDetails?.itemCount || 0,
        userId
      }
    });

    // Importar vídeos da playlist
    const videosResult = await this.importPlaylistVideos(playlist.id, playlistData.id, userId);

    return {
      playlistId: playlist.id,
      videosImported: videosResult.videosImported,
      tagsCreated: videosResult.tagsCreated
    };
  }

  private async importPlaylistVideos(playlistId: string, youtubePlaylistId: string, userId: string) {
    const youtube = await this.getYouTubeClient(userId);
    let nextPageToken = '';
    let totalImported = 0;
    let tagsCreated = 0;

    do {
      const response = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: youtubePlaylistId,
        maxResults: 50,
        pageToken: nextPageToken
      });

      for (const item of response.data.items || []) {
        if (item.contentDetails?.videoId) {
          try {
            const video = await syncVideoFromYouTube(item.contentDetails.videoId, userId);

            // Criar associação entre vídeo e playlist
            try {
              await prisma.playlistVideo.upsert({
                where: {
                  playlistId_videoId: {
                    playlistId,
                    videoId: video.id
                  }
                },
                update: {
                  addedAt: new Date()
                },
                create: {
                  playlistId,
                  videoId: video.id
                }
              });
              console.log(`✅ Vídeo ${video.id} associado à playlist ${playlistId}`);
            } catch (assocError) {
              console.warn(`⚠️ Erro ao associar vídeo ${video.id} à playlist ${playlistId}:`, assocError);
            }

            // Aplicar tags com IA
            const aiResult = await this.applyAITagsToVideo(video.id);
            tagsCreated += aiResult.tagsCreated;

            totalImported++;
          } catch (error) {
            console.warn(`Erro ao importar vídeo ${item.contentDetails.videoId}:`, error);
          }
        }
      }

      nextPageToken = response.data.nextPageToken || '';
    } while (nextPageToken);

    return { videosImported: totalImported, tagsCreated };
  }

  private async applyAITagsToVideo(videoId: string) {
    try {
      // TEMPORÁRIO: Desabilitar IA devido a erro 402 (sem créditos)
      console.log('⚠️ Geração de tags com IA desabilitada temporariamente (erro 402)');

      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      if (!video) return { tagsCreated: 0 };

      // Usar apenas extração básica de palavras-chave (sem IA)
      const keywords = this.extractBasicKeywords(video.title, video.description || '');
      const existingTagNames = video.tags.map(t => t.tag.name);

      // Aplicar validação de tags alfanuméricas
      const validNewTags = TagValidator.sanitizeTagNames(
        keywords.filter(tag =>
          !existingTagNames.includes(tag) && tag.length > 2
        )
      ).slice(0, 3); // Limitar a 3 tags básicas válidas

      if (validNewTags.length > 0) {
        console.log(`🏷️ Criando ${validNewTags.length} tags válidas para vídeo ${videoId}:`, validNewTags);

        // Criar tags individualmente para evitar erro do Turbopack
        const createdTags = [];
        for (const tagName of validNewTags) {
          try {
            const existingTag = await prisma.tag.findFirst({
              where: {
                name: tagName,
                userId: video.userId
              }
            });

            if (!existingTag) {
              const newTag = await prisma.tag.create({
                data: {
                  name: tagName,
                  isAuto: true,
                  category: 'geral',
                  userId: video.userId
                }
              });
              createdTags.push(newTag);
              console.log(`✅ Tag criada: ${tagName}`);
            } else {
              createdTags.push(existingTag);
              console.log(`ℹ️ Tag já existe: ${tagName}`);
            }
          } catch (tagError) {
            console.warn(`⚠️ Erro ao criar tag ${tagName}:`, tagError);
          }
        }

        // Conectar tags ao vídeo
        if (createdTags.length > 0) {
          await prisma.video.update({
            where: { id: videoId },
            data: {
              tags: {
                connect: createdTags.map(tag => ({ id: tag.id }))
              }
            }
          });
          console.log(`🔗 ${createdTags.length} tags conectadas ao vídeo ${videoId}`);
        }
      }

      return { tagsCreated: validNewTags.length };
    } catch (error) {
      console.warn('Erro ao aplicar tags básicas:', error);
      return { tagsCreated: 0 };
    }
  }

  private extractBasicKeywords(title: string, description: string): string[] {
    const text = (title + ' ' + description).toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 3);

    const stopWords = ['para', 'com', 'sem', 'por', 'que', 'como', 'mais', 'mas', 'sobre', 'este', 'esta', 'isso', 'aquilo'];

    return words
      .filter(word => !stopWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 5);
  }

  private async applyAITagsToAll(userId: string) {
    console.log('⚠️ Aplicando tags básicas (IA desabilitada devido a erro 402)');

    const videos = await prisma.video.findMany({
      where: { userId },
      select: { id: true, title: true, description: true }
    });

    let totalTagsCreated = 0;

    for (const video of videos) {
      // Usar apenas extração básica de palavras-chave
      const keywords = this.extractBasicKeywords(video.title, video.description || '');
      const validNewTags = TagValidator.sanitizeTagNames(
        keywords.filter(tag => tag.length > 2)
      ).slice(0, 3);

      if (validNewTags.length > 0) {
        console.log(`🏷️ Aplicando ${validNewTags.length} tags válidas ao vídeo ${video.id}:`, validNewTags);

        try {
          // Criar tags individualmente para evitar erro do Turbopack
          const createdTags = [];
          for (const tagName of validNewTags) {
            try {
              const existingTag = await prisma.tag.findFirst({
                where: {
                  name: tagName,
                  userId
                }
              });

              if (!existingTag) {
                const newTag = await prisma.tag.create({
                  data: {
                    name: tagName,
                    isAuto: true,
                    category: 'geral',
                    userId
                  }
                });
                createdTags.push(newTag);
                console.log(`✅ Tag criada: ${tagName}`);
              } else {
                createdTags.push(existingTag);
                console.log(`ℹ️ Tag já existe: ${tagName}`);
              }
            } catch (tagError) {
              console.warn(`⚠️ Erro ao criar tag ${tagName}:`, tagError);
            }
          }

          // Conectar tags ao vídeo
          if (createdTags.length > 0) {
            await prisma.video.update({
              where: { id: video.id },
              data: {
                tags: {
                  connect: createdTags.map(tag => ({ id: tag.id }))
                }
              }
            });
            console.log(`🔗 ${createdTags.length} tags conectadas ao vídeo ${video.id}`);
            totalTagsCreated += validNewTags.length;
          }
        } catch (error) {
          console.warn(`Erro ao aplicar tags no vídeo ${video.id}:`, error);
        }
      }
    }

    return { tagsCreated: totalTagsCreated };
  }

  private async getYouTubeClient(userId: string) {
    // Obter tokens do usuário do banco
    const youtubeAccount = await prisma.youTubeAccount.findUnique({
      where: { userId }
    });

    if (!youtubeAccount?.accessToken) {
      throw new Error('Conta YouTube não conectada');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: youtubeAccount.accessToken,
      refresh_token: youtubeAccount.refreshToken
    });

    return google.youtube({ version: 'v3', auth: oauth2Client });
  }
}
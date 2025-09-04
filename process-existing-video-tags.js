// Script para processar tags de vídeos existentes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function processExistingVideoTags() {
  try {
    console.log('🔄 Processando tags de vídeos existentes...\n');

    // Busca vídeos que têm videoTags mas não têm associações VideoTag
    const videosWithTags = await prisma.video.findMany({
      where: {
        videoTags: {
          not: null
        }
      },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        videoTags: true,
        userId: true,
        _count: {
          select: {
            tags: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${videosWithTags.length} vídeos com tags do YouTube`);

    let processedCount = 0;
    let errorCount = 0;

    for (const video of videosWithTags) {
      try {
        // Pula se já tem associações
        if (video._count.tags > 0) {
          console.log(`⏭️ Vídeo ${video.youtubeId} já tem associações, pulando...`);
          continue;
        }

        // Parse das tags do YouTube
        const youtubeTags = JSON.parse(video.videoTags);

        if (!youtubeTags || youtubeTags.length === 0) {
          console.log(`⚠️ Vídeo ${video.youtubeId} não tem tags válidas`);
          continue;
        }

        console.log(`🔄 Processando vídeo: ${video.title} (${youtubeTags.length} tags)`);

        // Processa cada tag
        const tagAssociations = [];

        for (const tagName of youtubeTags) {
          try {
            // Busca ou cria a tag
            let tag = await prisma.tag.findUnique({
              where: {
                userId_name: {
                  userId: video.userId,
                  name: tagName
                }
              }
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  userId: video.userId,
                  isAuto: true,
                  category: 'youtube'
                }
              });
              console.log(`  ✨ Criada tag: ${tagName}`);
            }

            tagAssociations.push({
              videoId: video.id,
              tagId: tag.id
            });

          } catch (tagError) {
            console.warn(`  ⚠️ Erro ao processar tag "${tagName}":`, tagError.message);
          }
        }

        // Cria associações uma por uma para evitar duplicatas
        if (tagAssociations.length > 0) {
          let createdCount = 0;
          for (const association of tagAssociations) {
            try {
              await prisma.videoTag.upsert({
                where: {
                  videoId_tagId: {
                    videoId: association.videoId,
                    tagId: association.tagId
                  }
                },
                update: {},
                create: association
              });
              createdCount++;
            } catch (error) {
              // Ignora erros de duplicata
              console.warn(`  ⚠️ Associação já existe: ${association.videoId} -> ${association.tagId}`);
            }
          }
          console.log(`  ✅ Criadas ${createdCount} associações para vídeo ${video.youtubeId}`);
          processedCount++;
        }

      } catch (error) {
        console.error(`❌ Erro ao processar vídeo ${video.youtubeId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Processamento concluído:`);
    console.log(`  - Vídeos processados: ${processedCount}`);
    console.log(`  - Erros: ${errorCount}`);

    // Verifica o resultado final
    const finalVideoTags = await prisma.videoTag.count();
    const finalTags = await prisma.tag.count();

    console.log(`\n📊 Estado final:`);
    console.log(`  - Total de associações VideoTag: ${finalVideoTags}`);
    console.log(`  - Total de tags: ${finalTags}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processExistingVideoTags();
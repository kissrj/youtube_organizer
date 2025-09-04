// Script para testar aplicação automática de tags
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoTags() {
  try {
    console.log('🔍 Testando aplicação automática de tags...\n');

    // Buscar um vídeo existente
    const video = await prisma.video.findFirst({
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!video) {
      console.log('❌ Nenhum vídeo encontrado para testar');
      return;
    }

    console.log(`🎬 Vídeo encontrado: "${video.title}"`);
    console.log(`📊 Tags atuais: ${video.tags.length}`);

    // Simular análise simples
    console.log('\n🚀 Fazendo análise simples...');

    // Extrair palavras-chave do título
    const titleWords = video.title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3);

    console.log('📝 Palavras-chave extraídas:', titleWords);

    // Buscar tags existentes do usuário
    const existingTags = await prisma.tag.findMany({
      where: {
        name: { in: titleWords },
        userId: video.userId
      }
    });

    console.log(`🔍 Tags existentes encontradas: ${existingTags.length}`);

    // Criar tags que não existem
    const newTagNames = titleWords.filter(tagName =>
      !existingTags.some(tag => tag.name === tagName)
    );

    console.log(`🆕 Novas tags a criar: ${newTagNames.length}`);

    let createdTags = [];
    if (newTagNames.length > 0) {
      createdTags = await prisma.tag.createManyAndReturn({
        data: newTagNames.map(name => ({
          name,
          isAuto: true,
          category: 'automático',
          userId: video.userId
        }))
      });
      console.log(`✅ Tags criadas: ${createdTags.length}`);
    }

    // Combinar tags existentes e criadas
    const allTags = [...existingTags, ...createdTags];
    console.log(`📊 Total de tags para associar: ${allTags.length}`);

    // Associar tags ao vídeo criando registros VideoTag
    if (allTags.length > 0) {
      // Verificar associações existentes para evitar duplicatas
      const existingAssociations = await prisma.videoTag.findMany({
        where: {
          videoId: video.id,
          tagId: { in: allTags.map(tag => tag.id) }
        }
      });

      const existingTagIds = existingAssociations.map(assoc => assoc.tagId);
      const newAssociations = allTags
        .filter(tag => !existingTagIds.includes(tag.id))
        .map(tag => ({
          videoId: video.id,
          tagId: tag.id
        }));

      if (newAssociations.length > 0) {
        await prisma.videoTag.createMany({
          data: newAssociations
        });
        console.log(`✅ ${newAssociations.length} novas associações criadas!`);
      } else {
        console.log('ℹ️ Todas as tags já estão associadas ao vídeo');
      }
    }

    // Verificar resultado final
    const updatedVideo = await prisma.video.findUnique({
      where: { id: video.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log(`\n📊 Tags finais no vídeo: ${updatedVideo.tags.length}`);
    if (updatedVideo.tags.length > 0) {
      console.log('Tags aplicadas:');
      updatedVideo.tags.forEach(vt => {
        console.log(`  - ${vt.tag.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoTags();
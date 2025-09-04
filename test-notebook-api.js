const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotebookAPI() {
  try {
    console.log('🔍 Testando API de notebooks...\n');

    // 1. Verificar se há usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`👥 Usuários encontrados: ${users.length}`);
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      return;
    }

    const user = users[0];
    console.log(`👤 Usando usuário: ${user.name} (ID: ${user.id})\n`);

    // 2. Verificar notebooks do usuário
    const notebooks = await prisma.notebook.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        isDefault: true,
        createdAt: true
      }
    });

    console.log(`📓 Notebooks encontrados: ${notebooks.length}`);
    notebooks.forEach((nb, index) => {
      console.log(`${index + 1}. ${nb.name} (ID: ${nb.id}, isDefault: ${nb.isDefault})`);
    });

    if (notebooks.length === 0) {
      console.log('❌ Nenhum notebook encontrado!');
      return;
    }

    // 3. Verificar vídeos do usuário
    const videos = await prisma.video.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        youtubeId: true
      },
      take: 3
    });

    console.log(`\n🎬 Vídeos encontrados: ${videos.length}`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} (ID: ${video.id})`);
    });

    if (videos.length === 0) {
      console.log('❌ Nenhum vídeo encontrado!');
      return;
    }

    // 4. Testar adicionar vídeo a notebook
    const testNotebook = notebooks[0];
    const testVideo = videos[0];

    console.log(`\n🧪 Testando adicionar vídeo "${testVideo.title}" ao notebook "${testNotebook.name}"...`);

    // Verificar se já existe relação
    const existingRelation = await prisma.notebookVideo.findFirst({
      where: {
        notebookId: testNotebook.id,
        videoId: testVideo.id
      }
    });

    if (existingRelation) {
      console.log('ℹ️ Vídeo já está no notebook');
    } else {
      // Criar relação
      const relation = await prisma.notebookVideo.create({
        data: {
          notebookId: testNotebook.id,
          videoId: testVideo.id,
          addedAt: new Date()
        }
      });

      console.log('✅ Vídeo adicionado ao notebook com sucesso!');
      console.log(`📝 Relação criada: ${relation.id}`);
    }

    // 5. Verificar relações existentes
    const relations = await prisma.notebookVideo.findMany({
      where: {
        notebookId: testNotebook.id
      },
      include: {
        video: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`\n📊 Vídeos no notebook "${testNotebook.name}": ${relations.length}`);
    relations.forEach((rel, index) => {
      console.log(`${index + 1}. ${rel.video.title}`);
    });

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotebookAPI();
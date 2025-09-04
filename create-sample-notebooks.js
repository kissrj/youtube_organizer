const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleNotebooks() {
  try {
    console.log('📝 Criando notebooks de exemplo...\n');

    // Primeiro, obter o ID do usuário existente
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ Nenhum usuário encontrado. Faça login primeiro.');
      return;
    }

    console.log(`👤 Usuário encontrado: ${user.name} (ID: ${user.id})`);

    // Criar notebooks de exemplo
    const notebooksData = [
      {
        name: 'Favoritos',
        description: 'Meus vídeos favoritos',
        color: '#ef4444',
        userId: user.id
      },
      {
        name: 'Para Estudar',
        description: 'Conteúdo para estudo futuro',
        color: '#3b82f6',
        userId: user.id
      },
      {
        name: 'Inspiração',
        description: 'Vídeos inspiradores e motivacionais',
        color: '#10b981',
        userId: user.id
      },
      {
        name: 'Tutoriais',
        description: 'Vídeos tutoriais e guias',
        color: '#f59e0b',
        userId: user.id
      }
    ];

    const createdNotebooks = [];

    for (const notebookData of notebooksData) {
      const notebook = await prisma.notebook.create({
        data: notebookData,
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          createdAt: true
        }
      });

      createdNotebooks.push(notebook);
      console.log(`✅ Criado notebook: ${notebook.name} (ID: ${notebook.id})`);
    }

    console.log(`\n🎉 ${createdNotebooks.length} notebooks criados com sucesso!`);
    console.log('\n📋 Notebooks criados:');

    createdNotebooks.forEach((notebook, index) => {
      console.log(`${index + 1}. 📓 ${notebook.name}`);
      console.log(`   Descrição: ${notebook.description}`);
      console.log(`   Cor: ${notebook.color}`);
      console.log(`   Criado em: ${notebook.createdAt.toLocaleString('pt-BR')}`);
      console.log('');
    });

    console.log('💡 Agora você pode testar o sistema de drag-and-drop!');
    console.log('   - Vá para /videos ou /playlists/[id]');
    console.log('   - Arraste um vídeo/playlist para o ícone de notebook (azul)');
    console.log('   - O modal deve abrir mostrando estes notebooks');

  } catch (error) {
    console.error('❌ Erro ao criar notebooks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotebooks();
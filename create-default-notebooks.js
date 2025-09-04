const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultNotebooks() {
  try {
    console.log('🎨 Criando notebooks padrão elegantes...\n');

    // Primeiro, obter o ID do usuário existente
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ Nenhum usuário encontrado. Faça login primeiro.');
      return;
    }

    console.log(`👤 Usuário encontrado: ${user.name} (ID: ${user.id})`);

    // Verificar se já existem notebooks padrão
    const existingDefaultNotebooks = await prisma.notebook.findMany({
      where: {
        userId: user.id,
        isDefault: true
      }
    });

    if (existingDefaultNotebooks.length > 0) {
      console.log(`ℹ️ Já existem ${existingDefaultNotebooks.length} notebooks padrão.`);
      console.log('Para recriar, execute primeiro: node clear-default-notebooks.js');
      return;
    }

    // Notebooks padrão elegantes com descrições sofisticadas
    const defaultNotebooksData = [
      {
        name: 'Personal Growth',
        description: 'Notes, reflections, and resources to help you evolve mentally and emotionally.',
        color: '#6366f1',
        category: 'Personal',
        isDefault: true
      },
      {
        name: 'Favorites',
        description: 'Your go-to content: videos, articles, quotes, or anything you love revisiting.',
        color: '#ec4899',
        category: 'Personal',
        isDefault: true
      },
      {
        name: 'Watch Later',
        description: 'A curated list of things you want to watch when you have time to dive in.',
        color: '#f59e0b',
        category: 'Media',
        isDefault: true
      },
      {
        name: 'Creative Inspiration',
        description: 'Sparks of creativity — ideas, visuals, and concepts that fuel your imagination.',
        color: '#8b5cf6',
        category: 'Creative',
        isDefault: true
      },
      {
        name: 'Learning Hub',
        description: 'A central place for tutorials, courses, and educational content.',
        color: '#06b6d4',
        category: 'Education',
        isDefault: true
      },
      {
        name: 'Mindset & Motivation',
        description: 'Uplifting thoughts, affirmations, and strategies to stay focused and inspired.',
        color: '#f97316',
        category: 'Personal',
        isDefault: true
      },
      {
        name: 'Health & Wellness',
        description: 'Tips, routines, and info to support your physical and mental well-being.',
        color: '#10b981',
        category: 'Health',
        isDefault: true
      },
      {
        name: 'Documentaries & Real Stories',
        description: 'Thought-provoking content that explores real-life events and perspectives.',
        color: '#64748b',
        category: 'Media',
        isDefault: true
      },
      {
        name: 'Language Learning',
        description: 'Vocabulary, grammar tips, and practice materials for mastering new languages.',
        color: '#3b82f6',
        category: 'Education',
        isDefault: true
      },
      {
        name: 'Science & Curiosity',
        description: 'Fascinating facts, discoveries, and theories that expand your understanding.',
        color: '#14b8a6',
        category: 'Science',
        isDefault: true
      },
      {
        name: 'Business & Entrepreneurship',
        description: 'Insights, strategies, and case studies for building and growing ventures.',
        color: '#059669',
        category: 'Business',
        isDefault: true
      },
      {
        name: 'Art & Culture',
        description: 'A celebration of creativity, history, and global artistic expression.',
        color: '#dc2626',
        category: 'Creative',
        isDefault: true
      },
      {
        name: 'Spirituality & Philosophy',
        description: 'Deep thoughts, beliefs, and questions about existence and meaning.',
        color: '#7c3aed',
        category: 'Personal',
        isDefault: true
      },
      {
        name: 'Practical Skills',
        description: 'How-to guides and resources for everyday tasks and lifelong skills.',
        color: '#ea580c',
        category: 'Skills',
        isDefault: true
      },
      {
        name: 'World & Current Events',
        description: 'News, analysis, and reflections on what\'s happening around the globe.',
        color: '#0891b2',
        category: 'News',
        isDefault: true
      },
      {
        name: 'History & Society',
        description: 'Stories and lessons from the past that shape our present and future.',
        color: '#92400e',
        category: 'History',
        isDefault: true
      },
      {
        name: 'Design & Aesthetics',
        description: 'Visual inspiration, trends, and design principles that catch your eye.',
        color: '#be185d',
        category: 'Design',
        isDefault: true
      },
      {
        name: 'Humor & Entertainment',
        description: 'Light-hearted content to make you laugh and unwind.',
        color: '#f59e0b',
        category: 'Entertainment',
        isDefault: true
      },
      {
        name: 'My Ideas',
        description: 'Your personal brainstorm space — raw thoughts, sketches, and wild concepts.',
        color: '#8b5cf6',
        category: 'Creative',
        isDefault: true
      },
      {
        name: 'Knowledge Journal',
        description: 'A daily log of what you\'ve learned, discovered, or want to remember.',
        color: '#0ea5e9',
        category: 'Personal',
        isDefault: true
      }
    ];

    const createdNotebooks = [];
    let successCount = 0;
    let errorCount = 0;

    console.log('📝 Iniciando criação dos notebooks padrão...\n');

    for (let i = 0; i < defaultNotebooksData.length; i++) {
      const notebookData = defaultNotebooksData[i];

      try {
        const notebook = await prisma.notebook.create({
          data: {
            ...notebookData,
            userId: user.id
          },
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            category: true,
            isDefault: true,
            createdAt: true
          }
        });

        createdNotebooks.push(notebook);
        successCount++;

        console.log(`✅ ${(i + 1).toString().padStart(2, ' ')}. ${notebook.name}`);
        console.log(`    📝 ${notebook.description}`);
        console.log(`    🎨 ${notebook.color} | ${notebook.category}`);
        console.log('');

      } catch (error) {
        errorCount++;
        console.log(`❌ ${(i + 1).toString().padStart(2, ' ')}. ${notebookData.name} - Erro: ${error.message}`);
      }
    }

    console.log('🎉 Criação concluída!');
    console.log(`✅ ${successCount} notebooks criados com sucesso`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} notebooks com erro`);
    }
    console.log(`📊 Total: ${createdNotebooks.length} notebooks padrão`);

    console.log('\n💡 Próximos passos:');
    console.log('1. Execute: node check-notebooks.js (para verificar)');
    console.log('2. Acesse: http://localhost:3000/notebooks (para visualizar)');
    console.log('3. Teste o drag-and-drop de vídeos para os notebooks');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultNotebooks();
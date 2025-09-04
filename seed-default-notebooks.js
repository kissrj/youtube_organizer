// Script para popular o banco de dados com notebooks predefinidos
// Execute com: node seed-default-notebooks.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultNotebooks = [
  {
    name: 'Personal Growth',
    description: 'Notes, reflections, and resources to help you evolve mentally and emotionally.',
    color: '#10b981', // emerald-500
    category: 'personal'
  },
  {
    name: 'Favorites',
    description: 'Your go-to content: videos, articles, quotes, or anything you love revisiting.',
    color: '#f59e0b', // amber-500
    category: 'favorites'
  },
  {
    name: 'Watch Later',
    description: 'A curated list of things you want to watch when you have time to dive in.',
    color: '#3b82f6', // blue-500
    category: 'watch_later'
  },
  {
    name: 'Creative Inspiration',
    description: 'Sparks of creativity — ideas, visuals, and concepts that fuel your imagination.',
    color: '#8b5cf6', // violet-500
    category: 'creative'
  },
  {
    name: 'Learning Hub',
    description: 'A central place for tutorials, courses, and educational content.',
    color: '#06b6d4', // cyan-500
    category: 'education'
  },
  {
    name: 'Mindset & Motivation',
    description: 'Uplifting thoughts, affirmations, and strategies to stay focused and inspired.',
    color: '#f97316', // orange-500
    category: 'motivation'
  },
  {
    name: 'Health & Wellness',
    description: 'Tips, routines, and info to support your physical and mental well-being.',
    color: '#22c55e', // green-500
    category: 'health'
  },
  {
    name: 'Documentaries & Real Stories',
    description: 'Thought-provoking content that explores real-life events and perspectives.',
    color: '#64748b', // slate-500
    category: 'documentary'
  },
  {
    name: 'Language Learning',
    description: 'Vocabulary, grammar tips, and practice materials for mastering new languages.',
    color: '#ec4899', // pink-500
    category: 'language'
  },
  {
    name: 'Science & Curiosity',
    description: 'Fascinating facts, discoveries, and theories that expand your understanding.',
    color: '#6366f1', // indigo-500
    category: 'science'
  },
  {
    name: 'Business & Entrepreneurship',
    description: 'Insights, strategies, and case studies for building and growing ventures.',
    color: '#0ea5e9', // sky-500
    category: 'business'
  },
  {
    name: 'Art & Culture',
    description: 'A celebration of creativity, history, and global artistic expression.',
    color: '#a855f7', // purple-500
    category: 'art'
  },
  {
    name: 'Spirituality & Philosophy',
    description: 'Deep thoughts, beliefs, and questions about existence and meaning.',
    color: '#7c3aed', // violet-600
    category: 'spirituality'
  },
  {
    name: 'Practical Skills',
    description: 'How-to guides and resources for everyday tasks and lifelong skills.',
    color: '#059669', // emerald-600
    category: 'skills'
  },
  {
    name: 'World & Current Events',
    description: 'News, analysis, and reflections on what\'s happening around the globe.',
    color: '#dc2626', // red-600
    category: 'news'
  },
  {
    name: 'History & Society',
    description: 'Stories and lessons from the past that shape our present and future.',
    color: '#7c2d12', // orange-900
    category: 'history'
  },
  {
    name: 'Design & Aesthetics',
    description: 'Visual inspiration, trends, and design principles that catch your eye.',
    color: '#be185d', // pink-700
    category: 'design'
  },
  {
    name: 'Humor & Entertainment',
    description: 'Light-hearted content to make you laugh and unwind.',
    color: '#ea580c', // orange-600
    category: 'entertainment'
  },
  {
    name: 'My Ideas',
    description: 'Your personal brainstorm space — raw thoughts, sketches, and wild concepts.',
    color: '#7c3aed', // violet-600
    category: 'ideas'
  },
  {
    name: 'Knowledge Journal',
    description: 'A daily log of what you\'ve learned, discovered, or want to remember.',
    color: '#0f766e', // teal-700
    category: 'journal'
  }
];

async function seedDefaultNotebooks() {
  console.log('🌱 INICIANDO SEED DOS NOTEBOOKS PREDEFINIDOS');
  console.log('=' .repeat(60));

  try {
    // Primeiro, verificar se existe algum usuário no sistema
    const existingUsers = await prisma.user.findMany({
      take: 1
    });

    if (existingUsers.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no sistema. Criando usuário padrão...');

      // Criar um usuário padrão para os notebooks
      const defaultUser = await prisma.user.create({
        data: {
          id: 'default-user-id',
          email: 'default@system.local',
          name: 'Sistema',
          emailVerified: new Date()
        }
      });

      console.log('✅ Usuário padrão criado:', defaultUser.id);
    }

    // Usar o primeiro usuário encontrado ou o padrão
    const userId = existingUsers.length > 0 ? existingUsers[0].id : 'default-user-id';

    console.log(`👤 Usando usuário: ${userId}`);

    // Verificar se já existem notebooks predefinidos para este usuário
    const existingNotebooks = await prisma.notebook.findMany({
      where: {
        userId: userId,
        name: {
          in: defaultNotebooks.map(nb => nb.name)
        }
      }
    });

    console.log(`📊 Encontrados ${existingNotebooks.length} notebooks já existentes para este usuário`);

    const existingNames = new Set(existingNotebooks.map(nb => nb.name));
    const notebooksToCreate = defaultNotebooks.filter(nb => !existingNames.has(nb.name));

    console.log(`📝 ${notebooksToCreate.length} notebooks serão criados`);

    // Criar notebooks que não existem
    for (const notebookData of notebooksToCreate) {
      try {
        const notebook = await prisma.notebook.create({
          data: {
            name: notebookData.name,
            description: notebookData.description,
            color: notebookData.color,
            userId: userId,
            isDefault: true, // Marcar como notebook padrão
            category: notebookData.category
          }
        });

        console.log(`✅ Criado: ${notebook.name} (ID: ${notebook.id})`);
      } catch (error) {
        console.error(`❌ Erro ao criar ${notebookData.name}:`, error.message);
      }
    }

    // Verificar notebooks criados
    const allNotebooks = await prisma.notebook.findMany({
      where: { isDefault: true },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\n📋 NOTEBOOKS PREDEFINIDOS NO SISTEMA:`);
    allNotebooks.forEach((nb, index) => {
      console.log(`${index + 1}. ${nb.name}`);
      console.log(`   📝 ${nb.description}`);
      console.log(`   🎨 ${nb.color}`);
      console.log(`   🏷️  ${nb.category}`);
      console.log('');
    });

    console.log(`✨ SEED CONCLUÍDO COM SUCESSO!`);
    console.log(`📊 Total de notebooks predefinidos: ${allNotebooks.length}`);

  } catch (error) {
    console.error('💥 ERRO DURANTE O SEED:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  seedDefaultNotebooks()
    .then(() => {
      console.log('🎉 Processo de seed finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Processo de seed falhou:', error);
      process.exit(1);
    });
}

module.exports = { seedDefaultNotebooks, defaultNotebooks };
const { PrismaClient } = require('@prisma/client');

// Dados dos notebooks padrão (copiados do arquivo original)
const defaultNotebooks = [
  {
    id: 'personal-growth',
    name: 'Personal Growth',
    description: 'Notes, reflections, and resources to help you evolve mentally and emotionally.',
    icon: 'User',
    color: 'from-purple-500 to-indigo-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'favorites',
    name: 'Favorites',
    description: 'Your go-to content: videos, articles, quotes, or anything you love revisiting.',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-600',
    category: 'Personal',
    isDefault: true
  },
  {
    id: 'watch-later',
    name: 'Watch Later',
    description: 'A curated list of things you want to watch when you have time to dive in.',
    icon: 'Clock',
    color: 'from-blue-500 to-cyan-600',
    category: 'Media',
    isDefault: true
  },
  {
    id: 'creative-inspiration',
    name: 'Creative Inspiration',
    description: 'Sparks of creativity — ideas, visuals, and concepts that fuel your imagination.',
    icon: 'Sparkles',
    color: 'from-orange-500 to-red-600',
    category: 'Creative',
    isDefault: true
  },
  {
    id: 'learning-hub',
    name: 'Learning Hub',
    description: 'A central place for tutorials, courses, and educational content.',
    icon: 'GraduationCap',
    color: 'from-green-500 to-emerald-600',
    category: 'Education',
    isDefault: true
  }
  // Adicione os outros 16 notebooks aqui se quiser...
];

async function seedDefaultNotebooks() {
  const prisma = new PrismaClient();

  try {
    console.log('=== SEMEANDO NOTEBOOKS PADRÃO NO BANCO ===\n');

    // Verificar usuário existente
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie um usuário primeiro.');
      return;
    }

    const user = users[0]; // Usar o primeiro usuário
    console.log(`👤 Usando usuário: ${user.name} (${user.email})`);

    // Verificar notebooks existentes
    const existingNotebooks = await prisma.notebook.findMany({
      where: { userId: user.id },
      select: { name: true }
    });

    const existingNames = existingNotebooks.map(nb => nb.name);
    console.log(`📓 Notebooks existentes: ${existingNotebooks.length}`);
    console.log('Nomes:', existingNames);

    // Filtrar notebooks padrão que ainda não existem
    const notebooksToCreate = defaultNotebooks.filter(defaultNb =>
      !existingNames.includes(defaultNb.name)
    );

    console.log(`\n📝 Notebooks a serem criados: ${notebooksToCreate.length}`);
    notebooksToCreate.forEach(nb => console.log(`- ${nb.name}`));

    if (notebooksToCreate.length === 0) {
      console.log('✅ Todos os notebooks padrão já existem!');
      return;
    }

    // Criar notebooks padrão
    console.log('\n🚀 Criando notebooks padrão...');
    const createdNotebooks = [];

    for (const defaultNb of notebooksToCreate) {
      try {
        const notebook = await prisma.notebook.create({
          data: {
            name: defaultNb.name,
            description: defaultNb.description,
            color: defaultNb.color,
            userId: user.id,
          }
        });

        createdNotebooks.push(notebook);
        console.log(`✅ Criado: ${notebook.name} (ID: ${notebook.id})`);
      } catch (error) {
        console.log(`❌ Erro ao criar ${defaultNb.name}:`, error.message);
      }
    }

    // Verificar resultado final
    const finalCount = await prisma.notebook.count({
      where: { userId: user.id }
    });

    console.log(`\n🎉 RESULTADO FINAL:`);
    console.log(`- Criados: ${createdNotebooks.length}`);
    console.log(`- Total de notebooks: ${finalCount}`);
    console.log(`- Notebooks padrão disponíveis: ${defaultNotebooks.length}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedDefaultNotebooks();
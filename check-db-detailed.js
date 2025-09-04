const { PrismaClient } = require('@prisma/client');

async function checkDatabaseDetailed() {
  const prisma = new PrismaClient();

  try {
    console.log('=== VERIFICAÇÃO DETALHADA DO BANCO DE DADOS ===\n');

    // Tabelas principais (antigas)
    console.log('📊 TABELAS PRINCIPAIS:');
    const videoCount = await prisma.video.count();
    console.log(`Vídeos: ${videoCount}`);

    const playlistCount = await prisma.playlist.count();
    console.log(`Playlists: ${playlistCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`Categorias: ${categoryCount}`);

    const tagCount = await prisma.tag.count();
    console.log(`Tags: ${tagCount}`);

    const userCount = await prisma.user.count();
    console.log(`Usuários: ${userCount}`);

    // Tabelas novas (adicionadas recentemente)
    console.log('\n🆕 TABELAS RECENTES:');
    try {
      const notebookCount = await prisma.notebook.count();
      console.log(`Notebooks: ${notebookCount}`);
    } catch (e) {
      console.log('Notebooks: Tabela não existe ou erro');
    }

    try {
      const collectionCount = await prisma.collection.count();
      console.log(`Collections: ${collectionCount}`);
    } catch (e) {
      console.log('Collections: Tabela não existe ou erro');
    }

    try {
      const autoTagRuleCount = await prisma.auto_tag_rules.count();
      console.log(`Regras de auto-tag: ${autoTagRuleCount}`);
    } catch (e) {
      console.log('Regras de auto-tag: Tabela não existe ou erro');
    }

    // Verificar se há dados em tabelas de relacionamento
    console.log('\n🔗 TABELAS DE RELACIONAMENTO:');
    try {
      const videoTagCount = await prisma.videoTag.count();
      console.log(`Video-Tag relacionamentos: ${videoTagCount}`);
    } catch (e) {
      console.log('Video-Tag relacionamentos: Tabela não existe ou erro');
    }

    try {
      const videoCategoryCount = await prisma.videoCategory.count();
      console.log(`Video-Category relacionamentos: ${videoCategoryCount}`);
    } catch (e) {
      console.log('Video-Category relacionamentos: Tabela não existe ou erro');
    }

    // Verificar dados do usuário
    console.log('\n👤 DADOS DO USUÁRIO:');
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Email: ${user.email || 'N/A'}`);
        console.log(`  Nome: ${user.name || 'N/A'}`);
        console.log(`  Criado em: ${user.createdAt}`);
      });
    }

    // Verificar estrutura das tabelas
    console.log('\n📋 ESTRUTURA DAS TABELAS:');
    const tables = [
      'Video', 'Playlist', 'Category', 'Tag', 'User',
      'Notebook', 'Collection', 'AutoTagRule'
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`${table}: ${count} registros`);
      } catch (e) {
        console.log(`${table}: Tabela não encontrada`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseDetailed();
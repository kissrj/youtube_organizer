const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotebooks() {
  try {
    console.log('🔍 Verificando notebooks na base de dados...\n');

    const notebooks = await prisma.notebook.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            playlists: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total de notebooks encontrados: ${notebooks.length}\n`);

    if (notebooks.length === 0) {
      console.log('❌ Nenhum notebook encontrado na base de dados.');
      console.log('💡 Você pode criar notebooks através da interface ou API.');
    } else {
      console.log('✅ Notebooks encontrados:');
      console.log('─'.repeat(80));

      notebooks.forEach((notebook, index) => {
        console.log(`${index + 1}. 📓 ${notebook.name}`);
        console.log(`   ID: ${notebook.id}`);
        console.log(`   Descrição: ${notebook.description || 'Sem descrição'}`);
        console.log(`   Cor: ${notebook.color || 'Padrão'}`);
        console.log(`   Vídeos: ${notebook._count.videos}`);
        console.log(`   Playlists: ${notebook._count.playlists}`);
        console.log(`   Criado em: ${notebook.createdAt.toLocaleString('pt-BR')}`);
        console.log('─'.repeat(80));
      });
    }

    // Também verificar se há usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log(`\n👥 Total de usuários: ${users.length}`);
    if (users.length > 0) {
      console.log('Usuários encontrados:');
      users.forEach(user => {
        console.log(`  - ${user.name || user.email} (ID: ${user.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao consultar a base de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotebooks();
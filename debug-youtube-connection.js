const { PrismaClient } = require('@prisma/client');

async function debugYouTubeConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('=== DEBUG YOUTUBE CONNECTION ===\n');

    // 1. Verificar usuários
    console.log('👤 USUÁRIOS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    console.log(`Encontrados: ${users.length} usuários`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Nome: ${user.name}`);
    });

    // 2. Verificar estrutura da tabela YouTubeAccount
    console.log('\n📊 ESTRUTURA YOUTUBEACCOUNT:');
    try {
      const result = await prisma.$queryRaw`PRAGMA table_info(YouTubeAccount)`;
      console.log('Colunas da tabela YouTubeAccount:');
      result.forEach(col => {
        console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura da tabela:', error.message);
    }

    // 3. Verificar registros na tabela YouTubeAccount
    console.log('\n🔗 REGISTROS YOUTUBEACCOUNT:');
    try {
      const youtubeAccounts = await prisma.youTubeAccount.findMany({
        select: {
          id: true,
          userId: true,
          youtubeUserId: true,
          youtubeUsername: true,
          connectedAt: true
        }
      });
      console.log(`Encontrados: ${youtubeAccounts.length} registros`);
      youtubeAccounts.forEach(account => {
        console.log(`- UserID: ${account.userId}, YouTube ID: ${account.youtubeUserId}, Username: ${account.youtubeUsername}`);
      });
    } catch (error) {
      console.log('❌ Erro ao buscar registros:', error.message);
    }

    // 4. Testar foreign key constraint
    console.log('\n🔍 TESTE DE FOREIGN KEY:');
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log(`Testando com userId: ${testUserId}`);

      try {
        // Tentar fazer upsert com dados de teste
        const testData = {
          userId: testUserId,
          accessToken: 'test_token',
          refreshToken: 'test_refresh',
          tokenExpiry: new Date(Date.now() + 3600000), // 1 hora
          scope: 'test_scope',
          youtubeUserId: 'test_youtube_id',
          youtubeUsername: 'test_username',
          connectedAt: new Date(),
          updatedAt: new Date()
        };

        console.log('Tentando upsert...');
        const result = await prisma.youTubeAccount.upsert({
          where: { userId: testUserId },
          update: {
            accessToken: testData.accessToken,
            refreshToken: testData.refreshToken,
            tokenExpiry: testData.tokenExpiry,
            scope: testData.scope,
            youtubeUserId: testData.youtubeUserId,
            youtubeUsername: testData.youtubeUsername,
            updatedAt: testData.updatedAt
          },
          create: testData
        });

        console.log('✅ Upsert bem-sucedido:', result.id);

        // Limpar dados de teste
        await prisma.youTubeAccount.delete({
          where: { userId: testUserId }
        });
        console.log('🧹 Dados de teste removidos');

      } catch (error) {
        console.log('❌ Erro no upsert:', error.message);
        console.log('Código do erro:', error.code);
        if (error.meta) {
          console.log('Meta:', error.meta);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugYouTubeConnection();
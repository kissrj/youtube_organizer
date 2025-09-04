const { PrismaClient } = require('@prisma/client');

async function debugYouTubeAuth() {
  const prisma = new PrismaClient();

  try {
    console.log('=== DEBUG YOUTUBE AUTH ISSUE ===\n');

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

    // 2. Verificar contas YouTube
    console.log('\n📺 CONTAS YOUTUBE:');
    try {
      const youtubeAccounts = await prisma.youTubeAccount.findMany({
        select: {
          id: true,
          userId: true,
          youtubeUserId: true,
          youtubeUsername: true,
          connectedAt: true,
          accessToken: true,
          refreshToken: true
        }
      });
      console.log(`Encontradas: ${youtubeAccounts.length} contas YouTube`);
      youtubeAccounts.forEach(account => {
        console.log(`- UserID: ${account.userId}`);
        console.log(`  YouTube ID: ${account.youtubeUserId}`);
        console.log(`  Username: ${account.youtubeUsername}`);
        console.log(`  Connected: ${account.connectedAt}`);
        console.log(`  Has Access Token: ${!!account.accessToken}`);
        console.log(`  Has Refresh Token: ${!!account.refreshToken}`);
      });
    } catch (error) {
      console.log('❌ Erro ao buscar contas YouTube:', error.message);
    }

    // 3. Verificar estrutura da tabela YouTubeAccount
    console.log('\n📊 ESTRUTURA YOUTUBEACCOUNT:');
    try {
      const result = await prisma.$queryRaw`PRAGMA table_info(YouTubeAccount)`;
      console.log('Colunas da tabela YouTubeAccount:');
      result.forEach(col => {
        console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error.message);
    }

    // 4. Verificar foreign keys
    console.log('\n🔗 FOREIGN KEYS:');
    try {
      const foreignKeys = await prisma.$queryRaw`PRAGMA foreign_key_list(YouTubeAccount)`;
      console.log('Foreign keys da tabela YouTubeAccount:');
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.from} -> ${fk.table}.${fk.to}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar foreign keys:', error.message);
    }

    // 5. Teste de integridade referencial
    console.log('\n🔍 TESTE DE INTEGRIDADE:');
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log(`Testando com userId: ${testUserId}`);

      // Verificar se o userId existe na tabela User
      const userExists = await prisma.user.findUnique({
        where: { id: testUserId }
      });
      console.log(`User existe: ${!!userExists}`);

      // Tentar criar uma conta YouTube de teste
      try {
        console.log('Tentando criar conta YouTube de teste...');
        const testAccount = await prisma.youTubeAccount.create({
          data: {
            userId: testUserId,
            accessToken: 'test_token_' + Date.now(),
            refreshToken: 'test_refresh_' + Date.now(),
            tokenExpiry: new Date(Date.now() + 3600000),
            scope: 'test_scope',
            youtubeUserId: 'test_youtube_id',
            youtubeUsername: 'test_username',
            connectedAt: new Date()
          }
        });
        console.log('✅ Conta de teste criada:', testAccount.id);

        // Limpar conta de teste
        await prisma.youTubeAccount.delete({
          where: { id: testAccount.id }
        });
        console.log('🧹 Conta de teste removida');

      } catch (error) {
        console.log('❌ Erro ao criar conta de teste:', error.message);
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

debugYouTubeAuth();
const { PrismaClient } = require('@prisma/client');

async function testOAuthFlow() {
  const prisma = new PrismaClient();

  try {
    console.log('=== TESTE DO FLUXO OAUTH COMPLETO ===\n');

    // 1. Simular o que acontece no callback
    console.log('1️⃣ SIMULAÇÃO DO CALLBACK OAUTH:');

    // UserId que vem do state (simulando o que vem do Google)
    const simulatedUserId = 'cmf3rnb580000up10j3vqb8vv'; // userId real do banco
    console.log(`UserId do state: ${simulatedUserId}`);

    // Verificar se o userId existe
    const user = await prisma.user.findUnique({
      where: { id: simulatedUserId }
    });
    console.log(`User existe no banco: ${!!user}`);
    if (user) {
      console.log(`User details: ${user.email} (${user.name})`);
    }

    // 2. Simular tokens do YouTube
    console.log('\n2️⃣ SIMULAÇÃO DOS TOKENS:');
    const simulatedTokens = {
      access_token: 'ya29.test_token_' + Date.now(),
      refresh_token: '1//test_refresh_token_' + Date.now(),
      expiry_date: Date.now() + 3600000, // 1 hora
      scope: 'https://www.googleapis.com/auth/youtube.readonly'
    };
    console.log('Tokens simulados criados');

    // 3. Simular userInfo do YouTube
    console.log('\n3️⃣ SIMULAÇÃO DO USERINFO:');
    const simulatedUserInfo = {
      id: 'UCcFPRGW4eitR3h7wbFdQ1Sg',
      title: 'Imre Kiss',
      username: '@imrekiss135'
    };
    console.log(`UserInfo simulado: ${simulatedUserInfo.title} (${simulatedUserInfo.id})`);

    // 4. Tentar salvar a conta YouTube
    console.log('\n4️⃣ TENTATIVA DE SALVAR CONTA YOUTUBE:');
    try {
      const data = {
        accessToken: simulatedTokens.access_token,
        refreshToken: simulatedTokens.refresh_token,
        tokenExpiry: simulatedTokens.expiry_date ? new Date(simulatedTokens.expiry_date) : null,
        scope: simulatedTokens.scope,
        youtubeUserId: simulatedUserInfo.id,
        youtubeUsername: simulatedUserInfo.username,
        updatedAt: new Date(),
      };

      console.log('Tentando upsert...');
      const result = await prisma.youTubeAccount.upsert({
        where: { userId: simulatedUserId },
        update: data,
        create: {
          userId: simulatedUserId,
          ...data,
          connectedAt: new Date(),
        },
      });

      console.log('✅ Conta YouTube salva com sucesso!');
      console.log(`ID da conta: ${result.id}`);
      console.log(`UserID: ${result.userId}`);
      console.log(`YouTube ID: ${result.youtubeUserId}`);
      console.log(`Username: ${result.youtubeUsername}`);

      // 5. Verificar se foi salva
      console.log('\n5️⃣ VERIFICAÇÃO FINAL:');
      const savedAccount = await prisma.youTubeAccount.findUnique({
        where: { userId: simulatedUserId }
      });

      if (savedAccount) {
        console.log('✅ Conta encontrada no banco!');
        console.log(`Access Token: ${savedAccount.accessToken ? 'Presente' : 'Ausente'}`);
        console.log(`Refresh Token: ${savedAccount.refreshToken ? 'Presente' : 'Ausente'}`);
        console.log(`Connected At: ${savedAccount.connectedAt}`);
      } else {
        console.log('❌ Conta NÃO encontrada no banco!');
      }

      // Limpar dados de teste
      console.log('\n🧹 LIMPANDO DADOS DE TESTE...');
      await prisma.youTubeAccount.delete({
        where: { userId: simulatedUserId }
      });
      console.log('Dados de teste removidos');

    } catch (error) {
      console.log('❌ Erro ao salvar conta YouTube:', error.message);
      console.log('Código do erro:', error.code);
      if (error.meta) {
        console.log('Meta:', error.meta);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOAuthFlow();
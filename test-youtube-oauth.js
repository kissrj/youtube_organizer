// Teste das credenciais YouTube OAuth
const http = require('http');

console.log('🔍 Testando configuração YouTube OAuth...\n');

// Simular uma requisição para verificar se as credenciais estão configuradas
const testUrl = 'http://localhost:3000/api/auth/youtube';

console.log('📺 Testando endpoint OAuth...');
console.log('🔗 URL:', testUrl);

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // Simular um cookie de sessão (não funcionará sem NextAuth)
    'Cookie': 'next-auth.session-token=test-session-token'
  }
};

const req = http.request(testUrl, options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);

  res.on('end', () => {
    console.log('📊 Status Code:', res.statusCode);

    try {
      const json = JSON.parse(data);
      console.log('📄 Resposta:', JSON.stringify(json, null, 2));

      if (json.error) {
        if (json.error.includes('Credenciais YouTube OAuth não configuradas')) {
          console.log('\n✅ VALIDAÇÃO FUNCIONANDO!');
          console.log('🎯 O sistema detectou que as credenciais são placeholders');
          console.log('📋 Próximos passos:');
          console.log('1. Configure OAuth no Google Cloud Console');
          console.log('2. Atualize YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET no .env');
          console.log('3. Reinicie o servidor');
          console.log('4. Teste novamente');
        } else if (json.error.includes('Usuário não autenticado')) {
          console.log('\n⚠️  Usuário não autenticado (esperado sem login)');
          console.log('💡 Para testar completamente, faça login primeiro');
        }
      }
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e.message);
      console.log('📄 Resposta bruta:', data);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Erro de rede:', e.message);
});

req.end();

console.log('\n⏳ Fazendo requisição...');
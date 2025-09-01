const https = require('https');

// Teste da configuração OAuth do YouTube
console.log('🔍 Testando configuração OAuth do YouTube...\n');

// Simular uma requisição básica para verificar se a API key está funcionando
const apiKey = 'AIzaSyCfZJ_-HD0i5hZp5cYG6JcHRiSK5zl4KPI';
const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`;

console.log('📺 Testando API Key básica...');
console.log('🔗 URL (com API key oculta):', testUrl.replace(apiKey, 'API_KEY_HERE'));

https.get(testUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('📊 Status Code:', res.statusCode);

      if (json.error) {
        console.log('❌ Erro da API:', json.error.message);
        console.log('🔍 Código do erro:', json.error.code);

        if (json.error.code === 403) {
          console.log('\n💡 Soluções para erro 403:');
          console.log('1. Verificar se a API key está correta');
          console.log('2. Verificar se a quota diária não foi excedida');
          console.log('3. Verificar se a YouTube Data API v3 está habilitada');
        }
      } else {
        console.log('✅ API Key funcionando!');
        console.log('📈 Resultados encontrados:', json.items?.length || 0);

        if (json.items?.[0]) {
          console.log('🎥 Primeiro vídeo:', json.items[0].snippet.title);
        }
      }

      console.log('\n🔐 Próximos passos para OAuth:');
      console.log('1. Acesse: https://console.developers.google.com/');
      console.log('2. Crie um projeto ou selecione um existente');
      console.log('3. Habilite a YouTube Data API v3');
      console.log('4. Vá para "Credenciais" > "Criar Credenciais" > "ID do cliente OAuth"');
      console.log('5. Configure o tipo como "Aplicativo Web"');
      console.log('6. Adicione http://localhost:3002 como URI de redirecionamento');
      console.log('7. Copie o Client ID e Client Secret para o .env');

      console.log('\n📝 Variáveis necessárias no .env:');
      console.log('YOUTUBE_CLIENT_ID="seu-client-id-aqui"');
      console.log('YOUTUBE_CLIENT_SECRET="seu-client-secret-aqui"');

    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e.message);
    }
  });
}).on('error', (e) => {
  console.log('❌ Erro de rede:', e.message);
});

console.log('\n⏳ Fazendo requisição...');
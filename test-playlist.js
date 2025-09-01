// Teste se a playlist existe no YouTube
const https = require('https');
const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PLAYLIST_ID = 'PL2Pv7e_3P80ISdmgBPA43POLsSpRDlBt0';
const API_KEY = process.env.YOUTUBE_API_KEY;

console.log('🔍 Testando playlist:', PLAYLIST_ID);
console.log('🔑 Usando API Key:', API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');

if (!API_KEY) {
  console.log('❌ YOUTUBE_API_KEY não configurada no .env');
  process.exit(1);
}

const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${PLAYLIST_ID}&key=${API_KEY}`;

console.log('📺 Fazendo requisição para:', url.replace(API_KEY, 'API_KEY_HERE'));

const req = https.get(url, (res) => {
  let data = '';

  console.log('📊 Status Code:', res.statusCode);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);

      if (json.error) {
        console.log('❌ Erro da API:', json.error.message);
        return;
      }

      const items = json.items || [];
      console.log('📊 Número de itens encontrados:', items.length);

      if (items.length === 0) {
        console.log('❌ Playlist NÃO encontrada');
        console.log('💡 Possíveis causas:');
        console.log('   • Playlist é privada');
        console.log('   • Playlist foi excluída');
        console.log('   • ID está incorreto');
        console.log('   • Playlist não é pública');
      } else {
        const playlist = items[0];
        console.log('✅ Playlist ENCONTRADA!');
        console.log('📋 Detalhes:');
        console.log('   • Título:', playlist.snippet.title);
        console.log('   • Canal:', playlist.snippet.channelTitle);
        console.log('   • Descrição:', playlist.snippet.description?.substring(0, 100) + '...');
        console.log('   • Privacidade:', playlist.status?.privacyStatus || 'pública');
      }

      console.log('\n🔍 Resposta completa:', JSON.stringify(json, null, 2));

    } catch (error) {
      console.log('❌ Erro ao processar resposta:', error.message);
      console.log('📄 Resposta bruta:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro de rede:', error.message);
});

req.setTimeout(10000, () => {
  console.log('⏰ Timeout - API não respondeu em 10 segundos');
  req.destroy();
});

console.log('⏳ Fazendo requisição...');
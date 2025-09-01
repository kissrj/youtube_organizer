const https = require('https');

// Lista de playlists públicas conhecidas para teste
const testPlaylists = [
  'PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI', // Exemplo genérico
  'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', // Música
  'PLrAXtmRdnEQzHiQ9vNJcWTuNMqO5wPjYI', // Tecnologia
  'PL4o29bINVT4EG_y-sBBXVrBlXTcQ0UbQG', // Educação
];

const apiKey = 'AIzaSyCfZJ_-HD0i5hZp5cYG6JcHRiSK5zl4KPI';

console.log('🔍 Procurando playlists válidas do YouTube...\n');

async function testPlaylist(playlistId) {
  return new Promise((resolve) => {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const hasItems = json.items && json.items.length > 0;

          resolve({
            id: playlistId,
            status: res.statusCode,
            hasItems,
            title: hasItems ? json.items[0].snippet.title : null,
            channel: hasItems ? json.items[0].snippet.channelTitle : null,
            error: json.error ? json.error.message : null
          });
        } catch (e) {
          resolve({
            id: playlistId,
            status: res.statusCode,
            hasItems: false,
            error: e.message
          });
        }
      });
    }).on('error', (e) => {
      resolve({
        id: playlistId,
        status: null,
        hasItems: false,
        error: e.message
      });
    });
  });
}

async function findValidPlaylist() {
  console.log('Testando playlists conhecidas...\n');

  for (const playlistId of testPlaylists) {
    console.log(`🎵 Testando: ${playlistId}`);
    const result = await testPlaylist(playlistId);

    console.log(`   Status: ${result.status}`);
    console.log(`   Itens encontrados: ${result.hasItems ? '✅' : '❌'}`);

    if (result.hasItems) {
      console.log(`   Título: "${result.title}"`);
      console.log(`   Canal: "${result.channel}"`);
      console.log(`\n🎉 Playlist válida encontrada!`);
      console.log(`📋 Use este ID para testar: ${playlistId}`);
      return playlistId;
    } else if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }

    console.log(''); // Linha em branco
  }

  console.log('❌ Nenhuma playlist válida encontrada nas opções de teste.');
  console.log('💡 Tente usar uma playlist pública do seu canal do YouTube.');
  return null;
}

// Executa a busca
findValidPlaylist().then((validId) => {
  if (validId) {
    console.log(`\n✅ ID válido para teste: ${validId}`);
    console.log('📝 Copie este ID e use no YouTube Organizer!');
  }
});
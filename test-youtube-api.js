const https = require('https');

// Teste com uma playlist conhecida do YouTube
const testPlaylistId = 'PLrAXtmRdnEQy5KQzqBv8KjHj9lJcKvPjI';
const apiKey = 'AIzaSyCfZJ_-HD0i5hZp5cYG6JcHRiSK5zl4KPI';

const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${testPlaylistId}&key=${apiKey}`;

console.log('🔍 Testando API do YouTube com playlist conhecida...');
console.log('📺 Playlist ID:', testPlaylistId);
console.log('🔗 URL (com API key oculta):', url.replace(apiKey, 'API_KEY_HERE'));

const req = https.get(url, (res) => {
  console.log('📊 Status Code:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => data += chunk);

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('📈 Items encontrados:', json.items?.length || 0);

      if (json.items?.[0]) {
        console.log('✅ Título da playlist:', json.items[0].snippet.title);
        console.log('👤 Canal:', json.items[0].snippet.channelTitle);
      }

      if (json.error) {
        console.log('❌ Erro da API:', json.error.message);
        console.log('🔍 Código do erro:', json.error.code);
      }

      // Teste com o ID problemático
      console.log('\n🔍 Testando ID problemático...');
      const problematicId = 'PL2Pv7e_3P80ISdmgBPA43POLsSpRDlBt0';
      const problematicUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${problematicId}&key=${apiKey}`;

      https.get(problematicUrl, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => data2 += chunk);
        res2.on('end', () => {
          try {
            const json2 = JSON.parse(data2);
            console.log('📊 Status Code (ID problemático):', res2.statusCode);
            console.log('📈 Items encontrados (ID problemático):', json2.items?.length || 0);

            if (json2.error) {
              console.log('❌ Erro da API (ID problemático):', json2.error.message);
            } else if (json2.items?.length === 0) {
              console.log('❌ Playlist não encontrada ou privada');
            }
          } catch (e) {
            console.log('❌ Erro ao parsear resposta do ID problemático:', e.message);
          }
        });
      }).on('error', (e) => {
        console.log('❌ Erro de rede (ID problemático):', e.message);
      });

    } catch (e) {
      console.log('❌ Erro ao parsear resposta:', e.message);
      console.log('📄 Resposta bruta:', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Erro de rede:', e.message);
});

req.setTimeout(10000, () => {
  console.log('⏰ Timeout - a requisição demorou mais de 10 segundos');
  req.destroy();
});
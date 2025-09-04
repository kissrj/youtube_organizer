const fetch = require('node-fetch');

async function testImportAPI() {
  console.log('🧪 TESTANDO API DE IMPORTAÇÃO YOUTUBE...\n');

  const baseUrl = 'http://localhost:3001';

  try {
    // 1. Testar endpoint POST (iniciar importação)
    console.log('1️⃣ TESTANDO POST /api/import/youtube');

    const postResponse = await fetch(`${baseUrl}/api/import/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        importHistory: true,
        importPlaylists: true,
        days: 1, // Apenas 1 dia para teste rápido
        applyAITags: false
      })
    });

    console.log('Status da resposta:', postResponse.status);

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ Resposta POST:', postData);

      if (postData.jobId) {
        console.log('\n2️⃣ TESTANDO GET /api/import/youtube (status)');

        // 2. Testar endpoint GET (verificar status)
        const jobId = postData.jobId;
        console.log('Job ID:', jobId);

        // Aguardar um pouco e verificar status
        await new Promise(resolve => setTimeout(resolve, 2000));

        const getResponse = await fetch(`${baseUrl}/api/import/youtube?jobId=${jobId}`);
        console.log('Status da resposta GET:', getResponse.status);

        if (getResponse.ok) {
          const getData = await getResponse.json();
          console.log('✅ Status da importação:', getData);
        } else {
          const errorText = await getResponse.text();
          console.log('❌ Erro na resposta GET:', errorText);
        }
      }
    } else {
      const errorText = await postResponse.text();
      console.log('❌ Erro na resposta POST:', errorText);
    }

  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('- Servidor não está rodando');
    console.log('- Porta incorreta (deve ser 3001)');
    console.log('- API não está respondendo');
  }
}

testImportAPI();
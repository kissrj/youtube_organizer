const fetch = require('node-fetch');

async function testFullImportProcess() {
  console.log('🧪 TESTANDO PROCESSO COMPLETO DE IMPORTAÇÃO YOUTUBE...\n');

  const baseUrl = 'http://localhost:3001';

  try {
    // 1. Testar se o servidor está respondendo
    console.log('1️⃣ TESTANDO CONECTIVIDADE DO SERVIDOR:');
    const healthCheck = await fetch(`${baseUrl}/`);
    console.log(`✅ Servidor responde: ${healthCheck.status}`);

    // 2. Testar endpoint POST (iniciar importação)
    console.log('\n2️⃣ TESTANDO POST /api/import/youtube (iniciar):');
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

    console.log(`Status da resposta POST: ${postResponse.status}`);

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ Resposta POST:', JSON.stringify(postData, null, 2));

      if (postData.jobId) {
        const jobId = postData.jobId;
        console.log(`\n🎯 Job ID criado: ${jobId}`);

        // 3. Aguardar um pouco para processamento
        console.log('\n⏳ Aguardando processamento...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 4. Testar múltiplas verificações de status
        console.log('\n3️⃣ TESTANDO GET /api/import/youtube (status):');

        for (let i = 0; i < 3; i++) {
          console.log(`\n📊 Tentativa ${i + 1}:`);
          try {
            const getResponse = await fetch(`${baseUrl}/api/import/youtube?jobId=${jobId}`);
            console.log(`Status da resposta GET: ${getResponse.status}`);

            if (getResponse.ok) {
              const getData = await getResponse.json();
              console.log('✅ Status do job:', JSON.stringify(getData, null, 2));

              if (getData.status === 'completed' || getData.status === 'failed') {
                console.log('🎉 Job finalizado!');
                break;
              }
            } else {
              const errorText = await getResponse.text();
              console.log('❌ Erro na resposta GET:', errorText);
            }
          } catch (error) {
            console.log('❌ Erro na requisição GET:', error.message);
          }

          // Aguardar entre tentativas
          if (i < 2) {
            console.log('⏳ Aguardando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // 5. Verificar dados importados
        console.log('\n4️⃣ VERIFICANDO DADOS IMPORTADOS:');
        const checkData = async () => {
          try {
            const videoCount = await fetch(`${baseUrl}/api/videos`);
            if (videoCount.ok) {
              const data = await videoCount.json();
              console.log(`✅ Vídeos na API: ${data.total || 'N/A'}`);
            }
          } catch (error) {
            console.log('❌ Erro ao verificar vídeos:', error.message);
          }
        };

        await checkData();

      } else {
        console.log('❌ Nenhum jobId retornado');
      }
    } else {
      const errorText = await postResponse.text();
      console.log('❌ Erro na resposta POST:', errorText);
    }

  } catch (error) {
    console.log('❌ Erro geral no teste:', error.message);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('- Servidor não está rodando');
    console.log('- Porta incorreta (deve ser 3001)');
    console.log('- Problema de autenticação');
    console.log('- Conta YouTube não conectada');
  }
}

testFullImportProcess();
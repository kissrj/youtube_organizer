const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testImprovedImport() {
  console.log('🧪 TESTANDO SISTEMA DE IMPORTAÇÃO MELHORADO...\n');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ VERIFICANDO SERVIDOR...');
    await execAsync('curl -s http://localhost:3001/ > nul');
    console.log('✅ Servidor está rodando');

    // 2. Testar criação de job
    console.log('\n2️⃣ TESTANDO CRIAÇÃO DE JOB...');
    const createResponse = await execAsync(
      'curl -s -X POST http://localhost:3001/api/import/youtube -H "Content-Type: application/json" -d "{\\"importHistory\\":true,\\"importPlaylists\\":true,\\"days\\":1,\\"applyAITags\\":false}"'
    );

    console.log('Resposta de criação:', createResponse.stdout);

    let jobId = null;
    try {
      const createData = JSON.parse(createResponse.stdout);
      if (createData.jobId) {
        jobId = createData.jobId;
        console.log(`✅ Job criado com sucesso: ${jobId}`);
      } else {
        console.log('❌ Falha na criação do job');
        return;
      }
    } catch (e) {
      console.log('❌ Erro ao fazer parse da resposta de criação');
      return;
    }

    // 3. Aguardar processamento
    console.log('\n⏳ Aguardando processamento inicial...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Testar múltiplas verificações de status
    console.log('\n3️⃣ TESTANDO VERIFICAÇÕES DE STATUS...');

    for (let i = 0; i < 3; i++) {
      console.log(`\n📊 Tentativa ${i + 1}:`);
      try {
        const { stdout: statusResponse } = await execAsync(
          `curl -s "http://localhost:3001/api/import/youtube?jobId=${jobId}"`
        );

        console.log('Resposta de status:', statusResponse);

        try {
          const statusData = JSON.parse(statusResponse);
          console.log(`✅ Status: ${statusData.status}`);
          console.log(`📈 Progresso: ${statusData.overallProgress}%`);
          console.log(`🎬 Vídeos: ${statusData.videosImported}`);
          console.log(`📝 Etapa: ${statusData.currentStep}`);

          if (statusData.errors && statusData.errors.length > 0) {
            console.log('⚠️ Erros encontrados:', statusData.errors);
          }

          if (statusData.status === 'completed' || statusData.status === 'failed') {
            console.log('🎉 Job finalizado!');
            break;
          }
        } catch (parseError) {
          console.log('❌ Erro ao fazer parse da resposta de status');
        }

      } catch (error) {
        console.log('❌ Erro na requisição de status:', error.message);
      }

      // Aguardar entre tentativas
      if (i < 2) {
        console.log('⏳ Aguardando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // 5. Testar job inexistente
    console.log('\n4️⃣ TESTANDO JOB INEXISTENTE...');
    try {
      const { stdout: notFoundResponse } = await execAsync(
        'curl -s "http://localhost:3001/api/import/youtube?jobId=job_inexistente_12345"'
      );

      console.log('Resposta para job inexistente:', notFoundResponse);

      try {
        const notFoundData = JSON.parse(notFoundResponse);
        console.log(`✅ Status correto: ${notFoundData.status}`);
        console.log(`📝 Mensagem: ${notFoundData.currentStep}`);
        console.log(`⚠️ Erros:`, notFoundData.errors);
      } catch (parseError) {
        console.log('❌ Erro ao fazer parse da resposta de job inexistente');
      }

    } catch (error) {
      console.log('❌ Erro na requisição de job inexistente:', error.message);
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.log('❌ ERRO GERAL NO TESTE:', error.message);
  }
}

testImprovedImport();
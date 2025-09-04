const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testFrontendFix() {
  console.log('🧪 TESTANDO CORREÇÕES DO FRONTEND...\n');

  try {
    // 1. Testar GET sem jobId (deve dar erro 400 com debug info)
    console.log('1️⃣ TESTANDO GET SEM JOBID:');
    try {
      const { stdout } = await execAsync('curl -s "http://localhost:3001/api/import/youtube"');
      const response = JSON.parse(stdout);
      console.log('✅ Resposta esperada (erro 400):', response.error);
      console.log('📋 Detalhes:', response.details);
      if (response.debug) {
        console.log('🐛 Debug info:', response.debug);
      }
    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 2. Testar GET com jobId (deve funcionar)
    console.log('2️⃣ TESTANDO GET COM JOBID:');
    try {
      const { stdout } = await execAsync('curl -s "http://localhost:3001/api/import/youtube?jobId=test_frontend_fix"');
      const response = JSON.parse(stdout);
      console.log('✅ Resposta esperada (status):', response.status);
      console.log('📊 Progresso:', response.overallProgress + '%');
      console.log('🎬 Vídeos:', response.videosImported);
    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 3. Testar POST (iniciar importação)
    console.log('3️⃣ TESTANDO POST (INICIAR IMPORTAÇÃO):');
    try {
      const { stdout } = await execAsync(
        'curl -s -X POST http://localhost:3001/api/import/youtube -H "Content-Type: application/json" -d "{\\"importHistory\\":true,\\"importPlaylists\\":false,\\"days\\":1,\\"applyAITags\\":false}"'
      );
      const response = JSON.parse(stdout);
      console.log('📡 Resposta do POST:', response);

      if (response.jobId) {
        console.log('✅ Job criado com sucesso:', response.jobId);

        // Testar o jobId retornado
        console.log('\n🔄 TESTANDO JOBID RETORNADO:');
        const { stdout: statusResponse } = await execAsync(
          `curl -s "http://localhost:3001/api/import/youtube?jobId=${response.jobId}"`
        );
        const statusData = JSON.parse(statusResponse);
        console.log('📊 Status do job criado:', statusData.status);
      } else {
        console.log('❌ JobId não retornado:', response);
      }
    } catch (error) {
      console.log('❌ Erro no POST:', error.message);
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('\n💡 DICAS PARA TESTE MANUAL:');
    console.log('1. Abra http://localhost:3001/import/youtube');
    console.log('2. Configure as opções desejadas');
    console.log('3. Clique em "🚀 Iniciar Importação"');
    console.log('4. Verifique se não há mais erro "Job ID é obrigatório"');
    console.log('5. O progresso deve ser exibido corretamente');

  } catch (error) {
    console.log('❌ ERRO GERAL NO TESTE:', error.message);
  }
}

testFrontendFix();
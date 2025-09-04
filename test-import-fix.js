const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testImportFix() {
  console.log('🧪 TESTANDO CORREÇÃO DA IMPORTAÇÃO YOUTUBE...\n');

  try {
    // 1. Testar se o servidor está rodando
    console.log('1️⃣ VERIFICANDO SERVIDOR...');
    await execAsync('curl -s http://localhost:3001 > nul');
    console.log('✅ Servidor está rodando');

    // 2. Testar endpoint POST (iniciar importação)
    console.log('\n2️⃣ TESTANDO INÍCIO DA IMPORTAÇÃO...');
    const { stdout: postOutput } = await execAsync(
      'curl -s -X POST http://localhost:3001/api/import/youtube -H "Content-Type: application/json" -d "{\\"importHistory\\":true,\\"importPlaylists\\":true,\\"days\\":1,\\"applyAITags\\":false}"'
    );

    console.log('Resposta POST:', postOutput);

    let jobId = null;
    try {
      const postData = JSON.parse(postOutput);
      if (postData.jobId) {
        jobId = postData.jobId;
        console.log(`✅ Job criado: ${jobId}`);
      } else {
        console.log('❌ Nenhum jobId retornado');
        return;
      }
    } catch (e) {
      console.log('❌ Erro ao fazer parse da resposta POST');
      return;
    }

    // 3. Aguardar processamento
    console.log('\n⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Testar endpoint GET (verificar status)
    console.log('\n3️⃣ TESTANDO VERIFICAÇÃO DE STATUS...');
    const { stdout: getOutput } = await execAsync(
      `curl -s "http://localhost:3001/api/import/youtube?jobId=${jobId}"`
    );

    console.log('Resposta GET:', getOutput);

    try {
      const getData = JSON.parse(getOutput);
      console.log('✅ Status obtido com sucesso!');
      console.log(`📊 Status: ${getData.status}`);
      console.log(`📈 Progresso: ${getData.overallProgress}%`);
      console.log(`🎬 Vídeos: ${getData.videosImported}`);
      console.log(`📝 Etapa atual: ${getData.currentStep}`);

      if (getData.errors && getData.errors.length > 0) {
        console.log('⚠️ Erros encontrados:', getData.errors);
      }

    } catch (e) {
      console.log('❌ Erro ao fazer parse da resposta GET');
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');

  } catch (error) {
    console.log('❌ ERRO NO TESTE:', error.message);
  }
}

testImportFix();
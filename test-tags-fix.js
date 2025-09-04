const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testTagsFix() {
  console.log('🧪 TESTANDO CORREÇÃO DAS TAGS...\n');

  try {
    // 1. Verificar se há vídeos no banco
    console.log('1️⃣ VERIFICANDO VÍDEOS NO BANCO:');
    const { stdout: videoCheck } = await execAsync('node -e "const { PrismaClient } = require(\'@prisma/client\'); async function check() { const prisma = new PrismaClient(); const count = await prisma.video.count(); console.log(\`Vídeos: ${count}\`); await prisma.$disconnect(); } check();"');
    console.log('Resultado:', videoCheck.trim());

    // 2. Verificar se há tags no banco
    console.log('\n2️⃣ VERIFICANDO TAGS NO BANCO:');
    const { stdout: tagCheck } = await execAsync('node -e "const { PrismaClient } = require(\'@prisma/client\'); async function check() { const prisma = new PrismaClient(); const count = await prisma.tag.count(); console.log(\`Tags: ${count}\`); await prisma.$disconnect(); } check();"');
    console.log('Resultado:', tagCheck.trim());

    // 3. Testar criação de uma tag individual (simulando o código corrigido)
    console.log('\n3️⃣ TESTANDO CRIAÇÃO DE TAG INDIVIDUAL:');
    try {
      const { stdout: tagCreateTest } = await execAsync('node -e "const { PrismaClient } = require(\'@prisma/client\'); async function test() { const prisma = new PrismaClient(); try { const tag = await prisma.tag.create({ data: { name: \'test_tag_\' + Date.now(), userId: \'cmf3rnb580000up10j3vqb8vv\', isAuto: true, category: \'geral\' } }); console.log(\'✅ Tag criada com sucesso:\', tag.name); } catch (e) { console.log(\'❌ Erro ao criar tag:\', e.message); } await prisma.$disconnect(); } test();"');
      console.log('Resultado:', tagCreateTest.trim());
    } catch (error) {
      console.log('❌ Erro no teste de criação:', error.message);
    }

    // 4. Verificar se o servidor está rodando
    console.log('\n4️⃣ VERIFICANDO SERVIDOR:');
    try {
      const { stdout: serverCheck } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/videos');
      console.log('Status do servidor:', serverCheck === '401' ? '✅ Rodando (401 - não autorizado)' : serverCheck);
    } catch (error) {
      console.log('❌ Servidor não está rodando');
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Execute uma nova importação do YouTube');
    console.log('2. Verifique se as tags são criadas sem erro');
    console.log('3. Confirme se as tags são associadas aos vídeos');

  } catch (error) {
    console.log('❌ ERRO GERAL NO TESTE:', error.message);
  }
}

testTagsFix();
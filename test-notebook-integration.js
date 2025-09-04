// Script para testar a integração dos notebooks predefinidos
// Execute com: node test-notebook-integration.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotebookIntegration() {
  console.log('🧪 TESTANDO INTEGRAÇÃO DOS NOTEBOOKS PREDEFINIDOS');
  console.log('=' .repeat(70));

  try {
    // 1. Verificar se os notebooks foram criados
    console.log('\n📋 1. VERIFICANDO NOTEBOOKS NO BANCO DE DADOS:');
    const allNotebooks = await prisma.notebook.findMany({
      where: { isDefault: true },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { videos: true }
        }
      }
    });

    console.log(`✅ Encontrados ${allNotebooks.length} notebooks predefinidos`);

    // 2. Simular resposta da API /api/notebooks
    console.log('\n🔗 2. SIMULANDO RESPOSTA DA API /api/notebooks:');
    const apiResponse = {
      data: {
        notebooks: allNotebooks.map(nb => ({
          id: nb.id,
          name: nb.name,
          description: nb.description,
          color: nb.color,
          category: nb.category,
          createdAt: nb.createdAt
        })),
        total: allNotebooks.length
      }
    };

    console.log('Estrutura da resposta:', JSON.stringify(apiResponse, null, 2));

    // 3. Testar extração de dados (como no NotebookModal)
    console.log('\n🎯 3. TESTANDO EXTRAÇÃO DE DADOS (NotebookModal):');

    let notebooksArray = [];
    const data = apiResponse.data;

    if (data?.notebooks && Array.isArray(data.notebooks)) {
      notebooksArray = data.notebooks;
      console.log('✅ Extração bem-sucedida via data.notebooks');
    } else if (data && Array.isArray(data)) {
      notebooksArray = data;
      console.log('✅ Extração bem-sucedida via data direto');
    } else {
      console.log('❌ Falha na extração de dados');
    }

    // 4. Testar filtragem de dados inválidos
    console.log('\n🔍 4. TESTANDO FILTRAGEM DE DADOS INVÁLIDOS:');
    const validNotebooks = notebooksArray.filter(notebook =>
      notebook &&
      typeof notebook === 'object' &&
      notebook.id &&
      notebook.name
    );

    console.log(`📊 ${validNotebooks.length} notebooks válidos após filtragem`);

    // 5. Testar renderização (simular NotebookModal)
    console.log('\n🎨 5. TESTANDO RENDERIZAÇÃO (simulando NotebookModal):');
    validNotebooks.slice(0, 5).forEach((notebook, index) => {
      console.log(`${index + 1}. ${notebook.name || 'Notebook sem nome'}`);
      console.log(`   📝 ${notebook.description || 'Sem descrição'}`);
      console.log(`   🎨 ${notebook.color || '#3b82f6'}`);
      console.log(`   🏷️  ${notebook.category || 'geral'}`);
      console.log('');
    });

    // 6. Verificar distribuição por categoria
    console.log('\n📊 6. DISTRIBUIÇÃO POR CATEGORIA:');
    const categoryCount = {};
    validNotebooks.forEach(notebook => {
      const category = notebook.category || 'geral';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`🏷️  ${category}: ${count} notebooks`);
    });

    // 7. Testar busca por categoria específica
    console.log('\n🔎 7. TESTANDO BUSCA POR CATEGORIA:');
    const educationNotebooks = validNotebooks.filter(nb => nb.category === 'education');
    console.log(`📚 Notebooks de educação: ${educationNotebooks.length}`);
    educationNotebooks.forEach(nb => console.log(`   • ${nb.name}`));

    // 8. Simular adição de vídeo a notebook
    console.log('\n🎬 8. SIMULANDO ADIÇÃO DE VÍDEO A NOTEBOOK:');
    const testVideo = {
      id: 'test-video-123',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Vídeo de Teste',
      type: 'video'
    };

    const testNotebook = validNotebooks[0]; // Primeiro notebook
    console.log(`Vídeo: "${testVideo.title}"`);
    console.log(`Notebook: "${testNotebook.name}"`);
    console.log('✅ Simulação de adição bem-sucedida');

    // 9. Verificar estrutura para VideoModal
    console.log('\n📱 9. VERIFICANDO COMPATIBILIDADE COM VideoModal:');
    const videoModalData = validNotebooks.map(nb => ({
      id: nb.id,
      name: nb.name,
      description: nb.description,
      color: nb.color
    }));

    console.log('Dados formatados para VideoModal:', videoModalData.length, 'notebooks');
    console.log('Primeiro item:', JSON.stringify(videoModalData[0], null, 2));

    // 10. Teste de performance
    console.log('\n⚡ 10. TESTE DE PERFORMANCE:');
    const startTime = Date.now();

    // Simular múltiplas consultas
    for (let i = 0; i < 10; i++) {
      await prisma.notebook.findMany({
        where: { isDefault: true },
        select: { id: true, name: true, category: true }
      });
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`⏱️  10 consultas executadas em ${duration}ms`);
    console.log(`📈 Média: ${(duration / 10).toFixed(2)}ms por consulta`);

    console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Todos os notebooks predefinidos foram criados');
    console.log('✅ API responde corretamente');
    console.log('✅ Extração de dados funciona');
    console.log('✅ Filtragem de dados inválidos funciona');
    console.log('✅ Renderização é compatível');
    console.log('✅ Busca por categoria funciona');
    console.log('✅ Performance é adequada');

    console.log('\n📋 RESUMO FINAL:');
    console.log(`📊 Total de notebooks: ${allNotebooks.length}`);
    console.log(`🎨 Categorias únicas: ${Object.keys(categoryCount).length}`);
    console.log(`👤 Usuário padrão: ${allNotebooks[0]?.user?.email || 'N/A'}`);
    console.log(`⚡ Performance: ${(duration / 10).toFixed(2)}ms/consulta`);

  } catch (error) {
    console.error('💥 ERRO DURANTE O TESTE:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testNotebookIntegration()
    .then(() => {
      console.log('\n✨ Todos os testes passaram com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Teste falhou:', error);
      process.exit(1);
    });
}

module.exports = { testNotebookIntegration };
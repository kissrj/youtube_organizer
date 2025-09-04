const { defaultNotebooks } = require('./src/lib/data/default-notebooks.ts');

// Simular a criação de um notebook padrão
async function testCreateDefaultNotebook() {
  console.log('=== TESTE: CRIAR NOTEBOOK PADRÃO ===\n');

  // Pegar o primeiro notebook padrão como exemplo
  const testNotebook = defaultNotebooks[0];
  console.log('Notebook padrão selecionado:', testNotebook);

  // Dados que seriam enviados para a API
  const apiData = {
    name: testNotebook.name,
    description: testNotebook.description,
    icon: testNotebook.icon,
    color: testNotebook.color,
    isPublic: false,
  };

  console.log('\nDados que seriam enviados para /api/notebooks:');
  console.log(JSON.stringify(apiData, null, 2));

  // Simular chamada para API (sem autenticação por enquanto)
  console.log('\n=== SIMULAÇÃO DA CHAMADA API ===');
  console.log('POST /api/notebooks');
  console.log('Headers: { "Content-Type": "application/json" }');
  console.log('Body:', JSON.stringify(apiData, null, 2));

  console.log('\n=== RESULTADO ESPERADO ===');
  console.log('✅ Notebook criado no banco de dados');
  console.log('✅ Usuário redirecionado para /notebooks/{id}');
  console.log('✅ Toast de sucesso exibido');

  console.log('\n=== POSSÍVEIS PROBLEMAS ===');
  console.log('❌ Usuário não autenticado (401)');
  console.log('❌ Erro na API (500)');
  console.log('❌ Problema de rede');
  console.log('❌ Dados inválidos');

  console.log('\n=== PRÓXIMOS PASSOS ===');
  console.log('1. Fazer login no sistema');
  console.log('2. Clicar em um notebook padrão');
  console.log('3. Verificar se foi criado no banco');
  console.log('4. Verificar logs do servidor');
}

// Executar teste
testCreateDefaultNotebook();
const { generateYouTubeAuthUrl, validateYouTubeCredentials } = require('./src/lib/youtube-oauth.ts');

console.log('=== DEBUG YOUTUBE OAUTH CONFIGURATION ===\n');

// 1. Verificar credenciais
console.log('1️⃣ VERIFICANDO CREDENCIAIS:');
const validation = validateYouTubeCredentials();
console.log('Credenciais válidas:', validation.valid);
if (!validation.valid) {
  console.log('Erro:', validation.error);
}

// 2. Verificar variáveis de ambiente
console.log('\n2️⃣ VARIÁVEIS DE AMBIENTE:');
console.log('YOUTUBE_CLIENT_ID:', process.env.YOUTUBE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
console.log('YOUTUBE_CLIENT_SECRET:', process.env.YOUTUBE_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');
console.log('YOUTUBE_REDIRECT_URI:', process.env.YOUTUBE_REDIRECT_URI || '❌ Não configurado');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Não configurado');

// 3. Testar geração de URL
console.log('\n3️⃣ TESTANDO GERAÇÃO DE URL:');
try {
  const testUserId = 'cmf3rnb580000up10j3vqb8vv';
  const authUrl = generateYouTubeAuthUrl(testUserId);
  console.log('✅ URL gerada com sucesso');
  console.log('URL:', authUrl.substring(0, 100) + '...');

  // Verificar se contém a porta correta
  if (authUrl.includes('localhost:3001')) {
    console.log('✅ URL contém porta correta (3001)');
  } else if (authUrl.includes('localhost:3000')) {
    console.log('❌ URL contém porta errada (3000)');
  } else {
    console.log('❓ URL não contém localhost');
  }
} catch (error) {
  console.log('❌ Erro ao gerar URL:', error.message);
}

// 4. Verificar configuração do cliente OAuth
console.log('\n4️⃣ CONFIGURAÇÃO DO CLIENTE OAUTH:');
const { google } = require('googleapis');

try {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  console.log('✅ Cliente OAuth criado com sucesso');
  console.log('Redirect URI configurada:', oauth2Client.redirectUri);
} catch (error) {
  console.log('❌ Erro ao criar cliente OAuth:', error.message);
}
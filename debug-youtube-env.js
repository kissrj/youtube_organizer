console.log('=== DEBUG YOUTUBE ENVIRONMENT VARIABLES ===\n');

// Carregar variáveis de ambiente
require('dotenv').config();

console.log('1️⃣ VARIÁVEIS DE AMBIENTE:');
console.log('YOUTUBE_CLIENT_ID:', process.env.YOUTUBE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
console.log('YOUTUBE_CLIENT_SECRET:', process.env.YOUTUBE_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');
console.log('YOUTUBE_REDIRECT_URI:', process.env.YOUTUBE_REDIRECT_URI || '❌ Não configurado');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Não configurado');

console.log('\n2️⃣ VALORES DETALHADOS:');
console.log('YOUTUBE_REDIRECT_URI:', process.env.YOUTUBE_REDIRECT_URI);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

console.log('\n3️⃣ VERIFICAÇÃO DE PORTA:');
if (process.env.YOUTUBE_REDIRECT_URI && process.env.YOUTUBE_REDIRECT_URI.includes('3001')) {
  console.log('✅ YOUTUBE_REDIRECT_URI usa porta 3001');
} else if (process.env.YOUTUBE_REDIRECT_URI && process.env.YOUTUBE_REDIRECT_URI.includes('3000')) {
  console.log('❌ YOUTUBE_REDIRECT_URI usa porta 3000 (INCORRETO)');
} else {
  console.log('❓ YOUTUBE_REDIRECT_URI não contém porta localhost');
}

if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('3001')) {
  console.log('✅ NEXTAUTH_URL usa porta 3001');
} else if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('3000')) {
  console.log('❌ NEXTAUTH_URL usa porta 3000 (INCORRETO)');
} else {
  console.log('❓ NEXTAUTH_URL não contém porta localhost');
}

console.log('\n4️⃣ VERIFICAÇÃO DE CREDENCIAIS:');
if (process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_ID !== 'seu-youtube-client-id-aqui') {
  console.log('✅ YOUTUBE_CLIENT_ID parece válido');
} else {
  console.log('❌ YOUTUBE_CLIENT_ID não configurado ou é placeholder');
}

if (process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_CLIENT_SECRET !== 'seu-youtube-client-secret-aqui') {
  console.log('✅ YOUTUBE_CLIENT_SECRET parece válido');
} else {
  console.log('❌ YOUTUBE_CLIENT_SECRET não configurado ou é placeholder');
}
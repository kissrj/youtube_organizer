const { PrismaClient } = require('@prisma/client');

async function clearYouTubeData() {
  const prisma = new PrismaClient();

  try {
    console.log('🧹 INICIANDO LIMPEZA DOS DADOS DO YOUTUBE...\n');

    // 1. Contar dados atuais
    console.log('📊 DADOS ATUAIS:');
    const videoCount = await prisma.video.count();
    const playlistCount = await prisma.playlist.count();
    const categoryCount = await prisma.category.count();
    const tagCount = await prisma.tag.count();
    const youtubeAccountCount = await prisma.youTubeAccount.count();

    console.log(`Vídeos: ${videoCount}`);
    console.log(`Playlists: ${playlistCount}`);
    console.log(`Categorias: ${categoryCount}`);
    console.log(`Tags: ${tagCount}`);
    console.log(`Contas YouTube: ${youtubeAccountCount}`);

    // 2. Limpar dados em ordem (respeitando foreign keys)
    console.log('\n🗑️ LIMPANDO DADOS...');

    // Limpar relacionamentos primeiro
    console.log('Limpando relacionamentos Video-Tag...');
    await prisma.videoTag.deleteMany();

    console.log('Limpando relacionamentos Video-Category...');
    await prisma.videoCategory.deleteMany();

    console.log('Limpando relacionamentos Playlist-Tag...');
    await prisma.playlistTag.deleteMany();

    console.log('Limpando relacionamentos Playlist-Category...');
    await prisma.playlistCategory.deleteMany();

    // Limpar tabelas principais
    console.log('Limpando vídeos...');
    await prisma.video.deleteMany();

    console.log('Limpando playlists...');
    await prisma.playlist.deleteMany();

    console.log('Limpando tags...');
    await prisma.tag.deleteMany();

    console.log('Limpando categorias...');
    await prisma.category.deleteMany();

    // OPCIONAL: Limpar conta YouTube (descomente se quiser)
    // console.log('Limpando conta YouTube...');
    // await prisma.youTubeAccount.deleteMany();

    // 3. Verificar limpeza
    console.log('\n✅ VERIFICAÇÃO DA LIMPEZA:');
    const newVideoCount = await prisma.video.count();
    const newPlaylistCount = await prisma.playlist.count();
    const newCategoryCount = await prisma.category.count();
    const newTagCount = await prisma.tag.count();

    console.log(`Vídeos restantes: ${newVideoCount}`);
    console.log(`Playlists restantes: ${newPlaylistCount}`);
    console.log(`Categorias restantes: ${newCategoryCount}`);
    console.log(`Tags restantes: ${newTagCount}`);

    // 4. Manter dados importantes
    console.log('\n💾 DADOS PRESERVADOS:');
    const userCount = await prisma.user.count();
    const youtubeAccountCountAfter = await prisma.youTubeAccount.count();

    console.log(`Usuários: ${userCount} (preservado)`);
    console.log(`Contas YouTube: ${youtubeAccountCountAfter} (preservada)`);

    console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('Agora você pode fazer uma nova importação limpa.');

  } catch (error) {
    console.error('❌ ERRO DURANTE LIMPEZA:', error);
    console.log('\n🔧 PARA LIMPAR MANUALMENTE:');
    console.log('1. Pare o servidor (Ctrl+C)');
    console.log('2. Delete o arquivo: prisma/dev.db');
    console.log('3. Execute: npx prisma migrate reset');
    console.log('4. Execute: npm run dev');
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  clearYouTubeData();
}

module.exports = { clearYouTubeData };
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('Verificando dados no banco...\n');

    const videoCount = await prisma.video.count();
    console.log(`Vídeos: ${videoCount}`);

    const playlistCount = await prisma.playlist.count();
    console.log(`Playlists: ${playlistCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`Categorias: ${categoryCount}`);

    const tagCount = await prisma.tag.count();
    console.log(`Tags: ${tagCount}`);

    const userCount = await prisma.user.count();
    console.log(`Usuários: ${userCount}`);

    if (videoCount > 0) {
      console.log('\nPrimeiros 3 vídeos:');
      const videos = await prisma.video.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          youtubeId: true,
          userId: true
        }
      });
      videos.forEach(v => console.log(`- ${v.title} (${v.youtubeId})`));
    }

  } catch (error) {
    console.error('Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
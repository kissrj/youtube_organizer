// Script para verificar tags no banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTags() {
  try {
    console.log('🔍 Verificando dados de tags no banco...\n');

    // Verificar tags existentes
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            videos: true,
            playlists: true
          }
        }
      }
    });

    console.log(`📊 Total de tags: ${tags.length}`);
    if (tags.length > 0) {
      console.log('Tags encontradas:');
      tags.forEach(tag => {
        console.log(`  - ${tag.name} (ID: ${tag.id}, Vídeos: ${tag._count.videos}, Playlists: ${tag._count.playlists})`);
      });
    }

    // Verificar associações VideoTag
    const videoTags = await prisma.videoTag.findMany({
      include: {
        video: { select: { id: true, title: true } },
        tag: { select: { id: true, name: true } }
      },
      take: 10
    });

    console.log(`\n🔗 Associações Video-Tag: ${videoTags.length}`);
    if (videoTags.length > 0) {
      console.log('Primeiras associações:');
      videoTags.forEach(vt => {
        console.log(`  - Vídeo "${vt.video.title}" → Tag "${vt.tag.name}"`);
      });
    }

    // Verificar associações PlaylistTag
    const playlistTags = await prisma.playlistTag.findMany({
      include: {
        playlist: { select: { id: true, title: true } },
        tag: { select: { id: true, name: true } }
      },
      take: 10
    });

    console.log(`\n🎵 Associações Playlist-Tag: ${playlistTags.length}`);
    if (playlistTags.length > 0) {
      console.log('Primeiras associações:');
      playlistTags.forEach(pt => {
        console.log(`  - Playlist "${pt.playlist.title}" → Tag "${pt.tag.name}"`);
      });
    }

    // Verificar vídeos com tags
    const videosWithTags = await prisma.video.findMany({
      where: {
        tags: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            tags: true
          }
        }
      },
      take: 5
    });

    console.log(`\n🎬 Vídeos com tags: ${videosWithTags.length}`);
    if (videosWithTags.length > 0) {
      console.log('Vídeos encontrados:');
      videosWithTags.forEach(video => {
        console.log(`  - "${video.title}" (${video._count.tags} tags)`);
      });
    }

    // Verificar playlists com tags
    const playlistsWithTags = await prisma.playlist.findMany({
      where: {
        tags: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            tags: true
          }
        }
      },
      take: 5
    });

    console.log(`\n📂 Playlists com tags: ${playlistsWithTags.length}`);
    if (playlistsWithTags.length > 0) {
      console.log('Playlists encontradas:');
      playlistsWithTags.forEach(playlist => {
        console.log(`  - "${playlist.title}" (${playlist._count.tags} tags)`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTags();
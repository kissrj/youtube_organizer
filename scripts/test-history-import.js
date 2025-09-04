const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testHistoryImport() {
  console.log('🧪 Testando rotina de importação do histórico...')

  try {
    // Simular dados que viriam da API do YouTube
    const mockActivities = [
      {
        snippet: {
          type: 'video',
          publishedAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
        },
        contentDetails: {
          upload: {
            videoId: 'dQw4w9WgXcQ' // Vídeo de teste
          }
        }
      },
      {
        snippet: {
          type: 'video',
          publishedAt: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
        },
        contentDetails: {
          upload: {
            videoId: '9bZkp7q19f0' // Outro vídeo de teste
          }
        }
      }
    ]

    console.log('📊 Simulando processamento de atividades...')
    console.log(`Encontradas ${mockActivities.length} atividades simuladas`)

    for (const item of mockActivities) {
      if (item.snippet?.type === 'video' && item.contentDetails?.upload?.videoId) {
        const videoId = item.contentDetails.upload.videoId
        const activityTime = new Date(item.snippet.publishedAt)

        console.log(`🎬 Vídeo simulado: ${videoId} - Atividade: ${activityTime.toISOString()}`)

        // Verificar se o vídeo já existe (simulação)
        const existingVideo = await prisma.video.findUnique({
          where: {
            userId_youtubeId: {
              userId: 'test-user',
              youtubeId: videoId
            }
          }
        })

        if (existingVideo) {
          console.log(`📋 Vídeo ${videoId} já existe, seria atualizado`)
        } else {
          console.log(`🆕 Vídeo ${videoId} seria importado`)
        }
      }
    }

    console.log('✅ Teste concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testHistoryImport()
}

module.exports = { testHistoryImport }
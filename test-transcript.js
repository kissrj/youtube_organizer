const { YoutubeTranscript } = require('youtube-transcript')

async function testTranscript(videoId) {
  try {
    console.log(`\n🔍 Testando transcript para vídeo: ${videoId}`)

    // Tenta múltiplas abordagens
    let transcript = null
    let attemptCount = 0
    const maxAttempts = 3

    while (attemptCount < maxAttempts && !transcript) {
      attemptCount++
      console.log(`🔄 Tentativa ${attemptCount}/${maxAttempts}`)

      try {
        // Tenta com idioma padrão
        transcript = await YoutubeTranscript.fetchTranscript(videoId)
        console.log(`📊 Transcript bruto: ${transcript?.length || 0} itens`)
      } catch (error) {
        console.log(`❌ Tentativa ${attemptCount} falhou:`, error.message)

        // Tenta com português
        if (attemptCount === 1) {
          try {
            console.log('🌍 Tentando português...')
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
          } catch (ptError) {
            console.log('❌ Português falhou')
          }
        }

        // Tenta com inglês
        if (attemptCount === 2) {
          try {
            console.log('🌍 Tentando inglês...')
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
          } catch (enError) {
            console.log('❌ Inglês falhou')
          }
        }
      }
    }

    if (!transcript) {
      console.log('❌ Todas as tentativas falharam')
      return null
    }

    if (transcript.length === 0) {
      console.log('⚠️ Transcript vazio')
      return null
    }

    // Filtra itens válidos
    const validItems = transcript.filter(item =>
      item &&
      item.text &&
      typeof item.text === 'string' &&
      item.text.trim().length > 0 &&
      typeof item.offset === 'number' &&
      typeof item.duration === 'number'
    )

    if (validItems.length === 0) {
      console.log('⚠️ Nenhum item válido encontrado')
      return null
    }

    console.log(`✅ Transcript encontrado! ${validItems.length} itens válidos`)
    console.log(`📝 Primeiro item: "${validItems[0]?.text?.substring(0, 50)}..."`)
    console.log(`📝 Último item: "${validItems[validItems.length - 1]?.text?.substring(0, 50)}..."`)

    return validItems
  } catch (error) {
    console.error('❌ Erro ao buscar transcript:', error.message)
    return null
  }
}

// Teste com o vídeo específico do usuário
async function testUserVideo() {
  console.log('🎯 Testando vídeo específico do usuário: vtQUM0k1WIY')
  const result = await testTranscript('vtQUM0k1WIY')

  if (result) {
    console.log('\n🎉 SUCESSO! Transcript encontrado!')
    console.log(`📊 Total de itens: ${result.length}`)
    console.log(`⏱️ Duração total aproximada: ${result[result.length - 1]?.start || 0} segundos`)
  } else {
    console.log('\n❌ FALHA: Transcript não encontrado')
  }
}

testUserVideo()
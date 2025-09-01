const { TranscriptClient } = require('youtube-transcript-api')

async function testTranscriptApi(videoId) {
  try {
    console.log(`\n🔍 Testando youtube-transcript-api para vídeo: ${videoId}`)

    // Instancia o cliente corretamente
    const client = new TranscriptClient()
    console.log('📚 Cliente instanciado com sucesso')

    try {
      console.log('🎯 Buscando transcript...')
      const transcript = await client.getTranscript(videoId)
      console.log(`📊 Transcript encontrado: ${transcript?.length || 0} itens`)

      if (transcript && transcript.length > 0) {
        console.log(`📝 Primeiro item: "${transcript[0]?.text?.substring(0, 50)}..."`)
        console.log(`📝 Último item: "${transcript[transcript.length - 1]?.text?.substring(0, 50)}..."`)
      }

      return transcript
    } catch (error) {
      console.log('❌ Busca falhou:', error.message)

      // Tenta com português
      try {
        console.log('🌍 Tentando português...')
        const transcript = await client.getTranscript(videoId, { lang: 'pt' })
        console.log(`📊 Transcript em português: ${transcript?.length || 0} itens`)
        return transcript
      } catch (ptError) {
        console.log('❌ Português falhou:', ptError.message)
      }

      // Tenta com inglês
      try {
        console.log('🌍 Tentando inglês...')
        const transcript = await client.getTranscript(videoId, { lang: 'en' })
        console.log(`📊 Transcript em inglês: ${transcript?.length || 0} itens`)
        return transcript
      } catch (enError) {
        console.log('❌ Inglês falhou:', enError.message)
      }
    }

    console.log('❌ Todas as tentativas falharam')
    return null

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    return null
  }
}

// Teste com o vídeo específico do usuário
async function testUserVideo() {
  console.log('🎯 Testando vídeo específico do usuário: vtQUM0k1WIY')
  const result = await testTranscriptApi('vtQUM0k1WIY')

  if (result) {
    console.log('\n🎉 SUCESSO! Transcript encontrado!')
    console.log(`📊 Total de itens: ${result.length}`)
    console.log(`⏱️ Duração total aproximada: ${result[result.length - 1]?.offset || 0} segundos`)
  } else {
    console.log('\n❌ FALHA: Transcript não encontrado')
  }
}

testUserVideo()
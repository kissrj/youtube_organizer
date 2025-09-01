import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript(videoUrl) {
  try {
    console.log(`🎯 Testando transcript para: ${videoUrl}`);

    // Tenta português brasileiro primeiro
    try {
      console.log('🌍 Tentando português brasileiro (pt-BR)...');
      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
        lang: 'pt-BR'
      });

      console.log(`📊 Transcript pt-BR: ${transcript.length} itens`);

      if (transcript.length === 0) {
        console.log('⚠️ pt-BR retornou vazio, tentando inglês...');
        throw new Error('Transcript pt-BR vazio');
      }

      console.log(`✅ Transcript encontrado em pt-BR! ${transcript.length} itens`);

      transcript.forEach((item, index) => {
        if (index < 5) { // Mostra apenas os primeiros 5 itens
          console.log(`${item.offset}s: ${item.text}`);
        }
      });

      if (transcript.length > 5) {
        console.log(`... e mais ${transcript.length - 5} itens`);
      }

      return transcript;
    } catch (ptBrError) {
      console.log('❌ pt-BR falhou ou vazio, tentando inglês...');

      // Fallback para inglês
      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
        lang: 'en'
      });

      console.log(`📊 Transcript inglês: ${transcript.length} itens`);

      if (transcript.length === 0) {
        console.log('⚠️ Inglês também retornou vazio');
        return null;
      }

      console.log(`✅ Transcript encontrado em inglês! ${transcript.length} itens`);

      transcript.forEach((item, index) => {
        if (index < 5) { // Mostra apenas os primeiros 5 itens
          console.log(`${item.offset}s: ${item.text}`);
        }
      });

      if (transcript.length > 5) {
        console.log(`... e mais ${transcript.length - 5} itens`);
      }

      return transcript;
    }
  } catch (error) {
    console.error("❌ Erro ao buscar transcript:", error.message);
    return null;
  }
}

// Teste com vídeos que têm transcript
console.log('🚀 Testando código do usuário com vídeos que têm transcript...\n');

// Vídeos conhecidos por terem transcript
const testVideos = [
  'dQw4w9WgXcQ', // Rick Roll (nosso teste anterior)
  '-moW9jvvMr4', // TED Talk (já testado na aplicação)
  '9bZkp7q19f0', // Outro TED Talk
];

for (const videoId of testVideos) {
  console.log(`\n🎬 Testando vídeo: ${videoId}`);
  await getTranscript(videoId);
}
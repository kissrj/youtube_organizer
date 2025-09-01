import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AISummaryOptions {
  maxLength?: number
  language?: string
  includeTimestamps?: boolean
  focusAreas?: string[]
}

/**
 * Gera um resumo inteligente de um transcript usando OpenAI
 */
export async function generateTranscriptSummary(
  transcript: string,
  options: AISummaryOptions = {}
): Promise<string> {
  const {
    maxLength = 500,
    language = 'pt-BR',
    includeTimestamps = false,
    focusAreas = []
  } = options

  try {
    const systemPrompt = `Você é um especialista em criar resumos concisos e informativos de transcripts de vídeos do YouTube.

INSTRUÇÕES:
- Crie um resumo objetivo e bem estruturado
- Foque nos pontos principais e insights valiosos
- Mantenha um tom profissional e educativo
- Use linguagem clara e acessível
- Organize o conteúdo em seções quando apropriado
${focusAreas.length > 0 ? `- Dê atenção especial para: ${focusAreas.join(', ')}` : ''}
${includeTimestamps ? '- Inclua referências de tempo quando relevante' : ''}
- Limite o resumo a aproximadamente ${maxLength} palavras
- Responda em ${language === 'pt-BR' ? 'português brasileiro' : 'inglês'}`

    const userPrompt = `Por favor, crie um resumo inteligente deste transcript de vídeo:

TRANSCRIPT:
${transcript}

INSTRUÇÕES ESPECÍFICAS:
- Identifique os tópicos principais discutidos
- Destaque insights, dicas ou informações valiosas
- Mantenha a estrutura lógica do conteúdo original
- Foque em informações acionáveis e práticas`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: Math.min(maxLength * 2, 2000), // limite de tokens
      temperature: 0.3, // criatividade moderada
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const summary = response.choices[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('Não foi possível gerar o resumo')
    }

    return summary

  } catch (error) {
    console.error('Erro ao gerar resumo com IA:', error)

    // Fallback: resumo básico se a IA falhar
    return generateBasicSummary(transcript, maxLength)
  }
}

/**
 * Gera um resumo básico como fallback
 */
function generateBasicSummary(transcript: string, maxLength: number): string {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const importantSentences = sentences.slice(0, 5) // primeiras 5 sentenças

  let summary = importantSentences.join('. ').trim()

  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...'
  }

  return `Resumo automático: ${summary}`
}

/**
 * Gera resumos para múltiplos vídeos em lote
 */
export async function generateBatchSummaries(
  transcripts: Array<{ videoId: string; transcript: string }>,
  options: AISummaryOptions = {}
): Promise<Array<{ videoId: string; summary: string; success: boolean }>> {
  const results = []

  for (const item of transcripts) {
    try {
      const summary = await generateTranscriptSummary(item.transcript, options)
      results.push({
        videoId: item.videoId,
        summary,
        success: true
      })

      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`Erro ao gerar resumo para vídeo ${item.videoId}:`, error)
      results.push({
        videoId: item.videoId,
        summary: generateBasicSummary(item.transcript, options.maxLength || 500),
        success: false
      })
    }
  }

  return results
}

/**
 * Analisa o sentimento e tom do transcript
 */
export async function analyzeTranscriptSentiment(transcript: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  keywords: string[]
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Analise o sentimento e extraia palavras-chave deste transcript.
          Responda apenas com um JSON válido no formato:
          {
            "sentiment": "positive|negative|neutral",
            "confidence": 0.0-1.0,
            "keywords": ["palavra1", "palavra2", ...]
          }`
        },
        {
          role: 'user',
          content: `Transcript: ${transcript.substring(0, 2000)}` // limita tamanho
        }
      ],
      max_tokens: 200,
      temperature: 0.2,
    })

    const result = response.choices[0]?.message?.content
    if (result) {
      return JSON.parse(result)
    }

  } catch (error) {
    console.error('Erro ao analisar sentimento:', error)
  }

  // Fallback
  return {
    sentiment: 'neutral',
    confidence: 0.5,
    keywords: []
  }
}

/**
 * Identifica tópicos principais do transcript
 */
export async function extractTopics(transcript: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Identifique os principais tópicos discutidos neste transcript.
          Liste apenas os tópicos mais importantes (máximo 5).
          Responda apenas com uma lista JSON de strings.`
        },
        {
          role: 'user',
          content: `Transcript: ${transcript.substring(0, 1500)}`
        }
      ],
      max_tokens: 100,
      temperature: 0.2,
    })

    const result = response.choices[0]?.message?.content
    if (result) {
      return JSON.parse(result)
    }

  } catch (error) {
    console.error('Erro ao extrair tópicos:', error)
  }

  return []
}

/**
 * Verifica se a API do OpenAI está configurada corretamente
 */
export async function validateOpenAIConfig(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5,
    })
    return true
  } catch (error) {
    console.error('Erro na configuração do OpenAI:', error)
    return false
  }
}
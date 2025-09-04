import OpenAI from 'openai';

export class OpenRouterService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }

  async analyzeVideoContent(title: string, description: string) {
    const prompt = `
Analise o seguinte conteúdo de vídeo e forneça uma análise estruturada:

Título: ${title}
Descrição: ${description || 'Sem descrição disponível'}

Forneça uma resposta JSON com:
{
  "keywords": ["palavra1", "palavra2", ...],
  "topics": ["tópico1", "tópico2", ...],
  "sentiment": "positive|negative|neutral",
  "complexity": "beginner|intermediate|advanced",
  "contentType": "tutorial|review|entertainment|educational|other"
}

Foque em:
- Palavras-chave relevantes (máximo 10)
- Tópicos principais (máximo 5)
- Análise de sentimento baseada no conteúdo
- Nível de complexidade
- Tipo de conteúdo
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia do OpenRouter');

      // Tentar fazer parse do JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: criar análise básica
      return {
        keywords: this.extractKeywords(title + ' ' + (description || '')),
        topics: ['geral'],
        sentiment: 'neutral',
        complexity: 'intermediate',
        contentType: 'other'
      };
    } catch (error) {
      console.warn('Erro no OpenRouter, usando análise básica:', error);
      return {
        keywords: this.extractKeywords(title + ' ' + (description || '')),
        topics: ['geral'],
        sentiment: 'neutral',
        complexity: 'intermediate',
        contentType: 'other'
      };
    }
  }

  async generateTags(title: string, description: string, existingTags: string[] = []) {
    const prompt = `
Com base no título e descrição abaixo, sugira tags relevantes para organização de vídeos.
Considere tags já existentes para evitar duplicatas.

Título: ${title}
Descrição: ${description || 'Sem descrição'}
Tags existentes: ${existingTags.join(', ') || 'Nenhuma'}

Gere 5-8 tags novas e relevantes, considerando:
- Assunto principal do vídeo
- Nível de dificuldade (iniciante, intermediário, avançado)
- Tipo de conteúdo (tutorial, review, entretenimento, etc.)
- Público-alvo
- Tecnologia ou ferramentas mencionadas

Responda apenas com as tags separadas por vírgula.
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      return content.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 8);
    } catch (error) {
      console.warn('Erro ao gerar tags:', error);
      return this.extractKeywords(title + ' ' + (description || '')).slice(0, 5);
    }
  }

  private extractKeywords(text: string): string[] {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const words = cleanText.split(' ').filter(word => word.length > 0);

    const stopWords = ['o', 'a', 'e', 'é', 'um', 'uma', 'para', 'com', 'sem', 'por', 'que', 'de', 'do', 'da', 'em', 'no', 'na', 'os', 'as', 'dos', 'das', 'como', 'mais', 'mas', 'ou', 'se', 'quando', 'então'];

    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 10);
  }
}
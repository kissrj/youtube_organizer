// Script de teste para validação de nomes de tags
// Execute com: node test-tags-validation.js

// Simulação da classe TagValidator (versão simplificada para teste)
class TagValidator {
  static get STOP_WORDS() {
    return new Set([
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
      'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
      'por', 'para', 'com', 'sem', 'sob', 'sobre', 'até',
      'e', 'ou', 'mas', 'que', 'como', 'se', 'quando', 'onde',
      'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
      'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo',
      'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 'meu', 'minha',
      'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa', 'vosso', 'vossa',
      'muito', 'pouco', 'mais', 'menos', 'muito', 'pouco', 'tanto', 'quanto',
      'todo', 'toda', 'todos', 'todas', 'algum', 'alguma', 'nenhum', 'nenhuma',
      'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas',
      'tal', 'tais', 'qual', 'quais', 'quanto', 'quanta', 'quantos', 'quantas'
    ]);
  }

  static get SPECIAL_CHARS_REGEX() {
    return /[^\w\s\-]/g;
  }

  static get ONLY_NUMBERS_REGEX() {
    return /^\d+$/;
  }

  static get ONLY_SPECIAL_REGEX() {
    return /^[^\w\s]+$/;
  }

  static sanitizeTagName(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    // 1. Trim e normalizar espaços
    let sanitized = name.trim().replace(/\s+/g, ' ');

    // 2. Remover caracteres especiais estranhos
    sanitized = sanitized.replace(this.SPECIAL_CHARS_REGEX, '');

    // 3. Trim novamente
    sanitized = sanitized.trim();

    // 4. Verificar se ficou vazio
    if (!sanitized) {
      return null;
    }

    // 5. Verificar se é apenas números
    if (this.ONLY_NUMBERS_REGEX.test(sanitized)) {
      return null;
    }

    // 6. Verificar se é apenas caracteres especiais
    if (this.ONLY_SPECIAL_REGEX.test(sanitized)) {
      return null;
    }

    // 7. Verificar comprimento
    if (sanitized.length < 2 || sanitized.length > 50) {
      return null;
    }

    // 8. Verificar se é uma stop word única
    const words = sanitized.toLowerCase().split(' ');
    if (words.length === 1 && this.STOP_WORDS.has(words[0])) {
      return null;
    }

    // 9. Capitalizar primeira letra de cada palavra (Title Case)
    sanitized = sanitized.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return sanitized;
  }

  static sanitizeTagNames(names) {
    return names
      .map(name => this.sanitizeTagName(name))
      .filter(name => name !== null)
      .filter((name, index, arr) => arr.indexOf(name) === index);
  }
}

// Testes
console.log('🧪 TESTE DE VALIDAÇÃO DE NOMES DE TAGS');
console.log('=' .repeat(50));

const testCases = [
  // Casos válidos
  { input: 'tecnologia', expected: 'Tecnologia', description: 'Palavra simples válida' },
  { input: 'machine learning', expected: 'Machine Learning', description: 'Frase válida' },
  { input: 'Python Programming', expected: 'Python Programming', description: 'Já capitalizado' },
  { input: '  data science  ', expected: 'Data Science', description: 'Com espaços extras' },
  { input: 'web-development', expected: 'Web-Development', description: 'Com hífen' },

  // Casos inválidos
  { input: 'a', expected: null, description: 'Muito curto' },
  { input: 'o', expected: null, description: 'Stop word' },
  { input: '123', expected: null, description: 'Apenas números' },
  { input: '@#$%', expected: null, description: 'Apenas caracteres especiais' },
  { input: '', expected: null, description: 'Vazio' },
  { input: 'a'.repeat(51), expected: null, description: 'Muito longo' },
  { input: 'vídeo@#$%teste', expected: 'Vídeo Teste', description: 'Com caracteres especiais - será sanitizado' },
  { input: 'TESTE GRITANDO', expected: 'Teste Gritando', description: 'Tudo maiúsculo - será normalizado' },
];

console.log('\n✅ TESTES INDIVIDUAIS:');
testCases.forEach((test, index) => {
  const result = TagValidator.sanitizeTagName(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} ${index + 1}. "${test.input}" → "${result}" (${test.description})`);
  if (result !== test.expected) {
    console.log(`   Esperado: "${test.expected}", Obtido: "${result}"`);
  }
});

console.log('\n🔄 TESTE DE MÚLTIPLAS TAGS:');
const multipleTagsInput = [
  'tecnologia',
  'python',
  'machine learning',
  'a', // inválido
  'o', // inválido
  '123', // inválido
  '@#$%', // inválido
  'web development',
  'data science',
  'tecnologia', // duplicata
];

const multipleTagsResult = TagValidator.sanitizeTagNames(multipleTagsInput);
console.log('Input:', multipleTagsInput);
console.log('Output:', multipleTagsResult);
console.log(`Removidos: ${multipleTagsInput.length - multipleTagsResult.length} itens inválidos/duplicados`);

console.log('\n📊 RESUMO:');
console.log(`- Tags válidas processadas: ${multipleTagsResult.length}`);
console.log(`- Tags inválidas removidas: ${multipleTagsInput.length - multipleTagsResult.length}`);
console.log(`- Taxa de sucesso: ${((multipleTagsResult.length / multipleTagsInput.length) * 100).toFixed(1)}%`);

console.log('\n🎯 EXEMPLOS DE TAGS VÁLIDAS GERADAS:');
multipleTagsResult.forEach((tag, index) => {
  console.log(`${index + 1}. ${tag}`);
});

console.log('\n✨ VALIDAÇÃO CONCLUÍDA!');
console.log('O sistema garante que apenas tags com nomes apropriados sejam criadas.');
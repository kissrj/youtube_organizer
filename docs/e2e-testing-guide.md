# 🌐 Guia de Testes E2E - YouTube Organizer

## Visão Geral

Este guia fornece instruções completas para executar testes end-to-end (E2E) no YouTube Organizer usando Playwright. Os testes E2E simulam interações reais do usuário, garantindo que toda a aplicação funcione corretamente do ponto de vista do usuário final.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

#### Software Necessário
- **Node.js 18+**
- **npm ou yarn**
- **Git**
- **VS Code** (recomendado)

#### Dependências do Projeto
```bash
npm install
# ou
yarn install
```

#### Instalação do Playwright
```bash
# Instalar Playwright e navegadores
npx playwright install

# Instalar dependências do sistema (Linux)
npx playwright install-deps
```

### Configuração do Ambiente de Teste

#### Variáveis de Ambiente
Crie um arquivo `.env.test` na raiz do projeto:

```env
# Base URL da aplicação
BASE_URL=http://localhost:3000

# Credenciais de teste
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# YouTube API (opcional para testes)
YOUTUBE_API_KEY=your-test-api-key

# OpenAI API (opcional)
OPENAI_API_KEY=your-test-openai-key
```

#### Banco de Dados de Teste
```bash
# Configurar banco SQLite para testes
cp .env.example .env.test
# Editar DATABASE_URL para apontar para banco de teste
```

## 🚀 Executando Testes

### Comandos Básicos

#### Executar Todos os Testes E2E
```bash
npm run test:e2e
```

#### Executar Testes em Navegador Específico
```bash
# Chromium (Chrome)
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari (WebKit)
npx playwright test --project=webkit
```

#### Executar Teste Específico
```bash
# Por arquivo
npx playwright test collections-flow.test.ts

# Por padrão de nome
npx playwright test --grep "create and manage"
```

#### Modo Interativo (Debug)
```bash
# Abrir interface visual do Playwright
npx playwright test --ui

# Executar em modo debug
npx playwright test --debug
```

### Opções Avançadas

#### Executar com Relatório HTML
```bash
npx playwright test --reporter=html
# Abre relatório automaticamente
npx playwright show-report
```

#### Executar em Paralelo
```bash
# Usar todos os núcleos disponíveis
npx playwright test --workers=4

# Executar sequencialmente
npx playwright test --workers=1
```

#### Executar com Screenshots
```bash
# Sempre tirar screenshots em falhas
npx playwright test --screenshot=only-on-failure

# Tirar screenshots de todos os steps
npx playwright test --screenshot=on
```

## 📁 Estrutura dos Testes

```
__tests__/
├── e2e/
│   ├── global-setup.ts          # Configuração global
│   ├── global-teardown.ts       # Limpeza global
│   ├── auth-flow.test.ts        # Testes de autenticação
│   ├── collections-flow.test.ts # Testes de coleções
│   ├── feeds-flow.test.ts       # Testes de feeds
│   ├── notifications-flow.test.ts # Testes de notificações
│   ├── videos-flow.test.ts      # Testes de vídeos
│   └── utils/                   # Utilitários de teste
│       ├── test-helpers.ts
│       ├── api-helpers.ts
│       └── data-generators.ts
```

## 🔧 Utilitários de Teste

### Helpers de Autenticação

```typescript
// __tests__/e2e/utils/auth-helpers.ts
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL('/dashboard');
}

export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout"]');
  await page.waitForURL('/auth/signin');
}

export async function createTestUser() {
  // Lógica para criar usuário de teste via API
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    })
  });
  return response.json();
}
```

### Helpers de Coleções

```typescript
// __tests__/e2e/utils/collection-helpers.ts
export async function createTestCollection(page: Page, name: string, options = {}) {
  await page.click('[data-testid="create-collection"]');
  await page.fill('[data-testid="collection-name"]', name);

  if (options.description) {
    await page.fill('[data-testid="collection-description"]', options.description);
  }

  if (options.isPublic) {
    await page.check('[data-testid="collection-public"]');
  }

  await page.click('[data-testid="save-collection"]');
  await page.waitForSelector(`[data-testid="collection-title"]:has-text("${name}")`);
}

export async function addVideoToCollection(page: Page, videoUrl: string, collectionName: string) {
  // Abrir modal de adicionar vídeo
  await page.click('[data-testid="add-video"]');

  // Inserir URL
  await page.fill('[data-testid="video-url"]', videoUrl);
  await page.click('[data-testid="load-video"]');

  // Aguardar carregamento dos metadados
  await page.waitForSelector('[data-testid="video-preview"]');

  // Selecionar coleção
  await page.selectOption('[data-testid="collection-select"]', collectionName);

  // Confirmar
  await page.click('[data-testid="add-to-collection"]');
  await page.waitForSelector('[data-testid="success-message"]');
}

export async function deleteTestCollection(page: Page, name: string) {
  await page.click(`[data-testid="collection-menu-${name}"]`);
  await page.click('[data-testid="delete-collection"]');
  await page.click('[data-testid="confirm-delete"]');
  await page.waitForSelector(`[data-testid="collection-title"]:has-text("${name}")`, { state: 'hidden' });
}
```

### Generators de Dados

```typescript
// __tests__/e2e/utils/data-generators.ts
export function generateTestCollectionName() {
  return `Test Collection ${Date.now()}`;
}

export function generateTestVideoUrls(count: number = 5) {
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // Gangnam Style
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Despacito
    'https://www.youtube.com/watch?v=JGwWNGJdvx8', // Shape of You
  ];

  return testUrls.slice(0, count);
}

export function generateTestUserData() {
  return {
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };
}
```

## 📝 Escrevendo Testes E2E

### Estrutura Básica de um Teste

```typescript
// __tests__/e2e/collections-flow.test.ts
import { test, expect } from '@playwright/test';
import { loginUser, createTestCollection, addVideoToCollection } from './utils/test-helpers';

test.describe('Collections Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await loginUser(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
  });

  test('should create and manage collections', async ({ page }) => {
    // Arrange
    const collectionName = `Test Collection ${Date.now()}`;

    // Act: Criar coleção
    await createTestCollection(page, collectionName, {
      description: 'Test collection for E2E testing',
      isPublic: false
    });

    // Assert: Verificar criação
    await expect(page.locator('[data-testid="collection-title"]')).toContainText(collectionName);
    await expect(page.locator('[data-testid="collection-description"]')).toContainText('Test collection for E2E testing');

    // Act: Adicionar vídeo
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    await addVideoToCollection(page, videoUrl, collectionName);

    // Assert: Verificar vídeo na coleção
    await expect(page.locator('[data-testid="collection-video"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-title"]')).toContainText('Rick Astley');

    // Cleanup
    await page.click('[data-testid="delete-collection"]');
    await page.click('[data-testid="confirm-delete"]');
  });

  test('should handle collection search and filtering', async ({ page }) => {
    // Arrange: Criar múltiplas coleções
    await createTestCollection(page, 'React Collection');
    await createTestCollection(page, 'Vue Collection');
    await createTestCollection(page, 'Angular Collection');

    // Act: Pesquisar
    await page.fill('[data-testid="search-collections"]', 'React');
    await page.click('[data-testid="search-button"]');

    // Assert: Apenas coleção React deve aparecer
    await expect(page.locator('[data-testid="collection-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('React Collection');

    // Cleanup
    const collections = page.locator('[data-testid="collection-item"]');
    const count = await collections.count();
    for (let i = 0; i < count; i++) {
      await collections.nth(i).click();
      await page.click('[data-testid="delete-collection"]');
      await page.click('[data-testid="confirm-delete"]');
    }
  });
});
```

### Padrões de Teste Recomendados

#### 1. Teste de Jornada Completa
```typescript
test('should complete full user journey', async ({ page }) => {
  // 1. Login
  await loginUser(page, email, password);

  // 2. Criar coleção
  await createTestCollection(page, 'My Journey Collection');

  // 3. Adicionar vídeos
  await addVideoToCollection(page, videoUrl1);
  await addVideoToCollection(page, videoUrl2);

  // 4. Organizar conteúdo
  await page.click('[data-testid="organize-videos"]');
  await page.dragAndDrop('[data-testid="video-1"]', '[data-testid="drop-zone"]');

  // 5. Compartilhar coleção
  await page.click('[data-testid="share-collection"]');
  await page.check('[data-testid="public-share"]');
  await page.click('[data-testid="generate-link"]');

  // 6. Verificar compartilhamento
  const shareLink = await page.locator('[data-testid="share-link"]').inputValue();
  expect(shareLink).toBeTruthy();

  // 7. Logout
  await logoutUser(page);
});
```

#### 2. Teste de Funcionalidade Específica
```typescript
test('should handle bulk video operations', async ({ page }) => {
  // Arrange
  await loginUser(page, email, password);
  await createTestCollection(page, 'Bulk Test Collection');

  // Act
  await page.click('[data-testid="bulk-add-mode"]');

  // Adicionar múltiplas URLs
  const videoUrls = [
    'https://www.youtube.com/watch?v=video1',
    'https://www.youtube.com/watch?v=video2',
    'https://www.youtube.com/watch?v=video3'
  ];

  for (const url of videoUrls) {
    await page.fill('[data-testid="bulk-url-input"]', url);
    await page.click('[data-testid="add-url"]');
  }

  await page.click('[data-testid="bulk-add-confirm"]');

  // Assert
  await expect(page.locator('[data-testid="collection-video"]')).toHaveCount(3);
});
```

#### 3. Teste de Responsividade
```typescript
test('should work on mobile viewport', async ({ page }) => {
  // Configurar viewport mobile
  await page.setViewportSize({ width: 375, height: 667 });

  await loginUser(page, email, password);

  // Verificar menu mobile
  await page.click('[data-testid="mobile-menu"]');
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

  // Testar funcionalidade em mobile
  await page.click('[data-testid="create-collection-mobile"]');
  await expect(page.locator('[data-testid="collection-form"]')).toBeVisible();
});
```

## 🔍 Debugging de Testes

### Técnicas de Debug

#### 1. Screenshots e Videos
```typescript
test('debug test with screenshots', async ({ page }) => {
  await page.goto('/');

  // Tirar screenshot
  await page.screenshot({ path: 'debug-screenshot.png' });

  // Continuar teste...
});
```

#### 2. Pause e Step-through
```typescript
test('debug with pause', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pausa execução para debug manual

  // Código continua após interação manual
});
```

#### 3. Console Logs
```typescript
test('debug with console logs', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('/');
  // Logs da página serão mostrados no console
});
```

#### 4. Network Monitoring
```typescript
test('debug network requests', async ({ page }) => {
  page.on('request', request =>
    console.log('Request:', request.method(), request.url())
  );

  page.on('response', response =>
    console.log('Response:', response.status(), response.url())
  );

  await page.goto('/');
});
```

### Debugging com VS Code

#### Configuração do Launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📊 Relatórios e Análise

### Tipos de Relatório

#### 1. Relatório HTML
```bash
npx playwright test --reporter=html
npx playwright show-report
```

#### 2. Relatório JUnit (para CI/CD)
```bash
npx playwright test --reporter=junit
```

#### 3. Relatório JSON
```bash
npx playwright test --reporter=json
```

### Análise de Resultados

#### Métricas Importantes
- **Taxa de sucesso**: Percentual de testes que passam
- **Tempo médio de execução**: Performance dos testes
- **Flaky tests**: Testes que falham intermitentemente
- **Cobertura de cenários**: Quão bem os testes cobrem funcionalidades

#### Identificando Problemas
```typescript
// Teste flaky - pode falhar aleatoriamente
test('flaky test example', async ({ page }) => {
  // Este teste pode falhar devido a timing
  await page.click('[data-testid="async-button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});

// Solução: Adicionar waits apropriados
test('stable test example', async ({ page }) => {
  await page.click('[data-testid="async-button"]');
  await page.waitForSelector('[data-testid="result"]', { timeout: 10000 });
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

## 🚀 Integração com CI/CD

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Configuração para Diferentes Ambientes

```typescript
// playwright.config.ts
const config = {
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  projects: [
    {
      name: 'staging',
      use: {
        baseURL: 'https://staging.youtube-organizer.com',
      },
    },
    {
      name: 'production',
      use: {
        baseURL: 'https://youtube-organizer.com',
      },
    },
  ],
};
```

## 🎯 Boas Práticas

### Princípios Gerais
1. **Teste jornadas completas do usuário**
2. **Use seletores estáveis (data-testid)**
3. **Evite sleeps, use waits apropriados**
4. **Limpe dados de teste após execução**
5. **Mantenha testes independentes**

### Estrutura de Teste
```typescript
test.describe('Feature Name', () => {
  test.beforeAll(async () => {
    // Setup global (ex: criar usuário de teste)
  });

  test.beforeEach(async ({ page }) => {
    // Setup por teste (ex: login)
  });

  test.afterEach(async ({ page }) => {
    // Cleanup por teste
  });

  test.afterAll(async () => {
    // Cleanup global
  });

  test('should do something', async ({ page }) => {
    // Teste específico
  });
});
```

### Padrões de Seletores
```typescript
// ✅ Bom - Usar data-testid
await page.click('[data-testid="create-collection"]');

// ❌ Ruim - Dependente de CSS
await page.click('.btn-primary');

// ❌ Ruim - Dependente de texto
await page.click('text=Criar Coleção');
```

### Tratamento de Timing
```typescript
// ✅ Bom - Wait específico
await page.waitForSelector('[data-testid="result"]');

// ❌ Ruim - Sleep arbitrário
await page.waitForTimeout(5000);

// ✅ Bom - Wait por condição
await expect(page.locator('[data-testid="loading"]')).toBeHidden();
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Testes Falham Intermitentemente
**Causas possíveis:**
- Timing issues
- Estado não limpo entre testes
- Dependências de rede

**Soluções:**
```typescript
// Adicionar retries
test('flaky test', async ({ page }) => {
  // Lógica do teste
}).retries(3);

// Adicionar waits mais robustos
await page.waitForLoadState('networkidle');
```

#### Elementos Não Encontrados
**Verificações:**
1. O seletor está correto?
2. O elemento está em iframe?
3. Há loading states?

**Solução:**
```typescript
// Verificar se elemento existe
const element = page.locator('[data-testid="element"]');
await expect(element).toBeVisible();

// Para iframes
const frame = page.frameLocator('iframe');
await frame.locator('[data-testid="element"]').click();
```

#### Navegador Não Inicia
**Verificações:**
1. Playwright instalado corretamente?
2. Dependências do sistema instaladas?
3. Porta 3000 livre?

**Solução:**
```bash
# Reinstalar Playwright
npx playwright install --force

# Instalar dependências
npx playwright install-deps
```

## 📈 Métricas e Monitoramento

### Monitorando Qualidade dos Testes

#### 1. Taxa de Sucesso
```bash
# Verificar taxa de sucesso geral
npx playwright test --reporter=json | jq '.stats.expected'
```

#### 2. Tempo de Execução
```bash
# Medir tempo dos testes
time npm run test:e2e
```

#### 3. Cobertura de Cenários
- Manter lista de cenários críticos cobertos
- Revisar cobertura periodicamente
- Adicionar testes para novas funcionalidades

### Alertas e Notificações

#### Slack Integration
```yaml
# .github/workflows/e2e.yml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'E2E tests failed'
```

#### Dashboard de Métricas
- Tempo médio de execução
- Taxa de sucesso por suite
- Tendências de falhas
- Cobertura de testes

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Comunidades
- [Playwright Slack](https://playwright.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)

### Ferramentas Úteis
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Codegen](https://playwright.dev/docs/codegen)
- [Playwright Test Runner](https://playwright.dev/docs/test-runner)

---

Seguindo este guia, você terá uma suíte robusta de testes E2E que garante a qualidade e confiabilidade do YouTube Organizer do ponto de vista do usuário final.

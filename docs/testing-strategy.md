# 🧪 Estratégia de Testes - YouTube Organizer

## Visão Geral

Esta documentação descreve a estratégia completa de testes implementada no YouTube Organizer, incluindo testes unitários, de integração, E2E e de performance, com foco em qualidade, manutenibilidade e eficiência.

## 🏗️ Arquitetura de Testes

### Pirâmide de Testes

```
     E2E Tests (Playwright)
         ↑
  Integration Tests (Jest)
         ↑
   Unit Tests (Jest)
         ↑
  Static Analysis (TypeScript, ESLint)
```

### Cobertura Alvo
- **Unit Tests**: 80%+ cobertura de código
- **Integration Tests**: Principais workflows e APIs
- **E2E Tests**: Jornada crítica do usuário
- **Performance Tests**: Benchmarks de performance

## ⚙️ Configuração dos Testes

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/__tests__/(.*)$': '<rootDir>/__tests__/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{ts,tsx}',
    '!src/lib/prisma/schema.prisma',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/__tests__/**/*.{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest'],
  },
  testTimeout: 10000,
};
```

### Jest Setup Global

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from '@/__tests__/mocks/server';

// Mocks globais
jest.mock('next-auth/react');
jest.mock('@prisma/client');
jest.mock('next/navigation');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    // Mock implementations
  },
}));

// MSW para mocks de API
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Configurações adicionais
global.fetch = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  globalSetup: require.resolve('./__tests__/e2e/global-setup'),
  globalTeardown: require.resolve('./__tests__/e2e/global-teardown'),
});
```

## 🧩 Testes Unitários

### Estrutura dos Testes Unitários

```
src/
├── lib/
│   ├── services/
│   │   ├── collections.test.ts
│   │   ├── feeds.test.ts
│   │   ├── notifications.test.ts
│   │   └── videos.test.ts
│   ├── utils/
│   │   ├── formatters.test.ts
│   │   ├── validators.test.ts
│   │   └── api-helpers.test.ts
│   └── hooks/
│       ├── useCollections.test.ts
│       ├── useNotifications.test.ts
│       └── useVideos.test.ts
└── components/
    ├── ui/
    │   ├── Button.test.tsx
    │   ├── Input.test.tsx
    │   └── Modal.test.tsx
    └── forms/
        ├── CollectionForm.test.tsx
        └── VideoSearchForm.test.tsx
```

### Exemplo: Teste de Serviço

```typescript
// src/lib/services/collections.test.ts
import { CollectionsService } from './collections';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');

describe('CollectionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCollection', () => {
    it('should create a collection successfully', async () => {
      // Arrange
      const mockCollection = {
        id: '1',
        name: 'Test Collection',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.collection.create as jest.Mock).mockResolvedValue(mockCollection);

      // Act
      const result = await CollectionsService.createCollection({
        name: 'Test Collection',
        userId: 'user-1',
      });

      // Assert
      expect(result).toEqual(mockCollection);
      expect(prisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Collection',
          userId: 'user-1',
        },
      });
    });

    it('should throw error for invalid input', async () => {
      // Arrange
      const invalidInput = { name: '', userId: 'user-1' };

      // Act & Assert
      await expect(
        CollectionsService.createCollection(invalidInput)
      ).rejects.toThrow('Nome é obrigatório');
    });

    it('should handle database errors', async () => {
      // Arrange
      (prisma.collection.create as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        CollectionsService.createCollection({
          name: 'Test Collection',
          userId: 'user-1',
        })
      ).rejects.toThrow('Falha ao criar coleção');
    });
  });

  describe('getCollections', () => {
    it('should return paginated collections', async () => {
      // Arrange
      const mockCollections = [
        { id: '1', name: 'Collection 1' },
        { id: '2', name: 'Collection 2' },
      ];
      const mockCount = 2;
      (prisma.collection.findMany as jest.Mock).mockResolvedValue(mockCollections);
      (prisma.collection.count as jest.Mock).mockResolvedValue(mockCount);

      // Act
      const result = await CollectionsService.getCollections({
        userId: 'user-1',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.collections).toEqual(mockCollections);
      expect(result.pagination.total).toBe(mockCount);
    });

    it('should apply search filter', async () => {
      // Arrange
      const mockCollections = [{ id: '1', name: 'React Collection' }];
      (prisma.collection.findMany as jest.Mock).mockResolvedValue(mockCollections);
      (prisma.collection.count as jest.Mock).mockResolvedValue(1);

      // Act
      await CollectionsService.getCollections({
        userId: 'user-1',
        search: 'React',
      });

      // Assert
      expect(prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'React', mode: 'insensitive' },
          }),
        })
      );
    });
  });
});
```

### Exemplo: Teste de Componente

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
  });

  it('should apply correct variant classes', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('should render as link when href is provided', () => {
    render(<Button href="/test">Click me</Button>);
    const link = screen.getByRole('link', { name: /click me/i });
    expect(link).toHaveAttribute('href', '/test');
  });
});
```

### Exemplo: Teste de Hook Customizado

```typescript
// src/lib/hooks/useCollections.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useCollections } from './useCollections';
import { CollectionsService } from '@/lib/services/collections';

jest.mock('@/lib/services/collections');

describe('useCollections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load collections on mount', async () => {
    // Arrange
    const mockCollections = [
      { id: '1', name: 'Collection 1' },
      { id: '2', name: 'Collection 2' },
    ];
    (CollectionsService.getCollections as jest.Mock).mockResolvedValue({
      collections: mockCollections,
      pagination: { total: 2, page: 1, limit: 10 },
    });

    // Act
    const { result } = renderHook(() => useCollections());

    // Assert
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.collections).toEqual(mockCollections);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle errors', async () => {
    // Arrange
    (CollectionsService.getCollections as jest.Mock).mockRejectedValue(
      new Error('Failed to load collections')
    );

    // Act
    const { result } = renderHook(() => useCollections());

    // Assert
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load collections');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should refetch when refresh is called', async () => {
    // Arrange
    const mockCollections = [{ id: '1', name: 'Collection 1' }];
    (CollectionsService.getCollections as jest.Mock).mockResolvedValue({
      collections: mockCollections,
      pagination: { total: 1, page: 1, limit: 10 },
    });

    // Act
    const { result } = renderHook(() => useCollections());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset mock
    jest.clearAllMocks();
    (CollectionsService.getCollections as jest.Mock).mockResolvedValue({
      collections: [],
      pagination: { total: 0, page: 1, limit: 10 },
    });

    // Act
    result.current.refresh();

    // Assert
    await waitFor(() => {
      expect(CollectionsService.getCollections).toHaveBeenCalledTimes(2);
    });
  });
});
```

## 🔗 Testes de Integração

### Estrutura dos Testes de Integração

```
__tests__/
├── integration/
│   ├── collections-workflow.test.ts
│   ├── feeds-workflow.test.ts
│   ├── notifications-workflow.test.ts
│   ├── videos-workflow.test.ts
│   ├── api/
│   │   ├── collections.test.ts
│   │   ├── feeds.test.ts
│   │   ├── notifications.test.ts
│   │   └── videos.test.ts
│   └── database/
│       ├── migrations.test.ts
│       └── seed.test.ts
```

### Exemplo: Teste de Workflow Completo

```typescript
// __tests__/integration/collections-workflow.test.ts
import { CollectionsService } from '@/lib/services/collections';
import { VideosService } from '@/lib/services/videos';
import { prisma } from '@/lib/prisma';
import { createTestUser, cleanupTestData } from '@/__tests__/helpers';

describe('Collections Workflow Integration', () => {
  let user: any;
  let collection: any;
  let video: any;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Complete Collection Lifecycle', () => {
    it('should create collection with videos and manage content', async () => {
      // 1. Criar coleção
      collection = await CollectionsService.createCollection({
        name: 'Integration Test Collection',
        description: 'Test collection for integration tests',
        userId: user.id,
      });

      expect(collection.name).toBe('Integration Test Collection');
      expect(collection.userId).toBe(user.id);

      // 2. Sincronizar vídeo do YouTube
      video = await VideosService.syncVideo('dQw4w9WgXcQ'); // Vídeo de teste
      expect(video.youtubeId).toBe('dQw4w9WgXcQ');

      // 3. Adicionar vídeo à coleção
      await CollectionsService.addVideosToCollection(collection.id, [video.id]);

      // 4. Verificar conteúdo da coleção
      const content = await CollectionsService.getCollectionContent(collection.id);
      expect(content.videos).toHaveLength(1);
      expect(content.videos[0].id).toBe(video.id);

      // 5. Buscar coleções
      const searchResults = await CollectionsService.getCollections({
        userId: user.id,
        search: 'Integration Test',
      });
      expect(searchResults.collections).toHaveLength(1);

      // 6. Atualizar coleção
      const updatedCollection = await CollectionsService.updateCollection(collection.id, {
        name: 'Updated Integration Test Collection',
        description: 'Updated description',
      });
      expect(updatedCollection.name).toBe('Updated Integration Test Collection');

      // 7. Remover vídeo da coleção
      await CollectionsService.removeVideosFromCollection(collection.id, [video.id]);
      const updatedContent = await CollectionsService.getCollectionContent(collection.id);
      expect(updatedContent.videos).toHaveLength(0);

      // 8. Excluir coleção
      await CollectionsService.deleteCollection(collection.id);
      await expect(
        CollectionsService.getCollection(collection.id)
      ).rejects.toThrow('Coleção não encontrada');
    });

    it('should handle collection hierarchy', async () => {
      // Criar coleção pai
      const parentCollection = await CollectionsService.createCollection({
        name: 'Parent Collection',
        userId: user.id,
      });

      // Criar coleção filha
      const childCollection = await CollectionsService.createCollection({
        name: 'Child Collection',
        userId: user.id,
        parentId: parentCollection.id,
      });

      // Verificar hierarquia
      const parentContent = await CollectionsService.getCollectionContent(parentCollection.id);
      expect(parentContent.children).toHaveLength(1);
      expect(parentContent.children[0].id).toBe(childCollection.id);

      // Mover coleção
      await CollectionsService.moveCollection(childCollection.id, {
        newParentId: null,
        position: 0,
      });

      const updatedParentContent = await CollectionsService.getCollectionContent(parentCollection.id);
      expect(updatedParentContent.children).toHaveLength(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk video additions', async () => {
      // Criar coleção
      collection = await CollectionsService.createCollection({
        name: 'Bulk Test Collection',
        userId: user.id,
      });

      // Criar múltiplos vídeos
      const videoIds = [];
      for (let i = 0; i < 10; i++) {
        const video = await VideosService.syncVideo(`test-video-${i}`);
        videoIds.push(video.id);
      }

      // Adicionar todos de uma vez
      await CollectionsService.addVideosToCollection(collection.id, videoIds);

      // Verificar
      const content = await CollectionsService.getCollectionContent(collection.id);
      expect(content.videos).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle concurrent modifications', async () => {
      collection = await CollectionsService.createCollection({
        name: 'Concurrency Test Collection',
        userId: user.id,
      });

      // Simular modificações concorrentes
      const promises = Array.from({ length: 5 }, () =>
        CollectionsService.updateCollection(collection.id, {
          name: `Updated by ${Math.random()}`,
        })
      );

      // Pelo menos uma deve passar
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});
```

### Exemplo: Teste de API

```typescript
// __tests__/integration/api/collections.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/collections/route';
import { prisma } from '@/lib/prisma';
import { createTestUser } from '@/__tests__/helpers';

jest.mock('@/lib/prisma');

describe('/api/collections', () => {
  let user: any;

  beforeAll(async () => {
    user = await createTestUser();
  });

  describe('GET /api/collections', () => {
    it('should return user collections', async () => {
      // Arrange
      const mockCollections = [
        { id: '1', name: 'Test Collection', userId: user.id },
      ];
      (prisma.collection.findMany as jest.Mock).mockResolvedValue(mockCollections);
      (prisma.collection.count as jest.Mock).mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' },
      });

      // Mock session
      req.auth = { user: { id: user.id } };

      // Act
      await GET(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.collections).toEqual(mockCollections);
    });

    it('should handle pagination', async () => {
      // Arrange
      const mockCollections = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Collection ${i + 1}`,
        userId: user.id,
      }));
      (prisma.collection.findMany as jest.Mock).mockResolvedValue(mockCollections);
      (prisma.collection.count as jest.Mock).mockResolvedValue(25);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '2', limit: '5' },
      });
      req.auth = { user: { id: user.id } };

      // Act
      await GET(req, res);

      // Assert
      expect(prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });
  });

  describe('POST /api/collections', () => {
    it('should create collection', async () => {
      // Arrange
      const mockCollection = {
        id: '1',
        name: 'New Collection',
        userId: user.id,
      };
      (prisma.collection.create as jest.Mock).mockResolvedValue(mockCollection);

      const { req, res } = createMocks({
        method: 'POST',
        body: { name: 'New Collection' },
      });
      req.auth = { user: { id: user.id } };

      // Act
      await POST(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.collection).toEqual(mockCollection);
    });

    it('should validate input', async () => {
      // Arrange
      const { req, res } = createMocks({
        method: 'POST',
        body: { name: '' },
      });
      req.auth = { user: { id: user.id } };

      // Act
      await POST(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

## 🌐 Testes E2E

### Estrutura dos Testes E2E

```
__tests__/
├── e2e/
│   ├── collections-flow.test.ts
│   ├── feeds-flow.test.ts
│   ├── notifications-flow.test.ts
│   ├── videos-flow.test.ts
│   ├── auth-flow.test.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
```

### Exemplo: Teste E2E Completo

```typescript
// __tests__/e2e/collections-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Collections Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="signin-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create and manage collections', async ({ page }) => {
    // Navegar para coleções
    await page.goto('/collections');
    await expect(page.locator('h1')).toContainText('Minhas Coleções');

    // Criar nova coleção
    await page.click('[data-testid="create-collection"]');
    await expect(page.locator('[data-testid="collection-modal"]')).toBeVisible();

    await page.fill('[data-testid="collection-name"]', 'Minha Coleção de Teste');
    await page.fill('[data-testid="collection-description"]', 'Descrição da coleção de teste');
    await page.click('[data-testid="collection-public"]');
    await page.click('[data-testid="save-collection"]');

    // Verificar criação
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('Minha Coleção de Teste');
    await expect(page.locator('[data-testid="collection-description"]')).toContainText('Descrição da coleção de teste');

    // Adicionar vídeo
    await page.click('[data-testid="add-video"]');
    await page.fill('[data-testid="video-search"]', 'react tutorial');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="video-result"]');
    await page.click('[data-testid="video-result"]:first-child [data-testid="add-to-collection"]');

    // Verificar vídeo na coleção
    await expect(page.locator('[data-testid="collection-video"]')).toBeVisible();

    // Editar coleção
    await page.click('[data-testid="edit-collection"]');
    await page.fill('[data-testid="collection-name"]', 'Coleção Editada');
    await page.click('[data-testid="save-collection"]');

    // Verificar edição
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('Coleção Editada');

    // Excluir coleção
    await page.click('[data-testid="delete-collection"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verificar exclusão
    await expect(page.locator('[data-testid="collection-title"]')).toBeHidden();
  });

  test('should handle collection search and filtering', async ({ page }) => {
    // Criar múltiplas coleções
    await page.goto('/collections');

    for (let i = 1; i <= 3; i++) {
      await page.click('[data-testid="create-collection"]');
      await page.fill('[data-testid="collection-name"]', `Coleção ${i}`);
      await page.click('[data-testid="save-collection"]');
      await page.waitForSelector('[data-testid="collection-list"]');
    }

    // Testar busca
    await page.fill('[data-testid="search-collections"]', 'Coleção 1');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="collection-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('Coleção 1');

    // Limpar busca
    await page.fill('[data-testid="search-collections"]', '');
    await page.click('[data-testid="search-button"]');

    await expect(page.locator('[data-testid="collection-item"]')).toHaveCount(3);
  });

  test('should handle collection hierarchy', async ({ page }) => {
    await page.goto('/collections');

    // Criar coleção pai
    await page.click('[data-testid="create-collection"]');
    await page.fill('[data-testid="collection-name"]', 'Coleção Pai');
    await page.click('[data-testid="save-collection"]');

    // Criar coleção filha
    await page.click('[data-testid="create-collection"]');
    await page.selectOption('[data-testid="parent-collection"]', 'Coleção Pai');
    await page.fill('[data-testid="collection-name"]', 'Coleção Filha');
    await page.click('[data-testid="save-collection"]');

    // Verificar hierarquia
    await expect(page.locator('[data-testid="collection-children"]')).toContainText('Coleção Filha');

    // Expandir/colapsar
    await page.click('[data-testid="toggle-children"]');
    await expect(page.locator('[data-testid="collection-child-item"]')).toBeVisible();

    await page.click('[data-testid="toggle-children"]');
    await expect(page.locator('[data-testid="collection-child-item"]')).toBeHidden();
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/collections');

    // Criar coleção
    await page.click('[data-testid="create-collection"]');
    await page.fill('[data-testid="collection-name"]', 'Coleção em Massa');
    await page.click('[data-testid="save-collection"]');

    // Selecionar múltiplos vídeos
    await page.click('[data-testid="bulk-select-mode"]');

    const videoCheckboxes = page.locator('[data-testid="video-checkbox"]');
    await videoCheckboxes.nth(0).check();
    await videoCheckboxes.nth(1).check();
    await videoCheckboxes.nth(2).check();

    // Adicionar à coleção
    await page.click('[data-testid="bulk-add-to-collection"]');
    await page.selectOption('[data-testid="bulk-collection-select"]', 'Coleção em Massa');
    await page.click('[data-testid="confirm-bulk-add"]');

    // Verificar
    await page.goto('/collections/Coleção em Massa');
    await expect(page.locator('[data-testid="collection-video"]')).toHaveCount(3);
  });
});
```

### Global Setup para E2E

```typescript
// __tests__/e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { createTestUser, cleanupTestData } from '@/__tests__/helpers';

async function globalSetup(config: FullConfig) {
  // Criar usuário de teste
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Criar usuário de teste no banco
    await createTestUser({
      email: 'test@example.com',
      password: 'password123',
    });

    // Fazer login uma vez para estabelecer sessão
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Salvar estado de autenticação
    await page.context().storageState({ path: 'test-results/auth-state.json' });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
```

## ⚡ Testes de Performance

### Estrutura dos Testes de Performance

```
__tests__/
├── performance/
│   ├── collections-performance.test.ts
│   ├── feeds-performance.test.ts
│   ├── videos-performance.test.ts
│   ├── database-performance.test.ts
│   └── benchmark.test.ts
```

### Utilitários de Performance

```typescript
// __tests__/performance/utils.ts
export interface PerformanceResult {
  operation: string;
  duration: number;
  memoryUsage?: number;
  throughput?: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private memoryStart: NodeJS.MemoryUsage | null = null;

  start() {
    this.startTime = Date.now();
    if (typeof process !== 'undefined') {
      this.memoryStart = process.memoryUsage();
    }
  }

  end(operation: string): PerformanceResult {
    const duration = Date.now() - this.startTime;
    let memoryUsage: number | undefined;

    if (this.memoryStart && typeof process !== 'undefined') {
      const memoryEnd = process.memoryUsage();
      memoryUsage = memoryEnd.heapUsed - this.memoryStart.heapUsed;
    }

    return {
      operation,
      duration,
      memoryUsage,
    };
  }
}

export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  iterations: number = 1
): Promise<PerformanceResult[]> {
  const results: PerformanceResult[] = [];
  const monitor = new PerformanceMonitor();

  for (let i = 0; i < iterations; i++) {
    monitor.start();
    await fn();
    results.push(monitor.end(`${operation} - iteration ${i + 1}`));
  }

  return results;
}

export function calculateAverage(results: PerformanceResult[]): number {
  const total = results.reduce((sum, result) => sum + result.duration, 0);
  return total / results.length;
}

export function calculatePercentile(results: PerformanceResult[], percentile: number): number {
  const sorted = results.map(r => r.duration).sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}
```

### Exemplo: Benchmark de Performance

```typescript
// __tests__/performance/benchmark.test.ts
import { CollectionsService } from '@/lib/services/collections';
import { VideosService } from '@/lib/services/videos';
import { measurePerformance, calculateAverage, calculatePercentile } from './utils';
import { createTestUser, cleanupTestData } from '@/__tests__/helpers';

describe('Performance Benchmarks', () => {
  let user: any;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Collections Performance', () => {
    it('should handle collection creation efficiently', async () => {
      const results = await measurePerformance(
        'create-collection',
        async () => {
          const collection = await CollectionsService.createCollection({
            name: `Performance Test Collection ${Date.now()}`,
            userId: user.id,
          });
          return collection;
        },
        100
      );

      const average = calculateAverage(results);
      const p95 = calculatePercentile(results, 95);

      console.log(`Collection Creation - Average: ${average}ms, P95: ${p95}ms`);

      // Assert performance requirements
      expect(average).toBeLessThan(100); // < 100ms average
      expect(p95).toBeLessThan(200); // < 200ms P95
    });

    it('should handle bulk collection queries efficiently', async () => {
      // Criar 1000 coleções para teste
      const createPromises = Array.from({ length: 1000 }, (_, i) =>
        CollectionsService.createCollection({
          name: `Bulk Collection ${i}`,
          userId: user.id,
        })
      );
      await Promise.all(createPromises);

      // Testar busca
      const results = await measurePerformance(
        'bulk-collection-query',
        async () => {
          return await CollectionsService.getCollections({
            userId: user.id,
            page: 1,
            limit: 100,
          });
        },
        50
      );

      const average = calculateAverage(results);
      console.log(`Bulk Query - Average: ${average}ms`);

      expect(average).toBeLessThan(500); // < 500ms para 100 itens
    });

    it('should handle concurrent operations', async () => {
      const concurrentOperations = 50;

      const results = await measurePerformance(
        'concurrent-collections',
        async () => {
          const promises = Array.from({ length: concurrentOperations }, () =>
            CollectionsService.createCollection({
              name: `Concurrent Collection ${Date.now()}-${Math.random()}`,
              userId: user.id,
            })
          );
          return await Promise.all(promises);
        },
        5
      );

      const average = calculateAverage(results);
      console.log(`Concurrent Operations - Average: ${average}ms`);

      expect(average).toBeLessThan(2000); // < 2s para 50 operações concorrentes
    });
  });

  describe('Videos Performance', () => {
    it('should handle video synchronization efficiently', async () => {
      const testVideoIds = [
        'dQw4w9WgXcQ', // Rick Roll
        'jNQXAC9IVRw', // Me at the zoo
        '9bZkp7q19f0', // Gangnam Style
      ];

      const results = await measurePerformance(
        'video-sync',
        async () => {
          const promises = testVideoIds.map(id => VideosService.syncVideo(id));
          return await Promise.all(promises);
        },
        10
      );

      const average = calculateAverage(results);
      console.log(`Video Sync - Average: ${average}ms`);

      expect(average).toBeLessThan(1000); // < 1s para 3 vídeos
    });

    it('should handle video search efficiently', async () => {
      // Criar índice de busca
      const searchTerms = ['react', 'javascript', 'tutorial', 'programming'];

      const results = await measurePerformance(
        'video-search',
        async () => {
          const promises = searchTerms.map(term =>
            VideosService.searchVideos({
              q: term,
              maxResults: 50,
            })
          );
          return await Promise.all(promises);
        },
        20
      );

      const average = calculateAverage(results);
      console.log(`Video Search - Average: ${average}ms`);

      expect(average).toBeLessThan(300); // < 300ms para busca
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks in long-running operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Executar operações pesadas
      for (let i = 0; i < 100; i++) {
        await CollectionsService.createCollection({
          name: `Memory Test ${i}`,
          userId: user.id,
        });

        if (i % 10 === 0) {
          // Forçar garbage collection se disponível
          if (global.gc) {
            global.gc();
          }
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);

      // Memória não deve aumentar mais que 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Performance', () => {
    it('should handle database connections efficiently', async () => {
      const results = await measurePerformance(
        'database-connection',
        async () => {
          // Testar múltiplas conexões simultâneas
          const promises = Array.from({ length: 20 }, () =>
            CollectionsService.getCollections({
              userId: user.id,
              page: 1,
              limit: 10,
            })
          );
          return await Promise.all(promises);
        },
        10
      );

      const average = calculateAverage(results);
      console.log(`Database Connections - Average: ${average}ms`);

      expect(average).toBeLessThan(1000); // < 1s para 20 conexões
    });
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run performance tests
        run: npm run test:performance
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

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

## 📊 Relatórios de Cobertura

### Configuração de Cobertura

```json
// jest.config.js
module.exports = {
  // ... outras configurações
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{ts,tsx}',
    '!src/lib/prisma/schema.prisma',
    '!src/pages/_*.{ts,tsx}',
    '!src/styles/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'cobertura',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/lib/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Scripts de Relatório

```json
// package.json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:coverage:watch": "jest --coverage --watch",
    "test:coverage:report": "jest --coverage --coverageReporters=html",
    "test:badges": "jest --coverage --coverageReporters=json-summary"
  }
}
```

## 🎯 Melhores Práticas

### Princípios Gerais
1. **Teste o comportamento, não a implementação**
2. **Mantenha testes independentes e isolados**
3. **Use nomes descritivos para testes**
4. **Siga o padrão Arrange-Act-Assert**
5. **Teste casos de erro e edge cases**

### Testes Unitários
- Foque em funções puras e lógica de negócio
- Mock dependências externas
- Teste um conceito por teste
- Use factories para dados de teste

### Testes de Integração
- Teste interações entre componentes
- Use banco de dados de teste
- Teste workflows completos
- Limpe dados após testes

### Testes E2E
- Teste jornadas críticas do usuário
- Use dados realistas
- Evite testes frágeis
- Mantenha testes independentes

### Testes de Performance
- Defina baselines de performance
- Teste com dados realistas
- Monitore regressões
- Execute em ambiente controlado

---

Esta estratégia de testes garante qualidade, manutenibilidade e performance do YouTube Organizer, com cobertura abrangente e integração contínua.

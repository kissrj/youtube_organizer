# 🛠️ Guia de Desenvolvimento - YouTube Organizer

## Visão Geral

Este guia fornece instruções completas para configurar o ambiente de desenvolvimento, contribuir com código e seguir as melhores práticas do projeto YouTube Organizer.

## 🚀 Configuração do Ambiente

### Pré-requisitos

#### Sistema Operacional
- **Windows 10/11** (recomendado)
- **macOS 12+**
- **Linux Ubuntu 20.04+**

#### Software Necessário
- **Node.js 18+** - Runtime JavaScript
- **npm 8+** ou **yarn 1.22+** - Gerenciador de pacotes
- **Git 2.30+** - Controle de versão
- **VS Code** - Editor recomendado
- **SQLite 3.35+** - Banco de dados

### Instalação do Node.js

#### Windows (Chocolatey)
```powershell
choco install nodejs
```

#### macOS (Homebrew)
```bash
brew install node
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Clonagem do Repositório

```bash
git clone https://github.com/your-org/youtube-organizer.git
cd youtube-organizer
```

### Instalação de Dependências

```bash
npm install
# ou
yarn install
```

### Configuração do Banco de Dados

#### Instalação do SQLite (Windows)
```powershell
choco install sqlite
```

#### Instalação do SQLite (macOS)
```bash
brew install sqlite
```

#### Instalação do SQLite (Linux)
```bash
sudo apt-get install sqlite3
```

### Configuração das Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"

# OpenAI API (opcional)
OPENAI_API_KEY="your-openai-api-key"

# Redis (opcional - para cache)
REDIS_URL="redis://localhost:6379"

# Sentry (opcional - para monitoramento)
SENTRY_DSN="your-sentry-dsn"
```

### Geração da Chave Secreta NextAuth

```bash
openssl rand -base64 32
```

### Configuração do Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a API do Google+ e YouTube Data API v3
4. Configure as credenciais OAuth 2.0
5. Adicione `http://localhost:3000/api/auth/callback/google` aos URIs de redirecionamento

### Configuração da YouTube API

1. No Google Cloud Console, ative a YouTube Data API v3
2. Crie uma chave de API
3. Configure as restrições da API key

### Inicialização do Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# (Opcional) Popular com dados de exemplo
npx prisma db seed
```

### Inicialização da Aplicação

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   ├── (dashboard)/              # Dashboard principal
│   │   ├── collections/          # Gestão de coleções
│   │   ├── feeds/                # Gestão de feeds
│   │   ├── notifications/        # Centro de notificações
│   │   └── settings/             # Configurações
│   ├── api/                      # API Routes
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Página inicial
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base da UI
│   ├── forms/                    # Formulários
│   ├── modals/                   # Modais e dialogs
│   ├── layout/                   # Componentes de layout
│   └── providers/                # Context providers
├── lib/                          # Utilitários e configurações
│   ├── prisma/                   # Cliente e configurações Prisma
│   ├── auth/                     # Configuração NextAuth
│   ├── services/                 # Serviços da aplicação
│   ├── utils/                    # Funções utilitárias
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # Definições de tipos
│   └── validations/              # Schemas de validação
├── styles/                       # Estilos adicionais
├── __tests__/                    # Testes
│   ├── unit/                     # Testes unitários
│   ├── integration/              # Testes de integração
│   └── e2e/                      # Testes E2E
├── docs/                         # Documentação
├── public/                       # Assets estáticos
├── prisma/                       # Schema do banco de dados
│   ├── schema.prisma             # Definição do schema
│   └── migrations/               # Migrações do banco
├── .github/                      # GitHub Actions
├── .vscode/                      # Configurações VS Code
└── package.json                  # Dependências e scripts
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run preview      # Preview do build
```

### Qualidade de Código
```bash
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run type-check   # Verifica tipos TypeScript
npm run format       # Formata código com Prettier
```

### Testes
```bash
npm run test                 # Executa todos os testes
npm run test:unit            # Testes unitários
npm run test:integration     # Testes de integração
npm run test:e2e             # Testes E2E
npm run test:coverage        # Testes com relatório de cobertura
npm run test:performance     # Testes de performance
```

### Banco de Dados
```bash
npm run db:generate          # Gera cliente Prisma
npm run db:push              # Aplica mudanças no schema
npm run db:migrate           # Cria e executa migração
npm run db:studio            # Abre Prisma Studio
npm run db:seed              # Popula banco com dados de exemplo
npm run db:reset             # Reseta banco de dados
```

### Outros
```bash
npm run clean                # Limpa arquivos de build
npm run analyze              # Análise de bundle
npm run storybook            # Inicia Storybook
npm run docs                 # Gera documentação
```

## 🧪 Estratégia de Testes

### Configuração dos Testes

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

#### Jest Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom';

// Mocks globais
jest.mock('next-auth/react');
jest.mock('@prisma/client');
jest.mock('next/navigation');

// Configurações adicionais
global.fetch = jest.fn();
```

### Tipos de Testes

#### 1. Testes Unitários
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
      const mockCollection = { id: '1', name: 'Test Collection' };
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
  });
});
```

#### 2. Testes de Integração
```typescript
// __tests__/integration/collections-workflow.test.ts
describe('Collections Workflow', () => {
  let user: User;
  let collection: Collection;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should create and manage collection workflow', async () => {
    // Criar coleção
    collection = await CollectionsService.createCollection({
      name: 'Test Collection',
      userId: user.id,
    });

    expect(collection.name).toBe('Test Collection');

    // Adicionar vídeo
    const video = await VideosService.syncVideo('test-youtube-id');
    await CollectionsService.addVideosToCollection(collection.id, [video.id]);

    // Verificar conteúdo
    const content = await CollectionsService.getCollectionContent(collection.id);
    expect(content.videos).toHaveLength(1);
  });
});
```

#### 3. Testes E2E
```typescript
// __tests__/e2e/collections-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Collections Flow', () => {
  test('should create and manage collections', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="signin-button"]');

    // Criar coleção
    await page.goto('/collections');
    await page.click('[data-testid="create-collection"]');
    await page.fill('[data-testid="collection-name"]', 'My Test Collection');
    await page.click('[data-testid="save-collection"]');

    // Verificar criação
    await expect(page.locator('[data-testid="collection-title"]')).toHaveText('My Test Collection');
  });
});
```

### Testes de Performance
```typescript
// __tests__/performance/collections-performance.test.ts
describe('Collections Performance', () => {
  it('should handle bulk operations efficiently', async () => {
    const startTime = Date.now();

    // Criar múltiplas coleções
    const promises = Array.from({ length: 100 }, (_, i) =>
      CollectionsService.createCollection({
        name: `Collection ${i}`,
        userId: 'test-user',
      })
    );

    await Promise.all(promises);
    const endTime = Date.now();

    // Verificar performance (deve ser < 5 segundos)
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

## 🔧 Desenvolvimento com VS Code

### Extensões Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-vscode.test-adapter-converter",
    "prisma.prisma",
    "ms-vscode.vscode-playwright"
  ]
}
```

### Configurações do Workspace
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 📋 Padrões de Código

### TypeScript
- Use `strict` mode
- Defina interfaces para objetos complexos
- Use tipos union quando apropriado
- Prefira `const` assertions para objetos imutáveis

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// ❌ Ruim
interface User {
  id: any;
  name: string;
  email?: string;
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};
```

### React/Next.js
- Use Server Components quando possível
- Use Client Components apenas quando necessário
- Implemente Error Boundaries
- Use custom hooks para lógica reutilizável

```typescript
// ✅ Bom - Server Component
export default function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div>
      {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

// ✅ Bom - Custom Hook
function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections().then(setCollections).finally(() => setLoading(false));
  }, []);

  return { collections, loading };
}
```

### Estilização
- Use Tailwind CSS para consistência
- Siga o design system definido
- Use CSS Modules para estilos específicos
- Mantenha responsividade mobile-first

```typescript
// ✅ Bom
export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 🔄 Fluxo de Desenvolvimento

### 1. Criar Branch
```bash
git checkout -b feature/nome-da-feature
```

### 2. Desenvolver
- Escreva testes primeiro (TDD)
- Mantenha commits pequenos e descritivos
- Use conventional commits

```bash
git commit -m "feat: add collection search functionality"
git commit -m "test: add unit tests for search service"
git commit -m "docs: update API documentation"
```

### 3. Testar
```bash
npm run test:unit
npm run test:integration
npm run lint
npm run type-check
```

### 4. Pull Request
- Crie PR com descrição detalhada
- Aguarde revisão de código
- Faça as correções solicitadas

### 5. Merge
- Squash commits quando apropriado
- Delete branch após merge

## 🚀 Deploy

### Desenvolvimento
```bash
npm run build
npm run start
```

### Produção (Vercel)
1. Conecte repositório no Vercel
2. Configure variáveis de ambiente
3. Deploy automático será feito

### Produção (Docker)
```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔍 Debugging

### Ferramentas
- **React DevTools** - Debugging de componentes
- **Next.js DevTools** - Debugging específico do Next.js
- **Prisma Studio** - Visualização do banco de dados
- **VS Code Debugger** - Debugging integrado

### Logs
```typescript
// Desenvolvimento
console.log('Debug info:', data);

// Produção
import { logger } from '@/lib/logger';
logger.info('User created', { userId: user.id });
```

## 📚 Recursos Adicionais

### Documentação
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Comunidade
- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Slack](https://slack.prisma.io/)
- [Reactiflux Discord](https://www.reactiflux.com/)

### Ferramentas
- [Vercel](https://vercel.com/) - Deploy
- [PlanetScale](https://planetscale.com/) - Banco de dados
- [Sentry](https://sentry.io/) - Monitoramento
- [Linear](https://linear.app/) - Gerenciamento de tarefas

---

Para dúvidas específicas ou problemas, consulte a documentação completa ou abra uma issue no GitHub.

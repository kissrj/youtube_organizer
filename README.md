# 🎬 YouTube Organizer

Um organizador avançado de vídeos do YouTube com player integrado, transcripts automáticos e resumos inteligentes por IA.

## ✨ Funcionalidades Principais

### 🎬 **Modal com Player Avançado**
- Player do YouTube integrado com interface elegante
- Abas para Player, Transcript e Resumo IA
- Controles intuitivos e responsivos
- Informações detalhadas do vídeo

### 📝 **Sistema de Transcript**
- Busca automática de transcripts via YouTube API
- Exibição formatada com timestamps
- Navegação interativa no texto
- Suporte a múltiplos idiomas

### 🤖 **Resumo Inteligente por IA**
- Integração com OpenAI GPT para gerar resumos
- Resumos estruturados e concisos
- Destaques dos pontos principais
- Análise de sentimento e tópicos

### 📥 **Importação de Vídeos**
- Importação automática de playlists do YouTube
- Barra de progresso visual em tempo real
- Tratamento inteligente de duplicatas
- Estatísticas detalhadas de importação

### 🔍 **Sistema de Filtros Avançados**
- Busca por texto (título, canal, descrição, tags)
- Filtros por categoria, tag, período e qualidade
- Ordenação flexível por qualquer campo
- Paginação inteligente

### 📁 **Organização por Categorias e Tags**
- Sistema hierárquico de categorias
- Tags personalizáveis
- Relacionamentos muitos-para-muitos
- Interface de drag-and-drop

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos

### **Backend**
- **Next.js API Routes** - API RESTful
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados local

### **Autenticação**
- **NextAuth.js** - Sistema de autenticação
- **Google OAuth** - Login com Google

### **APIs Externas**
- **YouTube Data API v3** - Dados do YouTube
- **OpenAI API** - Geração de resumos IA
- **Google Translate API** - Tradução (opcional)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Google (para APIs)
- Chave da API do YouTube
- Chave da API do OpenAI (opcional)

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd youtube-organizer
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# YouTube Data API v3
YOUTUBE_API_KEY="your-youtube-api-key-here"

# OpenAI API (para resumos IA)
OPENAI_API_KEY="your-openai-api-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Configure o banco de dados:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Execute o projeto:**
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📖 Como Usar

### **1. Configuração Inicial**
- Configure suas chaves de API no arquivo `.env`
- Faça login com sua conta Google
- Configure suas categorias e tags

### **2. Importar Playlists**
- Na página "Playlists", clique em "Sincronizar Playlist"
- Cole o ID ou URL da playlist do YouTube
- Aguarde a sincronização automática

### **3. Importar Vídeos**
- Na página "Playlists", clique em "Importar Vídeos" em qualquer playlist
- Acompanhe o progresso da importação
- Visualize as estatísticas de importação

### **4. Organizar Vídeos**
- Use categorias para agrupar vídeos por tema
- Adicione tags para classificação granular
- Utilize os filtros avançados para encontrar vídeos

### **5. Assistir e Estudar**
- Clique em "Assistir" em qualquer vídeo
- Use as abas para alternar entre Player, Transcript e Resumo IA
- Navegue pelos timestamps do transcript
- Leia resumos inteligentes gerados por IA

## 🎯 Estrutura do Projeto

```
youtube-organizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── categories/    # CRUD de categorias
│   │   │   ├── tags/          # CRUD de tags
│   │   │   ├── playlists/     # CRUD de playlists
│   │   │   └── videos/        # CRUD de vídeos
│   │   ├── categories/        # Página de categorias
│   │   ├── playlists/         # Página de playlists
│   │   ├── tags/              # Página de tags
│   │   ├── videos/            # Página de vídeos
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Componentes React
│   │   ├── AuthGuard.tsx      # Proteção de rotas
│   │   ├── VideoModal.tsx     # Modal com player
│   │   ├── VideoFilters.tsx   # Sistema de filtros
│   │   └── Pagination.tsx     # Componente de paginação
│   └── lib/                   # Utilitários
│       ├── prisma.ts          # Cliente Prisma
│       ├── auth.ts            # Configuração NextAuth
│       ├── youtube.ts         # Cliente YouTube API
│       ├── services/          # Serviços da aplicação
│       │   ├── transcript.ts  # Serviço de transcripts
│       │   ├── ai-summary.ts  # Serviço de IA
│       │   ├── playlist.ts    # Serviço de playlists
│       │   ├── category.ts    # Serviço de categorias
│       │   └── tag.ts         # Serviço de tags
│       └── utils/             # Funções utilitárias
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   └── migrations/            # Migrações do banco
├── public/                    # Arquivos estáticos
└── .env                       # Variáveis de ambiente
```

## 🔧 APIs Implementadas

### **Vídeos**
- `GET /api/videos` - Listar vídeos com filtros
- `POST /api/videos/sync` - Importar vídeo do YouTube
- `GET /api/videos/[id]/transcript` - Buscar transcript
- `GET /api/videos/[id]/summary` - Gerar resumo IA

### **Playlists**
- `GET /api/playlists` - Listar playlists
- `POST /api/playlists/sync` - Sincronizar playlist
- `POST /api/playlists/[id]/sync-videos` - Importar vídeos da playlist

### **Organização**
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/tags` - Listar tags
- `POST /api/tags` - Criar tag

## 🎨 Interface e UX

### **Design System**
- **Cores:** Paleta moderna com tons de azul, verde e roxo
- **Tipografia:** Inter para melhor legibilidade
- **Componentes:** Reutilizáveis e acessíveis
- **Responsividade:** Mobile-first approach

### **Estados de Loading**
- Spinners elegantes durante operações
- Feedback visual em tempo real
- Mensagens de progresso detalhadas

### **Tratamento de Erros**
- Mensagens de erro amigáveis
- Sugestões de solução
- Fallbacks inteligentes

## � CI/CD e Deploy

### **GitHub Actions**
O projeto inclui configuração completa de CI/CD com:
- **Linting e Type Checking** automático
- **Execução de Testes** em múltiplos estágios
- **Build e Deploy** automatizado
- **Relatórios de Cobertura** de testes
- **Análise de Segurança** com CodeQL

### **Configuração de Deploy**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### **Ambientes de Deploy**
- **Desenvolvimento:** Deploy automático a cada push
- **Staging:** Deploy manual para testes
- **Produção:** Deploy via pull request aprovado

## 📈 Monitoramento e Analytics

### **Métricas de Performance**
- **Core Web Vitals** monitorados
- **Tempo de resposta** das APIs
- **Taxa de erro** das operações
- **Uso de recursos** (CPU, memória)

### **Analytics de Uso**
- **Páginas mais visitadas**
- **Funcionalidades mais usadas**
- **Tempo médio de sessão**
- **Taxa de conversão** de usuários

### **Ferramentas Integradas**
- **Vercel Analytics** para métricas web
- **Sentry** para monitoramento de erros
- **DataDog** para métricas de sistema
- **Custom Dashboards** para KPIs específicos

## 🧪 Testes e Qualidade

### **Cobertura de Testes**
- **Testes Unitários:** Cobertura completa dos serviços e utilitários
- **Testes de Integração:** Workflows completos e interações entre serviços
- **Testes E2E:** Cenários completos de usuário com Playwright
- **Testes de Performance:** Benchmarks e monitoramento de performance

### **Executar Testes**
```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance

# Cobertura de testes
npm run test:coverage
```

### **Estrutura de Testes**
```
__tests__/
├── unit/                    # Testes unitários
│   ├── services/           # Testes dos serviços
│   └── utils/              # Testes dos utilitários
├── integration/            # Testes de integração
│   ├── collections-workflow.test.ts
│   └── api/
├── e2e/                    # Testes end-to-end
│   ├── collections-flow.test.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
└── performance/            # Testes de performance
    └── benchmark.test.ts
```

## 📚 Documentação

### **Documentação Técnica**
- [🏗️ Arquitetura do Sistema](./docs/architecture.md) - Visão geral completa da arquitetura, componentes e fluxos de dados
- [📚 API Reference](./docs/api-reference.md) - Documentação completa da API REST com exemplos
- [🛠️ Guia de Desenvolvimento](./docs/development-guide.md) - Setup, padrões de código e melhores práticas
- [🧪 Estratégia de Testes](./docs/testing-strategy.md) - Testes unitários, integração, E2E e performance

### **Documentação de Usuário**
- [📖 Guia do Usuário](./docs/user-guide.md) - Guia completo para usar todas as funcionalidades
- [❓ FAQ](./docs/faq.md) - Perguntas frequentes e soluções
- [🔧 Troubleshooting](./docs/troubleshooting.md) - Solução de problemas comuns

### **Documentação de Testes**
- [🌐 Guia de Testes E2E](./docs/e2e-testing-guide.md) - Como executar e escrever testes E2E com Playwright
- [📊 Relatórios de Performance](./__tests__/performance/benchmark.test.ts) - Benchmarks e métricas de performance

## 🧪 Testes e Qualidade

### **Cobertura de Testes**
- **Testes Unitários:** Cobertura completa dos serviços e utilitários
- **Testes de Integração:** Workflows completos e interações entre serviços
- **Testes E2E:** Cenários completos de usuário com Playwright
- **Testes de Performance:** Benchmarks e monitoramento de performance

### **Executar Testes**
```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance

# Cobertura de testes
npm run test:coverage
```

### **Estrutura de Testes**
```
__tests__/
├── unit/                    # Testes unitários
│   ├── services/           # Testes dos serviços
│   └── utils/              # Testes dos utilitários
├── integration/            # Testes de integração
│   ├── collections-workflow.test.ts
│   └── api/
├── e2e/                    # Testes end-to-end
│   ├── collections-flow.test.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
└── performance/            # Testes de performance
    └── benchmark.test.ts
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

## 🗺️ Roadmap

### **Próximas Funcionalidades**

#### **Fase 2: IA Avançada**
- [ ] **Recomendações personalizadas** baseadas no histórico
- [ ] **Análise de sentimento** em comentários
- [ ] **Geração automática de tags** por IA
- [ ] **Chatbot integrado** para perguntas sobre vídeos

#### **Fase 3: Colaboração**
- [ ] **Compartilhamento de coleções** com outros usuários
- [ ] **Comentários e anotações** em vídeos
- [ ] **Workspaces colaborativos**
- [ ] **Controle de versão** de coleções

#### **Fase 4: Mobile & PWA**
- [ ] **Aplicativo PWA** completo
- [ ] **Sincronização offline** avançada
- [ ] **Notificações push** nativas
- [ ] **Interface otimizada** para dispositivos móveis

#### **Fase 5: Enterprise**
- [ ] **Multi-tenant** com isolamento de dados
- [ ] **Integrações corporativas** (Slack, Teams, etc.)
- [ ] **Analytics avançado** para equipes
- [ ] **APIs para integração** com sistemas externos

### **Melhorias Técnicas Planejadas**
- [ ] **Migração para PostgreSQL** para escalabilidade
- [ ] **Implementação de Redis** para cache distribuído
- [ ] **Microserviços** para componentes específicos
- [ ] **GraphQL API** para queries flexíveis
- [ ] **Real-time updates** com WebSockets

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Diretrizes de Contribuição**
- Siga os padrões de código estabelecidos
- Escreva testes para novas funcionalidades
- Atualize a documentação quando necessário
- Mantenha commits pequenos e descritivos
- Use conventional commits

### **Configuração para Desenvolvimento**
```bash
# Instalar dependências
npm install

# Configurar pre-commit hooks
npm run prepare

# Executar linting
npm run lint

# Executar testes
npm run test

# Verificar cobertura
npm run test:coverage
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte e Contato

### **Canais de Suporte**
- **📧 Email:** support@youtube-organizer.com
- **💬 Discord:** [Comunidade YouTube Organizer](https://discord.gg/youtube-organizer)
- **🐛 GitHub Issues:** [Reportar Bugs](https://github.com/youtube-organizer/issues)
- **📚 Documentação:** [Centro de Ajuda](https://help.youtube-organizer.com)

### **Recursos Adicionais**
- **📰 Blog:** Novidades e tutoriais
- **🎥 YouTube:** Vídeos tutoriais
- **📱 Newsletter:** Atualizações mensais
- **🏷️ Status Page:** Status dos serviços

---

## 🎉 Conclusão

O **YouTube Organizer** representa uma solução completa e moderna para organização de conteúdo do YouTube, combinando:

- ✨ **Interface elegante** e intuitiva
- 🤖 **Inteligência artificial** avançada
- 🧪 **Testes abrangentes** e qualidade garantida
- 📚 **Documentação completa** e detalhada
- 🚀 **Arquitetura escalável** e performática
- 👥 **Comunidade ativa** e suporte dedicado

**Transforme sua experiência de aprendizado no YouTube com organização inteligente e IA!** 🎬✨

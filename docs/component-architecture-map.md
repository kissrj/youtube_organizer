# 🗺️ Component Architecture Map - YouTube Organizer

## 📊 Visão Geral da Arquitetura Atual

### Estrutura de Componentes Existentes

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Dashboard/Home
│   ├── globals.css              # Estilos globais
│   ├── videos/
│   │   └── page.tsx            # Página de vídeos
│   ├── playlists/
│   ├── categories/
│   ├── notebooks/
│   ├── tags/
│   ├── auto-tags/
│   ├── collections/
│   └── filters/
├── components/                   # Componentes React
│   ├── AuthGuard.tsx           # Proteção de rotas
│   ├── AuthHeader.tsx          # Cabeçalho com auth
│   ├── SearchBar.tsx           # Barra de busca
│   ├── VideoFilters.tsx        # Filtros de vídeo
│   ├── VideoModal.tsx          # Modal de vídeo
│   ├── Pagination.tsx          # Paginação
│   ├── SortControls.tsx        # Controles de ordenação
│   ├── FixedActionsBar.tsx     # Barra de ações fixa
│   ├── DraggableItem.tsx       # Item arrastável
│   ├── CompactMarkdown.tsx     # Markdown compacto
│   ├── ui/                     # Componentes UI base
│   ├── autoTags/               # Componentes de auto tags
│   ├── collections/            # Componentes de collections
│   ├── dataExport/             # Componentes de export
│   ├── dnd/                    # Drag & Drop
│   ├── feeds/                  # Componentes de feeds
│   ├── filters/                # Componentes de filtros
│   ├── icons/                  # Ícones
│   ├── import/                 # Componentes de import
│   ├── modals/                 # Modais
│   ├── notebooks/              # Componentes de notebooks
│   ├── notifications/          # Notificações
│   └── sync/                   # Componentes de sync
```

## 🏗️ Arquitetura Proposta

### 1. Sistema de Layout

#### Layout Base
```
components/layout/
├── Container.tsx              # Container responsivo
├── Sidebar.tsx               # Navegação lateral
├── Header.tsx                # Cabeçalho principal
├── Footer.tsx                # Rodapé
├── PageLayout.tsx            # Layout base das páginas
├── Grid.tsx                  # Sistema de grid
└── Flex.tsx                  # Sistema flexbox
```

#### Navegação
```
components/navigation/
├── NavBar.tsx               # Barra de navegação
├── NavItem.tsx              # Item de navegação
├── Breadcrumb.tsx           # Breadcrumb
├── Tab.tsx                  # Sistema de abas
└── Menu.tsx                 # Menu dropdown
```

### 2. Sistema de UI (Atoms)

#### Botões
```
components/ui/buttons/
├── Button.tsx               # Botão base
├── ButtonGroup.tsx          # Grupo de botões
├── IconButton.tsx           # Botão com ícone
├── FloatingActionButton.tsx # FAB
└── variants.ts              # Variants dos botões
```

#### Formulários
```
components/ui/forms/
├── Input.tsx                # Campo de entrada
├── Textarea.tsx             # Área de texto
├── Select.tsx               # Select dropdown
├── Checkbox.tsx             # Checkbox
├── Radio.tsx                # Radio button
├── Switch.tsx               # Toggle switch
├── FormField.tsx            # Wrapper de campo
└── Form.tsx                 # Form container
```

#### Dados
```
components/ui/data/
├── Card.tsx                 # Card base
├── Table.tsx                # Tabela
├── List.tsx                 # Lista
├── Badge.tsx                # Badge/Label
├── Avatar.tsx               # Avatar
├── Chip.tsx                 # Chip/Tag
└── EmptyState.tsx           # Estado vazio
```

### 3. Componentes Compostos (Molecules)

#### Feedback
```
components/feedback/
├── Alert.tsx                # Alertas
├── Toast.tsx                # Notificações toast
├── Modal.tsx                # Modal/Dialog
├── Drawer.tsx               # Drawer lateral
├── Tooltip.tsx              # Tooltip
├── Popover.tsx              # Popover
└── Loading.tsx              # Estados de loading
```

#### Data Display
```
components/data/
├── DataTable.tsx            # Tabela de dados
├── DataGrid.tsx             # Grid de dados
├── DataList.tsx             # Lista de dados
├── Pagination.tsx           # Paginação
├── SearchBar.tsx            # Barra de busca
├── FilterBar.tsx            # Barra de filtros
└── SortControls.tsx         # Controles de ordenação
```

### 4. Páginas (Pages/Organisms)

#### Dashboard
```
pages/dashboard/
├── Dashboard.tsx            # Página principal
├── StatsCards.tsx           # Cards de estatísticas
├── RecentActivity.tsx       # Atividade recente
├── QuickActions.tsx         # Ações rápidas
└── YouTubeStatus.tsx        # Status do YouTube
```

#### Vídeos
```
pages/videos/
├── VideosPage.tsx           # Página de vídeos
├── VideoCard.tsx            # Card de vídeo
├── VideoGrid.tsx            # Grid de vídeos
├── VideoFilters.tsx         # Filtros de vídeo
├── VideoModal.tsx           # Modal de vídeo
└── VideoActions.tsx         # Ações de vídeo
```

#### Playlists
```
pages/playlists/
├── PlaylistsPage.tsx        # Página de playlists
├── PlaylistCard.tsx         # Card de playlist
├── PlaylistGrid.tsx         # Grid de playlists
├── PlaylistModal.tsx        # Modal de playlist
└── PlaylistActions.tsx      # Ações de playlist
```

## 🔄 Mapeamento de Migração

### Componentes a Serem Migrados

| Componente Atual | Novo Componente | Status |
|------------------|----------------|--------|
| `AuthHeader.tsx` | `layout/Header.tsx` | Pendente |
| `SearchBar.tsx` | `data/SearchBar.tsx` | Pendente |
| `VideoFilters.tsx` | `data/FilterBar.tsx` | Pendente |
| `VideoModal.tsx` | `feedback/Modal.tsx` | Pendente |
| `Pagination.tsx` | `data/Pagination.tsx` | Pendente |
| `SortControls.tsx` | `data/SortControls.tsx` | Pendente |
| `FixedActionsBar.tsx` | `navigation/FloatingBar.tsx` | Pendente |
| `DraggableItem.tsx` | `ui/DraggableItem.tsx` | Pendente |

### Páginas a Serem Reformuladas

| Página | Componentes Principais | Status |
|--------|------------------------|--------|
| `/` (Dashboard) | StatsCards, YouTubeStatus | Pendente |
| `/videos` | VideoGrid, VideoFilters, VideoModal | Pendente |
| `/playlists` | PlaylistGrid, PlaylistModal | Pendente |
| `/categories` | CategoryGrid, CategoryModal | Pendente |
| `/notebooks` | NotebookGrid, NotebookModal | Pendente |
| `/tags` | TagGrid, TagModal | Pendente |
| `/auto-tags` | AutoTagGrid, AutoTagModal | Pendente |
| `/collections` | CollectionGrid, CollectionModal | Pendente |
| `/filters` | FilterGrid, FilterModal | Pendente |

## 📦 Dependências e Integrações

### Bibliotecas Externas
- **Tailwind CSS v4**: Sistema de design base
- **Lucide React**: Ícones
- **React DnD**: Drag & Drop
- **Next Themes**: Tema claro/escuro
- **React Hook Form**: Formulários (se necessário)

### Contextos e Providers
```
contexts/
├── ThemeContext.tsx         # Tema da aplicação
├── AuthContext.tsx          # Autenticação
├── UIContext.tsx            # Estado da UI
└── DataContext.tsx          # Dados globais
```

### Hooks Customizados
```
hooks/
├── useTheme.tsx            # Hook de tema
├── useAuth.tsx             # Hook de auth
├── useLocalStorage.tsx     # Local storage
├── useDebounce.tsx         # Debounce
└── useMediaQuery.tsx       # Media queries
```

## 🎯 Estratégia de Migração

### Fase 1: Foundation (1-2 semanas)
1. ✅ Criar sistema de tokens CSS
2. ✅ Implementar componentes base (Button, Card, Input)
3. ✅ Criar layout system (Container, Grid)
4. ✅ Configurar arquitetura de pastas

### Fase 2: Core Components (3-4 semanas)
1. ✅ Implementar UI components (Modal, Toast, Badge)
2. ✅ Criar data display components (Table, List)
3. ✅ Implementar feedback components (Loading, Alert)
4. ✅ Migrar componentes base existentes

### Fase 3: Page Migration (5-8 semanas)
1. ✅ Migrar uma página por vez
2. ✅ Testar funcionalidades após cada migração
3. ✅ Atualizar documentação
4. ✅ Refatorar componentes específicos

### Fase 4: Optimization (9-10 semanas)
1. ✅ Otimização de performance
2. ✅ Testes de acessibilidade
3. ✅ Cross-browser testing
4. ✅ Documentação final

## 🔧 Padrões de Desenvolvimento

### Estrutura de Arquivos
```
components/
├── ui/                    # Componentes base (atoms)
├── layout/               # Layout components
├── navigation/           # Navegação
├── feedback/             # Feedback components
├── data/                 # Data display
├── forms/                # Form components
└── [domain]/             # Domain-specific components
```

### Naming Conventions
- **Componentes**: PascalCase (Button, Card, Modal)
- **Arquivos**: PascalCase.tsx
- **Pastas**: camelCase
- **Props**: camelCase
- **CSS Classes**: kebab-case

### Props Interface
```tsx
interface ComponentProps {
  // Required props first
  requiredProp: string;

  // Optional props
  optionalProp?: string;

  // Event handlers
  onAction?: (value: string) => void;

  // Styling
  className?: string;

  // Children
  children?: React.ReactNode;
}
```

## 📊 Métricas de Sucesso

### Qualidade de Código
- **Coverage de Testes**: > 80%
- **ESLint**: 0 erros
- **TypeScript**: Strict mode
- **Performance**: Lighthouse > 90

### Experiência do Usuário
- **Responsividade**: Funciona em todos dispositivos
- **Acessibilidade**: WCAG 2.1 AA compliant
- **Performance**: < 3s para carregamento inicial
- **Consistência**: Padrões unificados

### Manutenibilidade
- **Documentação**: 100% dos componentes
- **Reutilização**: > 70% dos componentes reutilizáveis
- **Modularidade**: Baixo acoplamento
- **Escalabilidade**: Fácil adição de novos recursos

---

**Data de Criação**: Janeiro 2025
**Versão**: 1.0
**Status**: Em desenvolvimento
# 🎨 Design System Specification - YouTube Organizer

## 📋 Visão Geral

Este documento define as especificações técnicas para a reformulação completa da aplicação YouTube Organizer com um Design System unificado baseado em Tailwind CSS v4.

## 🏗️ Arquitetura Atual

### Estrutura da Aplicação
- **Framework**: Next.js 15 com App Router
- **Styling**: Tailwind CSS v4 com PostCSS
- **Tema**: Sistema claro/escuro automático
- **Componentes**: React com TypeScript
- **Estado**: React hooks + Context API
- **Drag & Drop**: React DnD

### Páginas Existentes
1. **Dashboard** (`/`) - Cards de navegação e status YouTube
2. **Vídeos** (`/videos`) - Lista de vídeos com filtros
3. **Playlists** (`/playlists`) - Gerenciamento de playlists
4. **Categorias** (`/categories`) - Organização por temas
5. **Notebooks** (`/notebooks`) - Cadernos personalizados
6. **Tags** (`/tags`) - Sistema de etiquetas
7. **Auto Tags** (`/auto-tags`) - Sugestões automáticas
8. **Collections** (`/collections`) - Coleções hierárquicas
9. **Filtros** (`/filters`) - Sistema avançado de filtros

## 🎯 Design System Proposto

### 1. Sistema de Tokens

#### Cores (CSS Custom Properties)
```css
:root {
  /* Base */
  --color-background: #0e1014;
  --color-foreground: #ffffff;
  --color-surface: #1a1d23;
  --color-surface-hover: #20252e;
  --color-border: #2a2f3a;
  --color-border-hover: #3a4150;

  /* Texto */
  --color-text: #ffffff;
  --color-text-muted: #9ca3af;
  --color-text-subtle: #6b7280;

  /* Estados */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* YouTube */
  --color-youtube: #ff0000;
  --color-youtube-hover: #cc0000;
}
```

#### Espaçamentos
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

#### Tipografia
```css
--font-family: 'Inter', system-ui, -apple-system, sans-serif;
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
```

### 2. Componentes Base

#### Button System
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

#### Card System
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

#### Input System
```tsx
interface InputProps {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
}
```

### 3. Layout System

#### Container
```tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  children: React.ReactNode;
}
```

#### Grid System
```tsx
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  children: React.ReactNode;
}
```

## 📱 Layout Responsivo

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Grid Responsivo
```tsx
// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 3 colunas
// Large Desktop: 4 colunas
<Grid responsive cols={{ default: 1, md: 2, lg: 3, xl: 4 }}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</Grid>
```

## 🎨 Padrões Visuais

### Cards
- **Border Radius**: `var(--radius-md)` (12px)
- **Shadow**: `var(--shadow-md)` para hover
- **Padding**: `var(--space-6)` interno
- **Gap**: `var(--space-4)` entre elementos

### Botões
- **Border Radius**: `var(--radius-sm)` (8px)
- **Padding**: `var(--space-3)` vertical, `var(--space-4)` horizontal
- **Font Weight**: 500 (medium)
- **Transition**: 180ms ease-out

### Formulários
- **Input Height**: `var(--space-12)` (48px)
- **Border Radius**: `var(--radius-sm)`
- **Focus Ring**: 2px solid primary color
- **Error State**: Red border + helper text

## 🔧 Componentes a Serem Criados

### 1. Layout Components
- `Container` - Wrapper responsivo
- `Sidebar` - Navegação lateral
- `Header` - Cabeçalho principal
- `Footer` - Rodapé
- `PageLayout` - Layout base das páginas

### 2. UI Components
- `Button` - Sistema completo de botões
- `Card` - Cards com variants
- `Input` - Campos de entrada
- `Select` - Dropdowns
- `Modal` - Modais e dialogs
- `Toast` - Notificações
- `Badge` - Badges e labels
- `Avatar` - Avatares de usuário

### 3. Data Display
- `Table` - Tabelas responsivas
- `List` - Listas com variants
- `Grid` - Sistema de grid
- `Pagination` - Paginação
- `EmptyState` - Estados vazios

### 4. Feedback
- `Loading` - Estados de carregamento
- `Skeleton` - Loading skeletons
- `Alert` - Alertas e mensagens
- `Progress` - Barras de progresso

## 📋 Plano de Migração

### Fase 1: Foundation (Semanas 1-2)
1. ✅ Criar sistema de tokens CSS
2. ✅ Implementar componentes base (Button, Card, Input)
3. ✅ Criar layout system (Container, Grid)
4. ✅ Atualizar globals.css com novos padrões

### Fase 2: Core Components (Semanas 3-4)
1. ✅ Implementar UI components (Modal, Toast, Badge)
2. ✅ Criar data display components (Table, List)
3. ✅ Implementar feedback components (Loading, Alert)
4. ✅ Atualizar AuthHeader com novos padrões

### Fase 3: Page Migration (Semanas 5-8)
1. ✅ Migrar Dashboard (/)
2. ✅ Migrar Vídeos (/videos)
3. ✅ Migrar Playlists (/playlists)
4. ✅ Migrar Categorias (/categories)
5. ✅ Migrar Notebooks (/notebooks)
6. ✅ Migrar Tags (/tags)
7. ✅ Migrar Auto Tags (/auto-tags)
8. ✅ Migrar Collections (/collections)
9. ✅ Migrar Filtros (/filters)

### Fase 4: Polish & Testing (Semanas 9-10)
1. ✅ Testes de responsividade
2. ✅ Acessibilidade (WCAG 2.1 AA)
3. ✅ Performance optimization
4. ✅ Cross-browser testing
5. ✅ Documentation final

## 🎯 Benefícios Esperados

### Para Desenvolvedores
- **Consistência**: Padrões unificados em toda aplicação
- **Velocidade**: Componentes reutilizáveis
- **Manutenibilidade**: Código mais organizado
- **Escalabilidade**: Fácil adição de novos recursos

### Para Usuários
- **Experiência Coerente**: Interface unificada
- **Responsividade**: Funciona em todos dispositivos
- **Acessibilidade**: Melhor usabilidade
- **Performance**: Carregamento otimizado

## 📚 Documentação

### Component Library
- Storybook para componentes isolados
- Documentação de uso
- Exemplos práticos
- Guidelines de implementação

### Design Guidelines
- Paleta de cores
- Tipografia
- Espaçamentos
- Interações

### Development Guidelines
- Padrões de código
- Naming conventions
- File structure
- Testing patterns

---

**Data de Criação**: Janeiro 2025
**Versão**: 1.0
**Status**: Em desenvolvimento
# ♿ Especificações de Acessibilidade - YouTube Organizer

## 📋 Visão Geral

Este documento define as especificações de acessibilidade para a aplicação YouTube Organizer, seguindo as diretrizes WCAG 2.1 Nível AA (Web Content Accessibility Guidelines).

## 🎯 Conformidade WCAG 2.1 AA

### Princípios WCAG
1. **Perceptível** - A informação deve ser apresentada de forma perceptível
2. **Operável** - Os componentes de interface devem ser operáveis
3. **Compreensível** - A informação deve ser compreensível
4. **Robusto** - O conteúdo deve ser robusto para diferentes tecnologias

### Níveis de Conformidade
- ✅ **A**: Requisitos básicos de acessibilidade
- ✅ **AA**: Requisitos intermediários (nosso alvo)
- 🔄 **AAA**: Requisitos avançados (desejável)

## 🔧 Requisitos Técnicos

### 1. Perceptível (Perceivable)

#### 1.1 Texto Alternativo
- **Imagens**: Todas as imagens devem ter `alt` text descritivo
- **Ícones**: Ícones funcionais devem ter `aria-label` ou `aria-labelledby`
- **Gráficos**: Gráficos complexos devem ter descrições textuais

```tsx
// ✅ Correto
<Image src="/video.jpg" alt="Thumbnail do vídeo: Como aprender React" />

// ✅ Correto
<button aria-label="Fechar modal">
  <XIcon />
</button>
```

#### 1.2 Mídia Baseada em Tempo
- **Vídeos**: Devem ter transcrições ou legendas
- **Áudio**: Deve ter transcrição textual
- **Animações**: Devem respeitar `prefers-reduced-motion`

```tsx
// ✅ Correto
<video>
  <track kind="captions" src="captions.vtt" />
</video>
```

#### 1.3 Adaptável
- **Conteúdo**: Deve funcionar sem CSS
- **Estrutura**: Deve usar headings semânticos
- **Dados**: Tabelas devem ter headers apropriados

```tsx
// ✅ Correto
<table>
  <thead>
    <tr>
      <th scope="col">Título</th>
      <th scope="col">Duração</th>
    </tr>
  </thead>
  <tbody>
    {/* dados */}
  </tbody>
</table>
```

#### 1.4 Distinguível
- **Contraste**: Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Cores**: Não usar apenas cor para transmitir informação
- **Zoom**: Página deve funcionar com 200% zoom

```css
/* ✅ Correto - Contraste adequado */
.text-primary {
  color: var(--color-text);
  background: var(--color-surface);
}

/* ✅ Correto - Fallback para cor */
.status-error {
  color: #dc2626;
  font-weight: 600;
}
.status-error::before {
  content: "❌ ";
}
```

### 2. Operável (Operable)

#### 2.1 Acessível por Teclado
- **Navegação**: Todos os elementos interativos devem ser acessíveis por teclado
- **Ordem**: Ordem de foco deve ser lógica
- **Visibilidade**: Foco deve ser claramente visível

```tsx
// ✅ Correto
<button
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
  onClick={handleClick}
>
  Ação
</button>
```

#### 2.2 Tempo Suficiente
- **Timeouts**: Usuários devem poder pausar ou ajustar timeouts
- **Animações**: Devem respeitar `prefers-reduced-motion`
- **Conteúdo em movimento**: Deve poder ser pausado

```css
/* ✅ Correto - Respeita preferências do usuário */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

#### 2.3 Convulsões e Reações Físicas
- **Conteúdo piscante**: Frequência < 3Hz ou intensidade baixa
- **Animações**: Evitar animações que possam causar desconforto

#### 2.4 Navegável
- **Links**: Devem ter propósito claro
- **Cabeçalhos**: Estrutura lógica de headings
- **Títulos**: Páginas devem ter títulos descritivos

```tsx
// ✅ Correto
<Link href="/videos" aria-label="Ver todos os vídeos organizados">
  Meus Vídeos
</Link>
```

### 3. Compreensível (Understandable)

#### 3.1 Legível
- **Idioma**: Conteúdo deve ter `lang` attribute
- **Pronúncia**: Siglas devem ser expandidas
- **Nível de Leitura**: Conteúdo deve ser compreensível

```tsx
// ✅ Correto
<html lang="pt-BR">
  <abbr title="Web Content Accessibility Guidelines">WCAG</abbr>
</html>
```

#### 3.2 Previsível
- **Navegação**: Elementos similares devem funcionar similarmente
- **Consistência**: Padrões devem ser mantidos
- **Mudanças contextuais**: Devem ser anunciadas

#### 3.3 Assistência na Entrada
- **Erros**: Devem ser claramente identificados
- **Sugestões**: Correções devem ser sugeridas
- **Prevenção**: Ações destrutivas devem ser confirmadas

```tsx
// ✅ Correto
<input
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <div id="email-error" role="alert">
    Email inválido. Use o formato nome@dominio.com
  </div>
)}
```

### 4. Robusto (Robust)

#### 4.1 Compatível
- **Tecnologias**: Deve funcionar com tecnologias assistivas
- **APIs**: Deve usar ARIA quando necessário
- **Parsing**: HTML deve ser válido

## 🧩 Componentes Acessíveis

### Button Component
```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  ...props
}: ButtonProps) => (
  <button
    className={buttonVariants({ variant, size })}
    disabled={disabled || loading}
    onClick={onClick}
    aria-disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner aria-hidden="true" />}
    {children}
  </button>
);
```

### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Foco management
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-content"
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <XIcon />
          </button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};
```

### Form Components
```tsx
interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
}

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required,
  helperText,
  ...props
}: InputProps) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span aria-label="obrigatório">*</span>}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        aria-required={required}
        className="form-input"
        {...props}
      />

      {helperText && !error && (
        <div id={helperId} className="form-helper">
          {helperText}
        </div>
      )}

      {error && (
        <div id={errorId} role="alert" className="form-error">
          {error}
        </div>
      )}
    </div>
  );
};
```

## 🎨 Design Tokens Acessíveis

### Contraste de Cores
```css
:root {
  /* Texto em superfícies claras */
  --color-text-on-light: #0b1220;        /* 21:1 contrast */
  --color-text-muted-light: #4b5563;    /* 8.6:1 contrast */
  --color-text-subtle-light: #6b7280;  /* 5.9:1 contrast */

  /* Texto em superfícies escuras */
  --color-text-on-dark: #ffffff;        /* 21:1 contrast */
  --color-text-muted-dark: #9ca3af;    /* 8.6:1 contrast */
  --color-text-subtle-dark: #6b7280;   /* 5.9:1 contrast */

  /* Estados */
  --color-success: #059669;             /* Verde acessível */
  --color-error: #dc2626;               /* Vermelho acessível */
  --color-warning: #d97706;             /* Laranja acessível */
  --color-info: #2563eb;                /* Azul acessível */
}
```

### Foco Visível
```css
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.focus-ring {
  transition: box-shadow 0.2s ease-out;
}

.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5);
}
```

## 🧪 Testes de Acessibilidade

### Ferramentas Automáticas
- **Lighthouse**: Performance e acessibilidade
- **axe-core**: Testes automatizados
- **WAVE**: Avaliação visual
- **Color Contrast Analyzer**: Verificação de contraste

### Testes Manuais
- **Navegação por teclado**: Tab, Enter, Escape
- **Screen readers**: NVDA, JAWS, VoiceOver
- **Zoom**: 200% sem perda de funcionalidade
- **Modo alto contraste**: Funcionamento adequado

### Testes com Usuários
- **Usuários com deficiência visual**
- **Usuários com deficiência motora**
- **Usuários com deficiência cognitiva**
- **Usuários de tecnologias assistivas**

## 📋 Checklist de Acessibilidade

### Por Componente
- [ ] **Semântica**: Usa elementos HTML corretos
- [ ] **ARIA**: Atributos ARIA apropriados quando necessário
- [ ] **Foco**: Gerenciamento adequado do foco
- [ ] **Teclado**: Totalmente navegável por teclado
- [ ] **Contraste**: Mínimo 4.5:1 para texto normal
- [ ] **Zoom**: Funciona com 200% zoom
- [ ] **Screen readers**: Anúncios adequados

### Por Página
- [ ] **Título**: Título de página descritivo
- [ ] **Headings**: Estrutura lógica de headings
- [ ] **Links**: Links com propósito claro
- [ ] **Formulários**: Labels e erros adequados
- [ ] **Imagens**: Alt text descritivo
- [ ] **Navegação**: Skip links e navegação lógica

### Por Funcionalidade
- [ ] **Busca**: Resultados anunciados para screen readers
- [ ] **Filtros**: Estado atual claramente indicado
- [ ] **Modais**: Foco contido e escape funcional
- [ ] **Notificações**: Anúncios adequados
- [ ] **Drag & Drop**: Alternativas para teclado

## 🔧 Implementação Prática

### Hook para Gerenciamento de Foco
```tsx
const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = () => {
    setFocusedElement(document.activeElement as HTMLElement);
  };

  const restoreFocus = () => {
    focusedElement?.focus();
  };

  const moveFocusTo = (element: HTMLElement) => {
    element.focus();
  };

  return { saveFocus, restoreFocus, moveFocusTo };
};
```

### Hook para Anúncios de Screen Reader
```tsx
const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};
```

### Componente Skip Link
```tsx
const SkipLink = () => (
  <a
    href="#main-content"
    className="skip-link"
    onFocus={(e) => e.target.style.top = '0'}
    onBlur={(e) => e.target.style.top = '-40px'}
  >
    Pular para conteúdo principal
  </a>
);
```

## 📊 Métricas e Monitoramento

### KPIs de Acessibilidade
- **Conformidade WCAG**: 100% AA compliance
- **Tempo de carregamento**: < 3s com screen readers
- **Taxa de erro**: < 1% em testes de acessibilidade
- **Satisfação do usuário**: > 4.5/5 em testes com usuários

### Ferramentas de Monitoramento
- **Google Lighthouse**: Acessibilidade score > 90
- **axe DevTools**: 0 violações críticas
- **WAVE Evaluation**: 0 erros de acessibilidade
- **Color Contrast Analyzer**: 100% compliance

## 🎯 Conclusão

A acessibilidade não é um recurso opcional, mas um requisito fundamental para uma aplicação web moderna. Seguindo estas especificações, garantimos que o YouTube Organizer seja utilizável por todos, independentemente de suas capacidades ou das tecnologias assistivas que utilizam.

---

**Data de Criação**: Janeiro 2025
**Versão**: 1.0
**Padrão**: WCAG 2.1 Nível AA
**Status**: Implementação em andamento
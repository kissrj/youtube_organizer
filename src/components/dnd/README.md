# Sistema de Drag and Drop para Coleções

Este documento descreve a implementação completa do sistema de drag and drop para o gerenciamento de coleções no YouTube Organizer.

## Visão Geral

O sistema permite que os usuários reorganizem coleções e movam itens entre coleções de forma intuitiva usando arrastar e soltar.

## Componentes Implementados

### 1. DndProvider (`src/components/dnd/DndProvider.tsx`)
- Provider principal que configura o contexto de drag and drop
- Suporte a HTML5 (desktop) e Touch (mobile)
- Fallback automático baseado no dispositivo

### 2. DraggableCollectionItem (`src/components/dnd/DraggableCollectionItem.tsx`)
- Item arrastável que representa uma coleção
- Feedback visual durante o arrasto
- Integração com o sistema de drag and drop

### 3. DroppableCollectionArea (`src/components/dnd/DroppableCollectionArea.tsx`)
- Área que aceita itens soltos
- Indicadores visuais de drop zone
- Validação de permissões de drop

### 4. DragHandle (`src/components/dnd/DragHandle.tsx`)
- Alça dedicada para arrasto preciso
- Suporte a diferentes tipos de itens
- Estados visuais para feedback

### 5. DragDropIndicator (`src/components/dnd/DragDropIndicator.tsx`)
- Indicadores visuais para posições de drop
- Suporte a posições: top, bottom, left, right
- Feedback visual durante operações

### 6. useDragDrop (`src/hooks/useDragDrop.ts`)
- Hook personalizado para operações de drag and drop
- Gerenciamento de estado simplificado
- Reutilização em diferentes componentes

### 7. DragDropContainer (`src/components/dnd/DragDropContainer.tsx`)
- Container que gerencia drag and drop completo
- Suporte a diferentes tipos de itens
- Posicionamento automático de indicadores

### 8. CollectionTreeWithDnd (`src/components/collections/CollectionTreeWithDnd.tsx`)
- Árvore de coleções com drag and drop integrado
- Expansão/colapso de nós
- Operações CRUD integradas

## Funcionalidades

### Arrastar Coleções
- Mover coleções entre diferentes níveis hierárquicos
- Reordenar coleções dentro do mesmo nível
- Validação para evitar ciclos na hierarquia

### Mover Itens
- Transferir vídeos entre coleções
- Mover canais entre coleções
- Reordenar playlists em diferentes coleções

### Feedback Visual
- Opacidade reduzida durante arrasto
- Indicadores de drop zone
- Cursors apropriados (grab/grabbing)

### Suporte Mobile
- Backend touch para dispositivos móveis
- Gestos intuitivos
- Responsividade automática

## Uso Básico

```typescript
import { DndProvider } from '@/components/dnd/DndProvider'
import { CollectionTreeWithDnd } from '@/components/collections/CollectionTreeWithDnd'

function App() {
  return (
    <DndProvider>
      <CollectionTreeWithDnd
        collections={collections}
        onCollectionSelect={handleSelect}
        onCollectionMove={handleMove}
        onItemMove={handleItemMove}
      />
    </DndProvider>
  )
}
```

## API de Serviço

### moveCollection(collectionId, newParentId, newPosition)
Move uma coleção para um novo pai e posição.

**Parâmetros:**
- `collectionId`: ID da coleção a ser movida
- `newParentId`: ID da nova coleção pai (opcional)
- `newPosition`: Nova posição na hierarquia

### moveItem(itemId, itemType, targetCollectionId)
Move um item para uma coleção diferente.

**Parâmetros:**
- `itemId`: ID do item a ser movido
- `itemType`: Tipo do item ('video', 'channel', 'playlist')
- `targetCollectionId`: ID da coleção de destino

## Tipos TypeScript

```typescript
interface DragDropItem {
  id: string
  type: 'collection' | 'video' | 'channel' | 'playlist'
  name?: string
  parentId?: string
}

interface DragDropResult {
  isDragging: boolean
  isOver: boolean
  canDrop: boolean
  drag: any
  drop: any
  item: DragDropItem | null
}

type DropPosition = 'before' | 'after' | 'inside'
```

## Dependências

- `react-dnd`: Biblioteca principal de drag and drop
- `react-dnd-html5-backend`: Backend para desktop
- `react-dnd-touch-backend`: Backend para dispositivos móveis

## Próximos Passos

1. **Testes Unitários**: Implementar testes para todos os componentes
2. **Acessibilidade**: Adicionar suporte completo a navegação por teclado
3. **Performance**: Otimização para grandes quantidades de itens
4. **Animações**: Transições suaves durante operações
5. **Undo/Redo**: Sistema de desfazer/refazer operações

## Troubleshooting

### Problemas Comuns

1. **Pacotes não instalados**: Execute `npm install react-dnd react-dnd-html5-backend react-dnd-touch-backend`
2. **TypeScript errors**: Verifique se os tipos estão corretamente importados
3. **Mobile não funciona**: Certifique-se de que o TouchBackend está sendo usado

### Debug

Para debug, adicione logs nos callbacks de drag and drop:

```typescript
const handleDrop = (itemId: string, targetId: string) => {
  console.log('Drop:', { itemId, targetId })
  // Lógica de drop
}
```

## Considerações de Segurança

- Todas as operações verificam permissões do usuário
- Validação de ownership para coleções e itens
- Prevenção de ciclos na hierarquia de coleções
- Sanitização de dados de entrada

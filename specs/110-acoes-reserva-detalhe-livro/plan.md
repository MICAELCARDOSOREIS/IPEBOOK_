# Plano de Implementação — Spec 110: Ações Interativas de Reserva e Acompanhamento no Detalhe do Livro

## 1. Arquitetura e Decisões

- **Padrão MVVM Preservado**:
  - `BookDetail` (View) gerencia a apresentação da folha modal de reserva (`ReservedListingSheet`) e dispara os callbacks de navegação passados via props.
  - A lógica de negócio de favoritos (`toggleFavorite`) reutiliza a ação já existente de `useBookDetailViewModel`.
  - A rota `src/app/livro/[id].tsx` conecta os callbacks com `expo-router` e o utilitário seguro `pushOnce`.
- **Material 3 Expressive**:
  - Utilização dos tokens de cores (`m3.surfaceContainerLow`, `m3.primary`, `m3.onSurfaceVariant`), espaçamentos e raios contínuos do design system.
  - Feedback tátil com `withPress` nos botões e itens interativos da folha modal.
  - Modal com foco acessível e comportamento condizente com TalkBack/leitor de tela.

---

## 2. Sequência de Implementação

1. **Passo 1 — Suporte a `categoria` na Pesquisa**:
   - Atualizar `src/app/pesquisa.tsx` para extrair `categoria` de `useLocalSearchParams<{ modalidade?: string; bairro?: string; categoria?: string }>()`.
   - Adicionar prop `initialCategory?: string` em `src/view/search/search.tsx` e aplicar na inicialização do filtro de busca via `actions.setCategory`.

2. **Passo 2 — Componente `ReservedListingSheet`**:
   - Criar `src/view/listings/ReservedListingSheet.tsx` no padrão modal do M3.
   - Implementar conteúdo para status `reserved` e `delivered`.
   - Implementar botões de ação: Favoritar/Lista de espera, Buscar por categoria, Ver perfil do anunciante e Fechar.

3. **Passo 3 — Badge de Affordance no `Book3D`**:
   - Em `src/view/components/Book3D.tsx`, adicionar badge com texto `"3D · Toque para virar"` no container do modelo 3D.

4. **Passo 4 — Atualização de `BookDetail`**:
   - Em `src/view/listings/bookDetail.tsx`:
     - Adicionar props `onNavigateToManageListing?: (bookId: string) => void`, `onNavigateToMyRequests?: () => void` e `onNavigateToCategorySearch?: (category: string) => void`.
     - Substituir a `View style={styles.statusPill}` por um `Pressable style={withPress(styles.statusButton)}` interativo.
     - Ao tocar, acionar a navegação respectiva ou abrir `ReservedListingSheet`.

5. **Passo 5 — Integração na Rota `src/app/livro/[id].tsx`**:
   - Conectar `onNavigateToManageListing`, `onNavigateToMyRequests` e `onNavigateToCategorySearch`.

6. **Passo 6 — Testes Automatizados e Verificação**:
   - Criar testes unitários para `ReservedListingSheet` e testes de componente em `tests/components/bookDetailInteractiveStatus.test.tsx`.
   - Executar suíte completa Vitest, `typecheck`, `check:architecture` e `check:numbering`.

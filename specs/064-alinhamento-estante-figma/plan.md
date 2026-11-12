# Plano de Implementação — Spec 064: Alinhamento Visual da Estante ao Figma

## 1. Arquitetura e Decisões Técnicas

- **Componentes Afetados:**
  - `src/view/listings/myListings.tsx`: Adição do cabeçalho editorial com serifa, implementação das 3 abas M3 (`Anúncios`, `Propostas`, `Concluídos`), indicador inferior ativo e divisória horizontal.
  - `src/view/listings/shelfRow.tsx`: Ajuste visual da linha de livro com proporção de capa 56x80px e hierarquia de texto refinada.
  - `src/view/listings/myListingsListingsTab.tsx`: Ajuste dos chips de filtro, formatação da linha de apoio (`supportingText`) e inclusão da aba `Concluídos`.
  - `src/view/listings/myListingsEmpty.tsx`: Alinhamento do estado vazio com `05.02 · Estante vazia`.
  - `docs/adr/0047-alinhamento-estante-figma.md`: Registro da decisão técnica e arquitetural.

## 2. Etapas de Desenvolvimento

1. **ADR 0047:** Redigir a decisão arquitetural sobre a tipografia editorial na Estante, Abas M3 e supressão de `onBack` na raiz da navegação.
2. **Refatoração de Componentes:**
   - Atualizar `ShelfRow` para dimensão exata de capa (56x80px) e estilo de chevron.
   - Atualizar `MyListings` com cabeçalho serifado, as 3 abas M3 e Extended FAB.
   - Adicionar suporte à aba `Concluídos` (livros com status `concluded`/`completed` ou pedidos concluídos).
3. **Atualização de Testes:**
   - Ajustar `tests/components/myListingsView.test.tsx` e testes relacionados para cobrir as novas abas e textos semânticos.
4. **Verificação no Dispositivo Android via ADB:**
   - Capturar a tela do aparelho com a nova estante e verificar no Expo Go.
5. **Validação Final:**
   - `npm test`, `npm run check:architecture`, `npm run check:numbering`.

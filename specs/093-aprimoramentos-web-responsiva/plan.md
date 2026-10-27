# Plano de Implementação — Spec 093

## Fases de Execução

1. **Fase 1: Domínio e ViewModels de Busca (`searchFilters.ts`)**:
   - Atualizar tipo `SearchConditionFilter` para `"all" | BookCondition`.
   - Atualizar `CONDITION_FILTER_LABELS` para incluir todas as 4 condições do livro (`new`, `good`, `marked`, `worn`).
   - Atualizar `matchesCondition` para checar `book.condition === condition` (com tolerância em "good" para livros sem condição).
   - Atualizar `activeFilters` e `describeResults` para usar o rótulo da condição selecionada.
   - Atualizar/adicionar testes unitários para as novas condições.

2. **Fase 2: Componentes de Filtro (`WebFilterSidebar.tsx` e `FilterSheet.tsx`)**:
   - Em `WebFilterSidebar.tsx`, listar as 4 opções de conservação.
   - Em `FilterSheet.tsx`, iterar sobre todas as opções de `CONDITION_IDS`.
   - Atualizar testes de componentes correspondentes.

3. **Fase 3: Hero e Topo da Home Web Larga (`home.tsx`)**:
   - Ocultar botões redundantes de sessão e sino na `topBar` quando `wideWeb` estiver ativo.
   - Adicionar o bloco de estatísticas/destaques da comunidade no hero da Home na web larga.

4. **Fase 4: Banner da Estante Web Larga (`myListings.tsx`)**:
   - Adicionar o banner comunitário de troca no topo da Estante quando `wideWeb` for ativo.

5. **Fase 5: Autenticação em Duas Colunas (`resetPassword.tsx`)**:
   - Integrar `AuthShell` na tela de redefinição de senha (`resetPassword.tsx`).

6. **Fase 6: Verificação Integral e Atualização de Documentação**:
   - Rodar checagens de arquitetura, tipos e testes.
   - Atualizar `docs/estado.md` com os avanços implementados.

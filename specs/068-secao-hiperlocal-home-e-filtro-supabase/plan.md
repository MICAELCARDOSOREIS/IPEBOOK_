# Plano de Implementação — Spec 068

**Data:** 25 de outubro de 2026  
**Referência:** Spec 068 / ADR 0051

---

## 1. Arquitetura e Decisões

- **Camada `model`:**
  - Em `src/model/datasources/iBookDataSource.ts`:
    - Atualizar `ListBooksOptions` com `neighborhood?: string; modality?: Book["modality"];`.
- **Camada `infra`:**
  - Em `src/infra/datasources/supabaseBookDataSource.ts`:
    - Adicionar cláusula condicional `.eq("neighborhood", options.neighborhood)` se `options?.neighborhood && options.neighborhood !== "all" && options.neighborhood !== "Todos os bairros (Piripiri)"`.
    - Adicionar cláusula condicional `.eq("modality", options.modality)` se `options?.modality && options.modality !== "all"`.
  - Em `src/infra/datasources/memoryBookDataSource.ts`:
    - Adicionar filtragem em memória por `neighborhood` e `modality`.
- **Camada `view`:**
  - Em `src/view/home.tsx`:
    - Atualizar a tipagem de `onNavigateToSearch`: `(filter?: { modality?: BookModality; neighborhood?: string }) => void`.
    - Calcular `neighborhoodBooks`: livros cujo bairro seja igual a `effectiveNeighborhood` (quando não for `"all"`/global).
    - Adaptar o título do carrossel para *"Perto de você no [Bairro]"* ou *"Perto de você em Piripiri"*.
    - Ao tocar em "Ver todos", repassar `{ modality: selectedModality === "all" ? undefined : selectedModality, neighborhood: isAll ? undefined : effectiveNeighborhood }`.
    - Exibir estado de ausência acolhedor quando o bairro específico não possuir livros disponíveis.

---

## 2. Abordagem de Testes (TDD)

1. **Testes de Contrato de Dados:**
   - `tests/datasources/supabaseBookDataSource.test.ts`: Cobrir chamada de `list` com opções de bairro e modalidade.
   - `tests/datasources/memoryBookDataSource.test.ts`: Validar filtro de bairro e modalidade.
2. **Testes de Integração e UI:**
   - `tests/components-mocked/homeViewMocked.test.tsx`: Cobrir renderização da seção hiperlocal com bairro ativo e sem livros no bairro.
   - `tests/components/homeView.test.tsx` (ou arquivo de teste de integração da home).

---

## 3. Riscos e Mitigações

- **Risco:** Livros cadastrados antes da definição de bairros não possuírem `neighborhood`.
  - **Mitigação:** Tratados na visualização "Todos os bairros (Piripiri)" / `"all"`, nunca quebrando nem lançando exceção.
- **Risco:** Violação da arquitetura de 7 camadas.
  - **Mitigação:** Nenhuma camada superior importará infra diretamente; `app` continua importando apenas `view`.

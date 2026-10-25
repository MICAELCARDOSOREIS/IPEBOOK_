# Tarefas — Spec 068

- [x] **T01 — Atualizar Contrato `ListBooksOptions`:** Adicionar `neighborhood?: string` e `modality?: Book["modality"]` em `src/model/datasources/iBookDataSource.ts`.
- [x] **T02 — Testes de Unidade para Datasources com Filtro:** Criar ou atualizar testes em `tests/unit/supabaseDataSources.test.ts` e `tests/unit/memoryBookDataSource.test.ts`.
- [x] **T03 — Implementar Filtro de Bairro no `SupabaseBookDataSource`:** Adicionar `.eq("neighborhood", ...)` e `.eq("modality", ...)` em `src/infra/datasources/supabaseBookDataSource.ts`.
- [x] **T04 — Implementar Filtro de Bairro no `MemoryBookDataSource`:** Adicionar filtragem no `src/infra/datasources/memoryBookDataSource.ts`.
- [x] **T05 — Atualizar `HomeProps` e Navegação para Pesquisa:** Permitir que `onNavigateToSearch` receba `{ modality?: BookModality; neighborhood?: string }` e passar parâmetros entre rotas.
- [x] **T06 — Implementar Carrossel Hiperlocal na `Home` (`src/view/home.tsx`):** Exibir "Perto de você no [Bairro]", filtrar livros do bairro e exibir estado de ausência amigável com opção para ver toda Piripiri.
- [x] **T07 — Testes de Componente da `Home` com Bairro:** Cobrir os novos estados e comportamentos em `tests/components-mocked/homeViewMocked.test.tsx`.
- [x] **T08 — Validar Integridade e Arquitetura:** Executar `npm run check:architecture`, `npm run check:numbering`, `npm run typecheck` e `npx vitest run`.
- [x] **T09 — Documentação e Registro de ADR:** Criar `docs/adr/0051-secao-hiperlocal-home-e-filtro-supabase.md` e atualizar índices.

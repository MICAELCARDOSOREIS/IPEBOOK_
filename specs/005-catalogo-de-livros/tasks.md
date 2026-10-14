# Tarefas: catálogo de livros (retroativo)

Status: **concluída antes desta spec existir**. Todas as tarefas abaixo já estavam implementadas
quando esta especificação foi escrita (2026-10-14) — marcadas como concluídas para registrar o
que já existe, sem trabalho novo pendente.

## Modelo e contrato

- [x] T001 `Book` com os campos consumidos pelo catálogo (`id`, `title`, `author`, `modality`).
- [x] T002 `IBookDataSource.list()` como contrato de leitura do catálogo.

## Caso de uso e infraestrutura

- [x] T003 `BookUseCases.listBooks()` delegando ao datasource.
- [x] T004 `MemoryBookDataSource.list()` com cópia defensiva.

## ViewModel

- [x] T005 `useHomeViewModel`: estado `{ books, loading, error }` e ação `reload()`.
- [x] T006 Proteção contra condição de corrida (`active`/`request` refs) em recarregamentos
      concorrentes.
- [x] T007 Sanitização de erro desconhecido para mensagem genérica segura.

## View

- [x] T008 `src/view/home.tsx`: estado de carregamento com `ActivityIndicator` e rótulo
      acessível.
- [x] T009 Estado de erro com `AppIcon`, mensagem e botão "Tentar novamente" (issue #1/#33).
- [x] T010 Estado vazio com mensagem amigável.
- [x] T011 Tag de modalidade por item da lista (issue #39/PR #38).

## Testes

- [x] T012 `tests/components/homeView.test.tsx`.
- [x] T013 `tests/components-mocked/homeViewMocked.test.tsx` (inclui a tag de modalidade).
- [x] T014 `tests/hooks/useHomeViewModel.test.tsx`.
- [x] T015 `tests/integration/homeIntegration.test.tsx`.

## Documentação

- [x] T016 Esta spec (`spec.md`, `plan.md`, `tasks.md`, `validacao.md`) escrita retroativamente
      em 2026-10-14, documentando o que já existia desde a fundação do projeto.

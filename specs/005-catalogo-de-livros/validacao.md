# Validação: catálogo de livros (retroativo)

Data: 2026-10-14. Branch: `develop`, commit `f2b06aa`.
Status: funcionalidade já implementada e em produção desde a fundação do projeto; esta
validação confirma que o comportamento documentado em `spec.md` corresponde ao código atual e
que a suíte de testes já existente cobre os requisitos (sem necessidade de testes novos).

## Evidências executáveis

### 1. `npm run validate` (código de saída 0)

1. `tsc --noEmit`: zero erros de tipagem.
2. `node scripts/verificar-arquitetura.mjs`: sem violações de importação entre camadas.
3. `npm run test:coverage`: 144/144 testes aprovados em 24 arquivos.

### 2. Relatório de cobertura (v8)

- Statements: 94,19% (meta mínima: 80%)
- Branches: 82,54% (meta mínima: 80%)
- Functions: 94,44% (meta mínima: 80%)
- Lines: 95,88% (meta mínima: 80%)

### 3. Testes relevantes a esta spec

- `tests/components/homeView.test.tsx`: cabeçalhos acessíveis (US1), subtítulo, estado vazio
  (US1), marca decorativa inacessível.
- `tests/components-mocked/homeViewMocked.test.tsx`: estado de carregamento (US1), estado de
  erro com retry (US2, FR-003), catálogo populado com tag de modalidade (FR-005).
- `tests/hooks/useHomeViewModel.test.tsx`: ciclo de vida do hook, concorrência entre
  recarregamentos (FR-004), sanitização de erro (FR-003).
- `tests/integration/homeIntegration.test.tsx`: View + ViewModel + UseCase + Datasource reais
  (SC-001, sem mocks de negócio).

### 4. Build Web

`npm run build:web`: exportação estática com 8 rotas, incluindo `/` (Home com o catálogo),
sem falhas.

## Cobertura por critério de sucesso

| Critério | Evidência |
| --- | --- |
| SC-001 | `tests/integration/homeIntegration.test.tsx` + validação manual via build web |
| SC-002 | `tests/components-mocked/homeViewMocked.test.tsx` (cenário de erro + retry) |
| SC-003 | `npm run validate` com exit 0 |

## Limites

- Não há teste de dispositivo físico Android para o catálogo — só Web (build estático) e
  testes automatizados (Vitest/RNTL).
- A cobertura por arquivo não foi medida isoladamente para `home.tsx`/`useHomeViewModel.ts`
  nesta validação; os números acima são do projeto inteiro (que já incluem esses arquivos
  acima de 88% statements cada, ver relatório completo de `npm run test:coverage`).
- Paginação e busca permanecem fora de escopo (ver "Fora do escopo" em `spec.md`) — não há
  evidência a apresentar para o que não foi especificado.

# Validação: Rascunhos de Anúncio (Spec 017)

Data: 2026-10-26 · Branch: `feat/rascunhos-anuncio-017` (base `develop`)

## Como foi validado

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Tipos | `npm run typecheck` (`tsc --noEmit`) | OK |
| Fronteiras MVVM | `npm run check:architecture` | OK |
| Numeração/rotas | `npm run check:numbering` | OK |
| Configuração de build | `npm run check:build-config` | OK |
| Migrações e RLS (PGlite) | `npm run test:sql` | OK (cenários da Spec 017 aprovados) |
| Testes + cobertura | `npm run test:coverage` | OK — 1303 testes, 80,02% de branches |
| Pipeline completo | `npm run validate` | EXIT=0 |
| Build web (PWA) | `npm run build:web` | EXIT=0 — rota `/rascunhos` exportada |

## Critérios de aceite e onde foram cobertos

- **Salvar para depois**: `saveDraft` cria/atualiza um `Book` com `status="draft"` e `draftStep`.
  Testes em `tests/unit/bookUseCasesDrafts.test.ts` (criação, atualização por `draftId`, recusa de
  rascunho alheio, recusa de `draftId` que já não é rascunho, inexistente) e no botão
  "Salvar para depois" da View (`tests/components/createListingView.test.tsx`, mock `saveForLater`).
- **Rascunho incompleto é aceito**: `validateDraftPayload` tolera ausência de título/autor/preço
  (`tests/unit/bookValidatorDrafts.test.ts`) e o CHECK do banco flexibilizado apenas para `draft`
  (cenário PGlite "rascunho sem título/autor/sem preço para venda é aceito").
- **Rascunho não polui o catálogo nem "Meus anúncios"**: `list()` e `listMyListings` filtram
  `draft` (`tests/unit/bookUseCasesDrafts.test.ts`); RLS esconde rascunho de terceiros e anônimos
  (cenários PGlite de visibilidade).
- **Listar e retomar**: `listDrafts` retorna só os rascunhos do dono; `loadServerDraft`/`resumeDraft`
  restauram a etapa (`tests/hooks/useDraftsViewModel.test.tsx`, `tests/components/draftsView.test.tsx`
  e fluxo retomar → `/anunciar?rascunho=<id>`).
- **Descartar com confirmação**: `discardDraft` remove fisicamente apenas rascunho do dono
  (`tests/unit/bookUseCasesDrafts.test.ts`); confirmação via `Alert` testada em
  `tests/components/draftsView.test.tsx`; RLS bloqueia DELETE de rascunho alheio (cenário PGlite).
- **Publicar transiciona `draft → available`**: `publishDraft` valida payload completo, atualiza o
  status e dispara `matchNewBook` (`tests/unit/bookUseCasesDrafts.test.ts`).

## Limitações

- Validação do fluxo real em navegador/dispositivo e aplicação da migração `202610260001_rascunhos_anuncio.sql`
  ao Supabase remoto ainda não realizadas neste ciclo. A migração fica pendente de aplicação remota
  antes de valer em produção.
- Build aprovado e testes automatizados verdes não substituem a conferência manual do fluxo em
  dispositivo físico.

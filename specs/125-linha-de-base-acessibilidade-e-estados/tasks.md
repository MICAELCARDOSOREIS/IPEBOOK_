# Tarefas — Spec 125 (Linha de base de acessibilidade e consistência de estados)

Dependem da Spec 125. Cada tarefa lista sua verificação. Nenhuma tarefa muda regra de negócio nem camada; nenhuma usa Playwright.

## Fase 1 — prevenção automatizada primeiro

- [x] **T001** Adicionar ao `scripts/verificar-design-system.mjs` a varredura de `src/view/**/*.tsx` que reprova `<Modal` sem barreira de acessibilidade (`accessibilityViewIsModal`), com a mensagem apontando o arquivo e a linha. Verificação: rodar antes da correção de D1 e confirmar que falha nos dois modais citados; rodar `npm run check:design-system` ao final e ver verde.
- [x] **T002** Estender `tests/unit/interactiveAccessibility.test.ts` para exigir o par `accessibilityRole="alert"` + `accessibilityLiveRegion` em `ErrorState` e `OfflineState`. Verificação: teste falha contra a versão atual (regressão detectável) e passa após T005.

## Fase 2 — barreiras e foco dos modais (D1)

- [x] **T003** Aplicar a barreira de acessibilidade em `src/view/components/PhotoSourceSheet.tsx:23` e `src/view/components/BarcodeScannerModal.tsx:62`. Verificação: T001 verde; teste de componente cobre a folha de origem da foto e o leitor de ISBN abertos.
- [x] **T004** Reaproveitar o mecanismo de prisão de foco do `Dialog` (função pura `resolveDialogTabWrap`, `docs/auditoria-acessibilidade.md:105-110`) nos dois modais na Web, em vez de duplicar lógica. Verificação: teste unitário da função reaproveitada; registrar no PR que o exercício ponta a ponta depende de navegador conectado (limitação já registrada na auditoria da Issue #96).

## Fase 3 — estados padrão (D4, D5)

- [x] **T005** Acrescentar `accessibilityLiveRegion="polite"` em `ErrorState.tsx:27` e `OfflineState.tsx:31`. Verificação: T002 verde.
- [x] **T006** Substituir o tratamento próprio de erro em `src/view/listings/bookDetail.tsx:515-519` por `ErrorState` com `reload` do ViewModel. Verificação: teste de regressão em `tests/components-mocked/bookDetailView.test.tsx` falha antes e passa depois.
- [x] **T007** Substituir o erro-as-hint e o carregando próprio em `src/view/search/searchAlerts.tsx:90,99,114` por `ErrorState`/`LoadingState` (+ `OfflineState` quando offline). Verificação: idem em `tests/components/favoritesAlertsView.test.tsx`.

## Fase 4 — toque, quebra e rótulos (D2, D3, D6, D7)

- [x] **T008** `hitSlop` nos pinos não selecionados de `MeetingMap.native.tsx:113` e `MeetingMap.tsx:31` para completar 48 dp, mantendo a arte em 36 dp. Verificação: teste lê `tokens.accessibility.touchTarget`, sem número solto.
- [x] **T009** `flexWrap: "wrap"` na `modalityRow` de `editListing.tsx:423` e revisão das linhas equivalentes (`:172`, `:189`, `:253`, `:289`). Verificação: teste de componente afirma que o `flexWrap` está aplicado às linhas de escolha.
- [x] **T010** Derivar a mensagem de senha de `MIN_PASSWORD_LENGTH` (`supabaseAuthDataSource.ts:104`) em vez do literal "6". Verificação: teste compara o texto do datasource com o validador.
- [x] **T011** Corrigir o `accessibilityLabel` do botão de LGPD em `termsAndPrivacy.tsx:104-113` para descrever o destino (gerenciamento de dados), não a exclusão. Verificação: `getByRole("button", { name: ... })` no teste de Termos.

## Fase 5 — fechamento

- [x] **T012** Atualizar `design-system/06-acessibilidade.md` (seções de alvo de toque e leitor de tela) com o padrão de `hitSlop` e o requisito de barreira em todo modal, e `docs/adr/README.md` com o índice do ADR 0097.
- [x] **T013** Rodar `npm run validate` integral e atualizar o bloco "Conferência atual" de `docs/estado.md` e a abertura do `README.md` com os números reais da execução (spec 125, ADR 0097 e testes novos), conferidos por `npm run check:docs`.

## Risco e ordenação

T001 e T002 vêm primeiro: sem a verificação que falha, as correções das fases 2-4 não têm como provar que não regredissem. T007 toca `tests/components/favoritesAlertsView.test.tsx`, arquivo com edição de outro agente em curso (2026-11-05), e por isso está no fim da fase 3 — coordenar antes de mexer.

## Status da execução (2026-11-05)

- Concluídas e verificadas: T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013.
- **T008 (desvio na web):** o pino web é um `<button>` criado fora do React Native, então `hitSlop`
  não se aplica. A área de toque foi completada com uma extensão invisível
  `[data-pino-mapa][aria-pressed="false"]::after` no CSS global de `src/app/+html.tsx`, com o
  deslocamento derivado de `tokens.accessibility.touchTarget`; a arte continua em 36 px. No nativo
  foi `hitSlop={PIN_HIT_SLOP}` (`MeetingMap.native.tsx`). Verificações:
  `tests/unit/interactiveAccessibility.test.ts` e `tests/components/meetingMapInteractiveWeb.test.tsx`.
- **T004:** extraído o hook compartilhado `useModalFocusTrap` em `src/view/components/Dialog.tsx`
  (reaproveitando `resolveDialogTabWrap`, fechamento com `Escape` e devolução de foco ao gatilho) e
  aplicado em `Dialog.tsx`, `PhotoSourceSheet.tsx`, `BarcodeScannerModal.tsx`,
  `NeighborhoodSelectorModal.tsx`, `profileSafetySheet.tsx` e `photoGallery.tsx`. O exercício em
  navegador conectado continua registrado como limitação da auditoria da Issue #96.
- **T006:** `bookDetail.tsx` passou a usar `LoadingState` e `ErrorState` com `actions.reload()`,
  coberto pelo teste de regressão em `tests/components-mocked/bookDetailView.test.tsx`.
- **T007:** `searchAlerts.tsx` passou a renderizar `LoadingState`, `ErrorState` com `actions.reload()`
  e `OfflineState` a partir de `state.loadError` (separado do erro de validação do formulário em
  `useSearchAlertsViewModel.ts`), coberto pelo teste de regressão em
  `tests/components/favoritesAlertsView.test.tsx`.
- **T013:** `npm run validate` integral aprovado em 2026-11-05 (2.079 testes em 292 arquivos,
  Branches 81,15%) e sincronia de `docs/estado.md` e `README.md` conferida por `npm run check:docs`.

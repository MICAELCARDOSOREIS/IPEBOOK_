# Tarefas — Spec 135: Adequar PWA no iPhone/Safari ao Apple HIG

- [x] **T001 — Registrar ADR 0108**
  - Criar `docs/adr/0108-pwa-iphone-safari-apple-hig.md` documentando o contexto, decisão e consequências da adequação do PWA ao Apple HIG.
  - Atualizar o índice em `docs/adr/README.md`.

- [x] **T002 — Atualizar meta tags e estilos do PWA em `src/app/+html.tsx`**
  - Adicionar `viewport-fit=cover` e `format-detection: telephone=no`.
  - Configurar ícones `apple-touch-icon` para 180x180, 192x192 e 512x512.
  - Implementar regras CSS para prevenção de zoom involuntário em formulários (font-size >= 16px).
  - Implementar bloqueio de scroll elástico excessivo (`overscroll-behavior-y: none`).
  - Remover tap highlight cinza do WebKit (`-webkit-tap-highlight-color: transparent`).
  - Proteger a barra de navegação inferior com `env(safe-area-inset-bottom)`.

- [x] **T003 — Blindar navegação de retorno em `src/view/pushOnce.ts`**
  - Adaptar `backOnce` para verificar `router.canGoBack()` e redirecionar para fallback quando não houver histórico de navegação.

- [x] **T004 — Escrever testes unitários em `tests/unit/pwaIphoneAppleHig.test.tsx`**
  - Cobrir meta tags, regras CSS do `+html.tsx`, fallback do `backOnce` e ergonomia dos alvos de toque (Apple HIG >= 44pt).

- [x] **T005 — Executar verificações e atualizar documentação**
  - Executar `npm run typecheck`, `npm run check:architecture` e `npm run test`.
  - Atualizar `docs/estado.md` e `README.md` com as métricas exatas e conferência com `npm run check:docs`.

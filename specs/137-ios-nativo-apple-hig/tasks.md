# Tarefas — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG

**Responsável Principal:** Eric Vinícius (`@Eric2025gh`)  
**Detalhamento completo das issues:** [`issues.md`](./issues.md)

- [ ] **T001 (Issue #1) — ADR de escopo iOS Nativo e configuração `ios` em `app.json`**
  - Atualizar escopo de iOS Nativo via ADR vinculado ao ADR 0008.
  - Configurar `ios` em `app.json` (`bundleIdentifier`, `infoPlist` em PT-BR, ícones, deep links) e validar `npm run check:build-config`.

- [ ] **T002 (Issue #2) — Base Liquid Glass e componentes Apple HIG no Design System**
  - Implementar suporte isolado `Platform.OS === 'ios'` em `ScreenContainer`, `ConnectedNavigationBar`, `TopAppBar` e `BottomSheet`.
  - Adicionar suporte a Reduzir Transparência, alvos `≥ 44×44 pt` e feedback tátil (*Haptics*).

- [ ] **T003 (Issue #3) — Adequar Fluxo 01: Acesso e Onboarding (17 telas Figma)**
  - Adequar `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` para iPhone nativo.

- [ ] **T004 (Issue #4) — Adequar Fluxos 02 e 03: Descoberta, Detalhe do Livro e Perfil Público (22 telas Figma)**
  - Adequar `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx` e `perfil/[userId].tsx`.

- [ ] **T005 (Issue #5) — Adequar Fluxos 04 e 05: Publicação e Minha Estante (29 telas Figma)**
  - Adequar `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx` e `pedidos-recebidos.tsx`.

- [ ] **T006 (Issue #6) — Adequar Fluxos 06 e 08: Conversas, Negociação, Encontro e Compartilhamento (24 telas Figma)**
  - Adequar `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx` e `perfil/convidar.tsx`.

- [ ] **T007 (Issue #7) — Adequar Fluxos 07, 09 e 10: Perfil, Conta, Ajuda, Moderação e Estados Globais (33 telas Figma)**
  - Adequar todas as rotas de `perfil/*`, `notificacoes.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar*`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` e `+not-found.tsx`.

- [ ] **T008 (Issue #8) — Adequar Fluxos 11 e 12: Permissões iOS, Dynamic Island/Live Activity, Dark Mode, Reduzir Transparência e Dynamic Type / VoiceOver (19 telas Figma)**
  - Garantir acessibilidade iOS completa, fallbacks de transparência e verificação final em simulador iPhone.

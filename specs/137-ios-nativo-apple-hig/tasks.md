# Tarefas — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG

**Responsável Principal:** Eric Vinícius (`@Eric2025gh`)  
**Detalhamento completo das issues:** [`issues.md`](./issues.md)

- [ ] **T001 (Issue #1) — ADR de escopo iOS Nativo e configuração `ios` em `app.json`**
  - Atualizar escopo de iOS Nativo via ADR vinculado ao ADR 0008.
  - Configurar `ios` em `app.json` (`bundleIdentifier`, `infoPlist` em PT-BR, ícones, deep links) e validar `npm run check:build-config`.

- [x] **T002 (Issue #2) — Base Liquid Glass e componentes Apple HIG no Design System**
  - Implementar suporte isolado `Platform.OS === 'ios'` em `ScreenContainer`, `ConnectedNavigationBar`, `TopAppBar` e `BottomSheet`.
  - Adicionar suporte a Reduzir Transparência, alvos `≥ 44×44 pt` e feedback tátil (*Haptics*).

- [ ] **T003 (Issue #3) — Adequar Fluxo 01: Acesso e Onboarding (17 telas Figma)**
  - Adequar `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` para iPhone nativo.

- [ ] **T004 (Issue #4) — Adequar Fluxos 02 e 03: Descoberta, Detalhe do Livro e Perfil Público (22 telas Figma)**
  - Implementadas adequações de Apple HIG em Descoberta, Busca, Favoritos, Detalhe do Livro e Perfil Público (PR #240).
  - *Pendências para conclusão formal:* adequação das rotas de gestão de alertas (`alertas/[id].tsx` e `alertas/[id]/editar.tsx`) e registro da validação conjunta em aparelho real / simulador iPhone com `@Eric2025gh`.

- [ ] **T005 (Issue #5) — Adequar Fluxos 04 e 05: Publicação e Minha Estante (29 telas Figma)**
  - Adequar `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx` e `pedidos-recebidos.tsx`.

- [x] **T006 (Issue #6 / Issue #231) — Adequar Fluxos 06 e 08: Conversas, Negociação, Encontro e Compartilhamento (24 telas Figma)**
  - Adequar `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx` e `perfil/convidar.tsx`.
  - Na #231, validar no iPhone que o campo do chat acompanha o teclado e respeita a área segura com o teclado fechado, que a câmera do QR fica abaixo da área segura superior e que o convite abre a folha nativa e oferece cópia do link com confirmação.
  - Ajuste do campo do chat e ação de copiar o link implementados. O leitor de QR já está dentro da área segura da tela de entrega. Validação automatizada com `npm run typecheck` e `npm run test:coverage` (2.317 testes aprovados).
  - No iPhone com Expo Go, o usuário confirmou o teclado do chat, o fluxo de encontro e entrega por QR, a cópia do link e o envio da mensagem e do link pela opção **Compartilhar texto**. O envio conjunto do cartão e do texto omitiu o texto no aplicativo de destino testado, que recebeu a mensagem com a opção de envio separado.

- [ ] **T007 (Issue #7) — Adequar Fluxos 07, 09 e 10: Perfil, Conta, Ajuda, Moderação e Estados Globais (33 telas Figma)**
  - Adequar todas as rotas de `perfil/*`, `notificacoes.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar*`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` e `+not-found.tsx`.

- [ ] **T008 (Issue #8 / Issue #233) — Adequar Fluxos 11 e 12: Permissões iOS, Dynamic Island/Live Activity, Reduzir Transparência e Dynamic Type / VoiceOver (19 telas Figma)**
  - Entregue por Maria Clara (`@clarinhamartins`): Acessibilidade Digital Apple HIG no Design System (Reduzir Transparência com fallback opaco, Dynamic Type com maxFontSizeMultiplier e semântica completa para VoiceOver, com 11 testes unitários dedicados em `iosAccessibilityHig.test.tsx`).
  - *Pendências para conclusão integral da issue:* Telas de permissão nativas (`11.01` a `11.04` por `@Eric2025gh`) e contratos de Live Activity/Dynamic Island (`11.05` a `11.09` por `@MICAELCARDOSOREIS`).

- [ ] **T009 — Sign in with Apple (obrigatório na App Store)**
  - Integrar login nativo com Apple (`expo-apple-authentication` + Supabase Auth) isolado para iOS, garantindo conformidade com a regra da App Store quando há login social (Google).

- [ ] **T010 — Notificações Push no iOS (`APNs`)**
  - Configurar APNs no Expo/Supabase, permissão nativa de notificações, badge no ícone e navegação por deep link ao tocar na notificação.

- [ ] **T011 — Build iOS, `PrivacyInfo.xcprivacy` e TestFlight**
  - Configurar perfil iOS de build (`eas.json`), manifesto de privacidade da Apple e distribuição via TestFlight para testes da equipe em iPhone.

- [ ] **T012 — Auditoria Visual Final × Figma (`APP · 20 · iPhone · iOS 26`)**
  - Conferir lado a lado tipografia, Liquid Glass, contrastes e estados vazios contra as 144 telas de `design-system/telas-iphone-figma.md`.

- [ ] **T013 — Verificação final, QA iOS e regressão zero em Android e Web**
  - Validar em simulador/iPhone real (Safe Areas, teclado, VoiceOver, Dynamic Type) e executar `npm run typecheck`, `npm run lint`, `npm run check:architecture`, `npm run check:design-system`, `npm run test` e `npm run check:docs`.

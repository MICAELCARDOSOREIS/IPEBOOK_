# Tarefas — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG

**Responsável Principal:** Eric Vinícius (`@Eric2025gh`)  
**Detalhamento completo das issues:** [`issues.md`](./issues.md)  
**Inventário Figma atualizado (iOS 26 · Tema Claro):** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md)

- [x] **T001 (Issue #226) — ADR de escopo iOS Nativo e configuração `ios` em `app.json`**
  - Escopo de iOS Nativo em tema claro exclusivo consolidado pela Spec 139 / ADR 0114; seção `ios` em `app.json` configurada com `buildNumber: "1"`, `supportsTablet: false`, `bundleIdentifier` e `infoPlist` completo em PT-BR (`80bd12b` por `@Eric2025gh`).
  - *Validação:* `npm run check:build-config` aprovado; conferência em hardware real pendente com `npx expo config --type public`.

- [x] **T002 (Issue #227) — Base Liquid Glass e componentes Apple HIG no Design System**
  - Entregue nos PRs `#239` (`@clarinhamartins`) e `#241` (`@MICAELCARDOSOREIS`) e refinada no alinhamento Figma iOS 26 (`585ed3c` por `@clarinhamartins`): tokens `ios` (`cell`, `separator`, `destructiveFill`), botão voltar Liquid Glass circular 44×44 e título centrado em `TopAppBar`, bordas/preenchimento `ios` em `TextField` e cartão Liquid Glass com ação destrutiva `#f9dedc` em `Dialog`.

- [ ] **T003 (Issue #228) — Adequar Fluxo de Acesso e Onboarding**
  - Refinos iOS 26 aplicados em `welcome.tsx` (badge de localização, pílulas de modalidade contínuas e *Haptics*) e `authCallback.tsx` (`TextButton` ≥ 44 pt) em `15b87b8` (`@Eric2025gh`), somados ao suporte iOS em `OutlinedButton`, `FilledButton` e `TextField`.
  - *Pendências para fechamento:* homologação em iPhone real (Safe Area, teclado sobre CTAs e VoiceOver) contra os quadros `01`–`04`, `09`, `51`–`52`.

- [ ] **T004 (Issue #229) — Adequar Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público**
  - Entregues adequações Apple HIG (PR `#240` + PR `#243` para `alertas/[id]`) e refino Liquid Glass + háptica nos cards de `CatalogCarousel` e `SearchBookCard` (`324534d` por `@clarinhamartins`).
  - *Pendências para fechamento:* validação final em aparelho real / simulador iPhone com `@Eric2025gh` na auditoria `#237`.

- [ ] **T005 (Issue #230) — Adequar Publicação (ISBN, Câmera, Fotos, Rascunhos), Minha Estante e Pedidos**
  - Implementação local entregue em `dcef8369` (`anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`) com acesso aos Ajustes do iPhone, entrada manual de ISBN, ação Concluir no teclado numérico, salvamento de rascunho e diálogos destrutivos.
  - *Pendências para fechamento:* homologação em iPhone pelo Eric e conferência visual contra os quadros `14`–`16`, `17`, `19`, `33`–`35`, `34B`, `55`, `58` e `997:2248`.

- [x] **T006 (Issue #231) — Adequar Conversas, Negociação, Encontro, Entrega e Compartilhamento**
  - Implementação e validação em iPhone com Expo Go concluídas (`9eba578e`, `40aee97f`, `c71bed35`) cobrindo chat com teclado/safe area, leitor de QR Code, encontro/entrega e compartilhamento de texto/link.
  - *Conferência pós-redesign Figma:* checar alinhamento visual com Seção `04` (`18`, `43`–`46`, `50`), `27`, `54` e protótipos `08` (`937:2829`, `3131`–`3391`) durante a auditoria #237.

- [ ] **T007 (Issue #232) — Adequar Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais**
  - Alinhamentos visuais iOS 26 implementados (`e6170f1` e `1c1bf18` por `@Eric2025gh`): superfícies Liquid Glass e ícones verdes em `ProfileHubSections`, `OfflineState` e `ErrorState`, cards e controles em `settings`, cartões elevados `iosNeutralCardStyle` (`radius.xl`, borda `outlineVariant`, sombra quente) e títulos/ícones em `notificationsStyles`, `security`, `receivedRatings`, `blockedUsers`, `meetingHistory` e `moderation`.
  - *Pendências para fechamento:* homologação visual em iPhone para listas agrupadas estáticas de Configurações (`937:3426`) e moderação/denúncias (`916:2342`–`2428`).

- [ ] **T008 (Issue #233) — Permissões iOS, Reduzir Transparência, Dynamic Type e VoiceOver (Tema Claro)**
  - Entregue por Maria Clara (`@clarinhamartins`) no PR `#242`: Acessibilidade Digital Apple HIG no Design System (Reduzir Transparência com fallback opaco, Dynamic Type com `maxFontSizeMultiplier` e semântica completa para VoiceOver, com 11 testes unitários dedicados em `iosAccessibilityHig.test.tsx`).
  - *Nota de escopo:* Dark Mode foi removido pela Spec 139 / ADR 0114; a página Figma atual opera exclusivamente em tema claro e não possui telas de Dynamic Island / Live Activity.
  - *Pendências para fechamento:* fluxos de permissão nativas no iOS (`Notificações · permissões` `937:2386`, câmera/galeria) por `@Eric2025gh` e conferência final contra `937:3534` (texto maior) e `937:3645` (transparência reduzida).

- [ ] **T009 (Issue #234 — `@Eric2025gh`) — Sign in with Apple (obrigatório na App Store)**
  - Integrar login nativo com Apple (`expo-apple-authentication` + Supabase Auth + Service ID / provedor Apple no Supabase) isolado para iOS nas telas `02 · Entrar` (`915:434`) e `03 · Criar conta` (`916:119`).

- [ ] **T010 (Issue #235 — `@Eric2025gh`) — Notificações Push no iOS (`APNs`)**
  - Implementação local entregue em `2a7a9d98` (atualização de selo/badge, abertura de conversa/negociação/central ao tocar e pedido de permissão).
  - *Pendências para fechamento (`@Eric2025gh`):* vincular credenciais APNs (`eas credentials -p ios`), implantar versão revisada de `enviar-push` no Supabase e homologar em iPhone assinado / TestFlight (`28 · Notificações` `916:2169` e `937:2386`).

- [ ] **T011 (Issue #236 — `@Eric2025gh`) — Build iOS, `PrivacyInfo.xcprivacy` e TestFlight**
  - Configurar perfil iOS de build (`eas.json`), manifesto de privacidade da Apple e distribuição via TestFlight para testes da equipe em iPhone.

- [ ] **T012 (Issue #237 — `@Eric2025gh`) — Auditoria Visual Final × Figma (`APP · 20 · iPhone · iOS 26`)**
  - Conferir lado a lado em iPhone tipografia, Liquid Glass, contrastes, listas agrupadas e estados vazios/carregamento/erro contra todos os quadros atualizados de [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md).

- [ ] **T013 (Issue #238 — `@Eric2025gh`) — Verificação final, QA iOS e regressão zero em Android e Web**
  - Validar em simulador/iPhone real (Safe Areas, teclado, *swipe back*, VoiceOver, Dynamic Type e Reduzir Transparência) e executar `npm run validate`.

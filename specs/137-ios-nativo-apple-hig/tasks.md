# Tarefas — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG

**Responsável Principal:** Eric Vinícius (`@Eric2025gh`)  
**Detalhamento completo das issues:** [`issues.md`](./issues.md)  
**Inventário Figma atualizado (iOS 26 · Tema Claro):** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md)

- [ ] **T001 (Issue #226) — ADR de escopo iOS Nativo e configuração `ios` em `app.json`**
  - Atualizar escopo de iOS Nativo via ADR vinculado aos ADRs 0008 e 0114 (tema claro exclusivo).
  - Configurar `ios` em `app.json` (`bundleIdentifier`, `infoPlist` em PT-BR, ícones, deep links) e validar `npm run check:build-config`.

- [x] **T002 (Issue #227) — Base Liquid Glass e componentes Apple HIG no Design System**
  - Entregue nos PRs `#239` (`@clarinhamartins`) e `#241` (`@MICAELCARDOSOREIS`): suporte isolado `Platform.OS === 'ios'` em `ScreenContainer`, `ConnectedNavigationBar`, `TopAppBar`, `BottomSheet`, botões, formulários e cards, com fallback para Reduzir Transparência, alvos `≥ 44×44 pt` e *Haptics*.
  - *Conferência pós-redesign Figma:* comparar acabamento final com as pranchas `09` (`952:2303`) e `10` (`957:2903`) na auditoria #237.

- [ ] **T003 (Issue #228) — Adequar Fluxo de Acesso e Onboarding**
  - Adequar `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` para iPhone nativo conforme quadros `01`–`04`, `09`, `51`–`52` e Prancha `09` (`952:2303`).

- [ ] **T004 (Issue #229) — Adequar Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público**
  - Implementadas adequações de Apple HIG em Descoberta, Busca, Favoritos, Detalhe do Livro e Perfil Público (PR `#240` por `@clarinhamartins`).
  - Rotas `alertas/[id].tsx` e `alertas/[id]/editar.tsx` submetidas no PR `#243` (aberto para revisão/merge).
  - *Pendências para fechamento:* merge do PR `#243`, conferência visual contra os novos quadros da Seção `02` + `36`/`40` + `53` + protótipos `08`, e validação em aparelho real / simulador iPhone com `@Eric2025gh`.

- [ ] **T005 (Issue #230) — Adequar Publicação (ISBN, Câmera, Fotos, Rascunhos), Minha Estante e Pedidos**
  - Implementação local entregue em `dcef8369` (`anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`) com acesso aos Ajustes do iPhone, entrada manual de ISBN, ação Concluir no teclado numérico, salvamento de rascunho e diálogos destrutivos.
  - *Pendências para fechamento:* homologação em iPhone pelo Eric e conferência visual contra os quadros `14`–`16`, `17`, `19`, `33`–`35`, `34B`, `55`, `58` e `997:2248`.

- [x] **T006 (Issue #231) — Adequar Conversas, Negociação, Encontro, Entrega e Compartilhamento**
  - Implementação e validação em iPhone com Expo Go concluídas (`9eba578e`, `40aee97f`, `c71bed35`) cobrindo chat com teclado/safe area, leitor de QR Code, encontro/entrega e compartilhamento de texto/link.
  - *Conferência pós-redesign Figma:* checar alinhamento visual com Seção `04` (`18`, `43`–`46`, `50`), `27`, `54` e protótipos `08` (`937:2829`, `3131`–`3391`) durante a auditoria #237.

- [ ] **T007 (Issue #232) — Adequar Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais**
  - Adequar todas as rotas de `perfil/*`, `notificacoes.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar*`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` e `+not-found.tsx`.
  - Seguir os novos quadros do Figma: Seções `01` (`05`–`08`, `10`), `05` (`11`, `20`–`26`, `28`, `49`), `06` (`31`, `39`, `41`, `42`), `07` (`21B`, `24B`, `31B`), `08` (listas agrupadas e título compacto em Configurações), `10` (alertas/menus) e `11` (`56`, `57`, `59`).

- [ ] **T008 (Issue #233) — Permissões iOS, Reduzir Transparência, Dynamic Type e VoiceOver (Tema Claro)**
  - Entregue por Maria Clara (`@clarinhamartins`) no PR `#242`: Acessibilidade Digital Apple HIG no Design System (Reduzir Transparência com fallback opaco, Dynamic Type com `maxFontSizeMultiplier` e semântica completa para VoiceOver, com 11 testes unitários dedicados em `iosAccessibilityHig.test.tsx`).
  - *Nota de escopo:* Dark Mode foi removido pela Spec 139 / ADR 0114; a página Figma atual opera exclusivamente em tema claro e não possui telas de Dynamic Island / Live Activity.
  - *Pendências para fechamento:* fluxos de permissão nativas no iOS (`Notificações · permissões` `937:2386`, câmera/galeria) por `@Eric2025gh` e conferência final contra `937:3534` (texto maior) e `937:3645` (transparência reduzida).

- [ ] **T009 (Issue #234) — Sign in with Apple (obrigatório na App Store)**
  - Integrar login nativo com Apple (`expo-apple-authentication` + Supabase Auth) isolado para iOS nas telas `02 · Entrar` (`915:434`) e `03 · Criar conta` (`916:119`), garantindo conformidade com a regra da App Store quando há login com Google.

- [ ] **T010 (Issue #235) — Notificações Push no iOS (`APNs`)**
  - Implementação local entregue em `2a7a9d98` (atualização de selo/badge, abertura de conversa/negociação/central ao tocar e pedido de permissão).
  - *Pendências para fechamento:* vincular credenciais APNs (`eas credentials -p ios`), implantar versão revisada de `enviar-push` no Supabase e homologar em iPhone assinado / TestFlight pelo Eric (`28 · Notificações` `916:2169` e `937:2386`).

- [ ] **T011 (Issue #236) — Build iOS, `PrivacyInfo.xcprivacy` e TestFlight**
  - Configurar perfil iOS de build (`eas.json`), manifesto de privacidade da Apple e distribuição via TestFlight para testes da equipe em iPhone.

- [ ] **T012 (Issue #237) — Auditoria Visual Final × Figma (`APP · 20 · iPhone · iOS 26`)**
  - Conferir lado a lado tipografia, Liquid Glass, contrastes, listas agrupadas e estados vazios/carregamento/erro contra todos os quadros atualizados de [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md).

- [ ] **T013 (Issue #238) — Verificação final, QA iOS e regressão zero em Android e Web**
  - Validar em simulador/iPhone real (Safe Areas, teclado, *swipe back*, VoiceOver, Dynamic Type e Reduzir Transparência) e executar `npm run validate`.

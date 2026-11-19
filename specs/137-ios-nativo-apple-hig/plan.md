# Plano de Execução — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG e Liquid Glass

**Responsável Principal:** Eric Vinícius dos Santos Oliveira (`@Eric2025gh`)  
**Estratégia:** Execução incremental por sub-issues isoladas na branch `develop` (via feature branches derivadas de `develop`), mantendo Android (MD3) e Web 100% preservados em cada entrega e operando exclusivamente no tema claro editorial (Spec 139 / ADR 0114).

---

## Fase 0 — Governança, ADR e Configuração Nativa iOS (`app.json`) — Issue #226 (`T001`)
- Registrar ADR formal atualizando a entrada do **iOS Nativo** em escopo (vinculado ao [ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md) e [ADR 0114](../../docs/adr/0114-remocao-tema-escuro.md)).
- Configurar a seção `ios` em `app.json`:
  - `supportsTablet`, `bundleIdentifier`, `buildNumber`.
  - `infoPlist` em português (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`).
  - `associatedDomains` / esquemas de URL para deep links e login Google/Apple no iOS.
- Validar `npm run check:build-config`.

## Fase 1 — Fundação Apple HIG e Liquid Glass no Design System — Issue #227 (`T002`)
- *(Entregue nos PRs `#239` e `#241`; pendente apenas conferência visual contra as pranchas `09` e `10` do Figma iOS 26.)*
- Ramificação isolada para `Platform.OS === 'ios'` (ou arquivos `.ios.tsx`):
  - `ScreenContainer`, `ConnectedNavigationBar`, `TopAppBar`, `BottomSheet`, botões, formulários e cards.
  - Fallback automático opaco para **Reduzir Transparência** (`AccessibilityInfo.isReduceTransparencyEnabled`) e **Haptics** (`expo-haptics`).

## Fase 2 — Acesso, Onboarding e Boas-vindas — Issue #228 (`T003`)
- Adequar `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` segundo os quadros `01`–`04`, `09`, `51`–`52` e Prancha `09` (`952:2303`).
- Garantir teclado iOS sem cobrir botões de ação, campos `--ios-cell` (`#f7f3ec`) com borda de foco `#4e8a68`, mensagens de erro acessíveis ao VoiceOver e fluxo de seleção de bairro em Piripiri.

## Fase 3 — Descoberta, Busca, Favoritos, Alertas, Detalhe e Perfil Público — Issue #229 (`T004`)
- *(Descoberta/Busca/Detalhe entregues no PR `#240`; rotas `alertas/[id].tsx` e `alertas/[id]/editar.tsx` no PR `#243` aberto; pendente validação em iPhone e conferência contra Seção `02`, `36`, `40`, `53` e protótipos `08`.)*
- Adequar `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx` e `perfil/[userId].tsx`.

## Fase 4 — Publicação, Rascunhos, Estante e Pedidos — Issue #230 (`T005`)
- *(Implementação local entregue no commit `dcef8369`; pendente homologação em iPhone pelo Eric e conferência visual contra Seções `03`, `04` (`17`, `19`), `07` (`34B`), `08` (`997:2248`) e `11` (`55`, `58`).)*
- Adequar `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`.

## Fase 5 — Conversas, Negociação, Encontro, Entrega e Compartilhar — Issue #231 (`T006`)
- *(Implementado e validado no iPhone com Expo Go nos commits `9eba578e`, `40aee97f`, `c71bed35`; manter conferência final na auditoria contra Seção `04`, `27`, `08` e `54`.)*
- `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx` e `perfil/convidar.tsx`.

## Fase 6 — Perfil, Conta, Ajuda, Moderação e Estados Globais — Issue #232 (`T007`)
- Adequar `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `perfil/encontros.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` e `+not-found.tsx`.
- Referência Figma: Seções `01` (`05`–`08`, `10`), `05` (`11`, `20`–`26`, `28`, `49`), `06` (`31`, `39`, `41`, `42`), `07` (`21B`, `24B`, `31B`), `08` (listas agrupadas `937:3426`, título compacto `937:3480`, Conta e dados `937:3588`, Preferências `937:3616`), `10` (`957:2903`) e `11` (`56`, `57`, `59`).

## Fase 7 — Permissões, Acessibilidade, Auth Apple, Push, Build e Auditoria Visual — Issues #233–#238 (`T008`–`T013`)
- **#233 (`T008`):** Acessibilidade Apple HIG (Reduzir Transparência, Dynamic Type e VoiceOver — sem Dark Mode) entregue por Maria Clara no PR `#242`; finalizar fluxos nativos de permissão (`937:2386`) e conferência contra `937:3534` e `937:3645`.
- **#234 (`T009`):** Implementar Sign in with Apple (`expo-apple-authentication`).
- **#235 (`T010`):** Implementação local APNs entregue em `2a7a9d98`; homologar credenciais APNs, função `enviar-push` e testes em iPhone assinado/TestFlight.
- **#236 (`T011`):** Build iOS (`eas.json`), `PrivacyInfo.xcprivacy` e TestFlight.
- **#237 (`T012`):** Auditoria visual lado a lado contra todas as seções de [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md).
- **#238 (`T013`):** Verificação final no iPhone e regressão zero em Android (MD3) e Web (`npm run validate`).

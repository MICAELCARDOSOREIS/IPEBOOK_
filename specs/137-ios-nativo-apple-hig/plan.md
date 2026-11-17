# Plano de Execução — Spec 137: iOS Nativo (Todas as Telas) no Padrão Apple HIG e Liquid Glass

**Responsável Principal:** Eric Vinícius dos Santos Oliveira (`@Eric2025gh`)  
**Estratégia:** Execução incremental por sub-issues isoladas na branch `develop` (via feature branches derivadas de `develop`), mantendo Android (MD3) e Web 100% preservados em cada entrega.

---

## Fase 0 — Governança, ADR e Configuração Nativa iOS (`app.json`)
- Criar ADR formal registrando a entrada do **iOS Nativo** em escopo (atualizando a nota de escopo do [ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)).
- Configurar a seção `ios` em `app.json`:
  - `supportsTablet`, `bundleIdentifier`, `buildNumber`.
  - `infoPlist` em português (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`).
  - `associatedDomains` / esquemas de URL para deep links e login Google nativo no iOS.
- Validar `npm run check:build-config`.

## Fase 1 — Fundação Apple HIG e Liquid Glass no Design System
- Estender tokens e componentes base com ramificação isolada para `Platform.OS === 'ios'` (ou arquivos `.ios.tsx`):
  - `ScreenContainer`: Safe Areas nativas iOS + comportamento de `KeyboardAvoidingView`.
  - `ConnectedNavigationBar` (Tab Bar flutuante): estilo Liquid Glass (`glass-fill` / `glass-stroke`) e respeito ao Home Indicator.
  - `TopAppBar`: alinhamento iOS, botão voltar nativo e área de toque `≥ 44×44 pt`.
  - `BottomSheet` / Modais: *drag handle* no topo, cantos contínuos e fechamento por gesto.
  - Utilitário de acessibilidade para **Reduzir Transparência** (`AccessibilityInfo.isReduceTransparencyEnabled`) e **Haptics** (`expo-haptics` quando aplicável).

## Fase 2 — Fluxo 01: Acesso e Onboarding (17 telas Figma)
- Adequar `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx`.
- Garantir teclado iOS sem cobrir botões de ação, mensagens de erro acessíveis ao VoiceOver e fluxo de seleção de bairro em Piripiri.

## Fase 3 — Fluxos 02 e 03: Descoberta, Detalhe do Livro e Perfil Público (22 telas Figma)
- Adequar `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx` e `perfil/[userId].tsx`.
- Barra de busca estilo iOS, galeria de fotos com swipe fluido, CTA fixo na Thumb Zone acima do Home Indicator e compartilhamento via `Share.share` nativo.

## Fase 4 — Fluxos 04 e 05: Publicação e Minha Estante (29 telas Figma)
- Adequar `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`.
- Fluxo de câmera (leitura de ISBN) e galeria com tratamento nativo de permissões negadas no iOS (botão para abrir Ajustes do iOS via `Linking.openSettings()`).

## Fase 5 — Fluxos 06 e 08: Conversas, Negociação, Encontro e Compartilhar (24 telas Figma)
- Adequar `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx` e `perfil/convidar.tsx`.
- Campo de mensagem fixo acima do teclado iOS sem sobreposição do Home Indicator, modais de proposta/contraproposta e conclusão por QR Code.

## Fase 6 — Fluxos 07, 09 e 10: Perfil, Conta, Ajuda, Moderação e Estados Globais (33 telas Figma)
- Adequar `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` e `+not-found.tsx`.
- Listas agrupadas estilo iOS, confirmações destrutivas claras e banner offline/loading respeitando Dynamic Island.

## Fase 7 — Fluxos 11 e 12: Recursos iOS, Acessibilidade e Validação Final (19 telas Figma)
- Validar Dark Mode iOS, Reduzir Transparência, Dynamic Type (texto grande) e VoiceOver em todas as rotas.
- Preparar contratos/estruturas para **Live Activity / Dynamic Island** no acompanhamento de encontro (`encontro.tsx`).
- Rodar suíte completa:
  ```bash
  npm run typecheck
  npm run lint
  npm run check:architecture
  npm run check:design-system
  npm run test
  ```

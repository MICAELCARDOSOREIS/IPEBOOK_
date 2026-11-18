# Especificação 137 — [iOS Nativo] Adequar todas as telas do iPhone ao Apple HIG e Liquid Glass

**Estado:** Em andamento (T002 e T004 entregues por Maria Clara em 2026-11-17)  
**Responsável Principal:** Eric Vinícius dos Santos Oliveira (`@Eric2025gh`, `pessoa:eric`)  
**Apoio e Entregas da Equipe:** Maria Clara Almeida Martins (`@clarinhamartins` — T002 e T004: Liquid Glass no Design System, ADR 0114, e Telas de Descoberta/Busca, ADR 0115), Micael Cardoso Reis (`@MICAELCARDOSOREIS`), Antonio Carlos Gomes (`@gomes738`)  
**Referências Principais:**
- [ADR 0008 — Diretrizes Visuais por Plataforma](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)
- [Inventário de Telas iPhone · iOS 26 (Figma)](../../design-system/telas-iphone-figma.md) (144 telas em 12 fluxos)
- [Spec 136 — PWA/iOS no Safari](../136-pwa-iphone-apple-hig/spec.md) (escopo Web/Safari; esta spec cobre **iOS Nativo**)

---

## 1. Contexto e Objetivo

O **IpêBook** utiliza Expo 58 / React Native com arquitetura MVVM em 7 camadas. Enquanto a versão **Android** segue estritamente o **Material Design 3** e a versão **Web** possui layout próprio (além dos ajustes de PWA no Safari documentados na Spec 136), a versão **iOS Nativa (iPhone)** precisa ser estruturada e adaptada em **todas as suas telas** para atender ao **Apple Human Interface Guidelines (HIG)** e à linguagem visual **Liquid Glass (iOS 26)** prevista no [ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md).

O **Eric Vinícius (`@Eric2025gh`)** assume a **responsabilidade principal** pela coordenação técnica, definição de escopo iOS, configuração nativa (`app.json` / `expo run:ios`), revisão de conformidade com o Apple HIG e validação de ponta a ponta das telas de iPhone, contando com apoio pontual dos demais integrantes nos módulos de cada área.

---

## 2. Mapeamento Completo: Rotas do App × Telas do Figma (144 telas)

Todas as **44 rotas** em `src/app/` (excluindo `+html.tsx` exclusivo de Web e `_layout.tsx` raiz) devem ser auditadas e adequadas no ambiente iOS (`Platform.OS === 'ios'`) segundo os **12 fluxos** de `design-system/telas-iphone-figma.md`:

| Fluxo Figma (iOS 26) | Qtd. Telas Figma | Rotas Correspondentes em `src/app/` | Foco Apple HIG / iOS Nativo |
| --- | --- | --- | --- |
| **01 · Acesso** | 17 | `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` | Safe Area superior/inferior, `KeyboardAvoidingView`, Sign in with Google/Apple link nativo, feedbacks de erro inline e foco acessível |
| **02 · Descoberta** | 16 | `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx` | Search bar estilo iOS, barra inferior flutuante Liquid Glass acima do Home Indicator, filtros em sheet nativo, pull-to-refresh iOS |
| **03 · Livro e comunidade** | 6 | `livro/[id].tsx`, `perfil/[userId].tsx` | Galeria com swipe suave, cabeçalho com botão voltar nativo (`chevron.left`), CTA fixo na Thumb Zone respeitando Home Indicator |
| **04 · Publicação** | 21 | `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx` | Câmera/ISBN com permissão `NSCameraUsageDescription`, seletor de fotos `NSPhotoLibraryUsageDescription`, teclado numérico/padrão com barra de conclusão |
| **05 · Estante** | 8 | `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx` | Segmented control / chips estilo iOS, estados vazios claros e sheets de confirmação nativos |
| **06 · Conversa e negociação** | 22 | `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx` | Chat com `KeyboardAvoidingView` nativo, composer acima do teclado/Home Indicator, ação de encontro/QR Code com feedback tátil |
| **07 · Perfil e conta** | 23 | `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx` | Listas agrupadas estilo iOS (*Inset Grouped*), modais de confirmação destrutiva em vermelho sistema, gestão de senha/sessão |
| **08 · Compartilhar** | 2 | Ações em `livro/[id].tsx` e `perfil/convidar.tsx` | Uso de `Share.share` nativo do iOS (UIActivityViewController) com fallback/feedback de link copiado |
| **09 · Ajuda e moderação** | 7 | `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx` | Formulários com teclado ajustado, sheets de bloqueio/denúncia com hierarquia clara |
| **10 · Estados do sistema** | 3 | `+not-found.tsx` + estados globais em todas as rotas | Skeletons suaves, banner offline sem sobrepor Dynamic Island, telas de erro com ação de tentar novamente |
| **11 · Recursos da plataforma** | 9 | Permissões (`index.tsx`, `anunciar.tsx`, `negociacao/[id]/encontro.tsx`, `notificacoes.tsx`) + `encontros.tsx` | Fluxos de permissão em PT-BR (`infoPlist`), preparo de contratos para Live Activity / Dynamic Island (acompanhamento de encontro) |
| **12 · Acessibilidade e temas** | 10 | Transversal a todas as 44 rotas | Dark Mode iOS, suporte a **Reduzir Transparência** (fallback sólido do Liquid Glass), **Dynamic Type** (texto grande) e **VoiceOver** |

**Total coberto:** 144 telas do Figma mapeadas às 44 rotas do aplicativo.

---

## 3. Requisitos Funcionais e Não Funcionais (Apple HIG)

- **RN-01 (Isolamento Absoluto de Plataforma):** Nenhuma adaptação de iOS pode alterar o layout, tokens visuais ou comportamento do **Android (Material Design 3)** nem da **Web**. Todo ajuste específico deve usar `Platform.OS === 'ios'`, arquivos `.ios.tsx` ou camada de tema por plataforma.
- **RN-02 (Arquitetura MVVM):** Views continuam puramente apresentacionais; nenhuma regra de negócio ou chamada direta ao Supabase pode ser adicionada nas telas.
- **RN-03 (Safe Areas Nativas no iPhone):** Todas as telas devem respeitar `SafeAreaView` / `useSafeAreaInsets()` para Dynamic Island / Notch no topo e Home Indicator na base, sem sobreposição de cabeçalhos, botões fixos ou dock inferior.
- **RN-04 (Navegação e Gestos iOS):** O `Stack` de navegação deve suportar o gesto nativo de voltar (*swipe back* da borda esquerda) no iOS, títulos e botão de retorno consistentes com Apple HIG.
- **RN-05 (Linguagem Visual Liquid Glass):** Controles flutuantes (dock inferior, pílulas de ação, cabeçalhos flutuantes) devem adotar superfícies translúcidas (`glass-fill` / `glass-stroke`) no iOS, com **fallback automático opaco** quando o usuário ativar "Reduzir Transparência" no iOS (`AccessibilityInfo.isReduceTransparencyEnabled`).
- **RN-06 (Ergonomia, Teclado e Haptics):**
  - Todos os alvos interativos devem ter área mínima de **44×44 pt**.
  - Todos os formulários devem usar `KeyboardAvoidingView` configurado para iOS (`behavior="padding"` com offset correto do header).
  - Ações principais (favoritar, publicar, confirmar encontro, erro) devem usar feedback tátil leve (*Haptics*) no iOS quando disponível.
- **RN-07 (Permissões e `infoPlist` em Português):** `app.json` deve declarar em `ios.infoPlist` mensagens claras em português explicando o uso de Câmera, Galeria de Fotos e Localização para os moradores de Piripiri.
- **RN-08 (Acessibilidade iOS):** Suporte ao **VoiceOver** (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) e escalonamento seguro de fontes (**Dynamic Type**) sem truncar botões ou quebrar cards.

---

## 4. Critérios de Aceite

| # | Critério | Verificação |
| --- | --- | --- |
| CA1 | Configuração `ios` em `app.json` completa (bundleIdentifier, `infoPlist` em PT-BR, ícones e deep links). | Inspeção de `app.json` e `npm run check:build-config`. |
| CA2 | Base Liquid Glass + Safe Areas + `KeyboardAvoidingView` isolada para iOS sem impactar Android/Web. | Testes unitários de componentes e `Platform.OS` mockado. |
| CA3 | Todas as 44 rotas de `src/app/` auditadas e adequadas nos 12 fluxos do Figma iOS 26. | Checklist por sub-issue + testes de renderização em modo iOS. |
| CA4 | Alvos de toque `≥ 44×44 pt`, suporte a Dark Mode, Reduzir Transparência, Dynamic Type e rótulos VoiceOver. | Testes de acessibilidade e auditoria manual no simulador iOS. |
| CA5 | Android (MD3) e Web permanecem 100% intactos e sem regressões. | Suíte completa verde (`npm run validate` / `npm run test`). |

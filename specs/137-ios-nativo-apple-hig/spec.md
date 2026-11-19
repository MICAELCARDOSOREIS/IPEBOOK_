# Especificação 137 — [iOS Nativo] Adequar todas as telas do iPhone ao Apple HIG e Liquid Glass

**Estado:** Em andamento (Base Liquid Glass, Descoberta/Busca, Acessibilidade Apple HIG, Negociação/Compartilhamento, Publicação local e Push local entregues; pendentes Acesso, Perfil/Conta/Moderação, Sign in with Apple, Config/Build iOS e Auditoria Visual contra o Figma iOS 26 atualizado)  
**Responsável Principal:** Eric Vinícius dos Santos Oliveira (`@Eric2025gh`, `pessoa:eric`)  
**Apoio e Entregas da Equipe:** Maria Clara Almeida Martins (`@clarinhamartins` — T002 Base Liquid Glass, ADR 0115; T004 Descoberta/Busca, ADR 0116 + PR #243 Alertas; T008 Acessibilidade Apple HIG, PR #242), Micael Cardoso Reis (`@MICAELCARDOSOREIS` — refinamentos DS PR #241 e contratos/arquitetura), Antonio Carlos Gomes (`@gomes738` — T005 Publicação/Rascunhos e T006/T010)  
**Referências Principais:**
- [ADR 0008 — Diretrizes Visuais por Plataforma](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)
- [ADR 0114 — Remoção do Tema Escuro (Tema Claro Exclusivo)](../../docs/adr/0114-remocao-tema-escuro.md)
- [Inventário de Telas iPhone · iOS 26 (Figma)](../../design-system/telas-iphone-figma.md) (Canvas `APP · 20 · iPhone · iOS 26`: 52 quadros principais, 4 estados após carregamento, 7 estados de catálogo/conversas/pedidos, 25 telas de protótipo nativo e 2 pranchas iOS 26)
- [Spec 136 — PWA/iOS no Safari](../136-pwa-iphone-apple-hig/spec.md) (escopo Web/Safari; esta spec cobre **iOS Nativo**)

---

## 1. Contexto e Objetivo

O **IpêBook** utiliza Expo 58 / React Native com arquitetura MVVM em 7 camadas. Enquanto a versão **Android** segue estritamente o **Material Design 3** e a versão **Web** possui layout próprio (além dos ajustes de PWA no Safari documentados na Spec 136), a versão **iOS Nativa (iPhone)** segue o **Apple Human Interface Guidelines (HIG)** e a linguagem visual **Liquid Glass (iOS 26)** em **tema claro exclusivo** (Spec 139 / ADR 0114), com fonte editorial (`Source Serif 4` / `Plus Jakarta Sans` no conteúdo e `SF Pro` nos controles nativos iOS).

O **Eric Vinícius (`@Eric2025gh`)** assume a **responsabilidade principal** pela coordenação técnica, configuração nativa (`app.json` / `expo run:ios`), revisão de conformidade com o Apple HIG, homologação em iPhone real/simulador e fechamento dos fluxos pendentes, contando com apoio dos demais integrantes nos módulos de cada área.

---

## 2. Mapeamento Completo: Rotas do App × Canvas Figma `APP · 20 · iPhone · iOS 26`

Todas as **44 rotas** em `src/app/` (excluindo `+html.tsx` exclusivo de Web e `_layout.tsx` raiz) são auditadas e adequadas no ambiente iOS (`Platform.OS === 'ios'`) segundo as **11 seções** de [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md):

| Seção / Bloco Figma (iOS 26 · Tema Claro) | Quadros no Figma | Rotas Correspondentes em `src/app/` | Foco Apple HIG / iOS 26 |
| --- | --- | --- | --- |
| **01 · Acesso, boas-vindas e ajuda** (acesso) | `01`–`04`, `09`, `51`–`52` | `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx` | Safe Area superior/inferior, `KeyboardAvoidingView`, campos `--ios-cell` (`#f7f3ec`) com foco `#4e8a68`, Sign in with Apple nativo, estados de carregamento/erro (`51`–`52`) |
| **02 · Catálogo, favoritos e alertas** + Perfil público | `12`, `13`, `29`, `30`, `32`, `37`, `38`, `47`, `48` + `36`, `40` + `53` | `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx`, `perfil/[userId].tsx` | Dock flutuante Liquid Glass, busca ativa (`937:2434`), filtros translúcidos em sheet (`937:2603`/`2709`), swipe na galeria, CTA fixo na Thumb Zone e Haptics |
| **03 · Anúncios e rascunhos** + Estante/Pedidos | `14`–`16`, `33`–`35`, `34B` + `17`, `19` + `55`, `58` | `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx` | Câmera/ISBN com acesso a Ajustes (`Linking.openSettings()`), teclado numérico com Concluir, Segmented Control iOS (`952:2355`), confirmação destrutiva de descarte (`997:2248`) |
| **04 · Conversas, encontros e entrega** + Convidar | `18`, `43`–`46`, `50` + `27` + `54` | `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx`, `perfil/convidar.tsx` | `KeyboardAvoidingView` no chat (`937:3258`), agendamento nativo Data/Horário/Local (`957:2903`), câmera QR abaixo da Safe Area, `Share.share` nativo (`937:2829`) |
| **05 · Perfil e conta** + **06 · Moderação** + **01** (ajuda/institucional) + **07**/**11** | `05`–`08`, `10`, `11`, `20`–`26`, `28`, `49`, `31`, `39`, `41`, `42`, `21B`, `24B`, `31B`, `56`, `57`, `59` | `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `perfil/encontros.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx`, `+not-found.tsx` | Listas agrupadas estilo iOS (`937:3426`, `3588`, `3616`), título compacto ao rolar (`937:3480`), alertas/ações destrutivas (`957:2903`), banners offline/erro (`56`–`59`) sem cobrir Dynamic Island |
| **08 · Protótipo nativo** + **09/10 · Pranchas iOS 26** (Transversal) | `937:2036`, `952:2303`, `957:2903` | Transversal a todas as 44 rotas | Permissões (`937:2386`), **Reduzir Transparência** (`937:3645`), **Dynamic Type / Texto maior** (`937:3534`) e **VoiceOver** |

**Total coberto no Figma:** 52 quadros principais (`01`–`52`) + 4 estados após carregamento (`21B`, `24B`, `31B`, `34B`) + 7 estados iOS 26 (`53`–`59`) + 25 quadros do protótipo nativo + 2 pranchas iOS 26, mapeados às 44 rotas do aplicativo.

---

## 3. Requisitos Funcionais e Não Funcionais (Apple HIG)

- **RN-01 (Isolamento Absoluto de Plataforma):** Nenhuma adaptação de iOS pode alterar o layout, tokens visuais ou comportamento do **Android (Material Design 3)** nem da **Web**. Todo ajuste específico deve usar `Platform.OS === 'ios'`, arquivos `.ios.tsx` ou tokens/estilos condicionais exclusivos para iOS.
- **RN-02 (Tema Claro Exclusivo):** Conforme a Spec 139 / ADR 0114 e o Guia do Figma (`915:384`), não há Dark Mode; todas as superfícies Liquid Glass e folhas nativas operam exclusivamente no tema claro editorial.
- **RN-03 (Arquitetura MVVM):** Views continuam puramente apresentacionais; nenhuma regra de negócio ou chamada direta ao Supabase pode ser adicionada nas telas.
- **RN-04 (Safe Areas Nativas no iPhone):** Todas as telas devem respeitar `SafeAreaView` / `useSafeAreaInsets()` para Dynamic Island / Notch no topo e Home Indicator na base, sem sobreposição de cabeçalhos, botões fixos ou dock inferior.
- **RN-05 (Navegação e Gestos iOS):** O `Stack` de navegação deve suportar o gesto nativo de voltar (*swipe back* da borda esquerda) no iOS, títulos e botão de retorno consistentes com Apple HIG.
- **RN-06 (Linguagem Visual Liquid Glass — Prancha 09):** Controles flutuantes (dock inferior, filtros translúcidos, botões secundários de vidro, cabeçalhos flutuantes) adotam superfícies translúcidas (`--glass-fill` / `--glass-stroke`) no iOS, com **fallback automático opaco** (`surfaceContainer`) quando o usuário ativar "Reduzir Transparência" (`AccessibilityInfo.isReduceTransparencyEnabled`). Campos de formulário usam `--ios-cell` (`#f7f3ec`) e borda de foco `--focus-ring` (`#4e8a68`).
- **RN-07 (Ergonomia, Teclado, Alertas e Haptics — Prancha 10):**
  - Todos os alvos interativos devem ter área mínima de **44×44 pt**.
  - Todos os formulários devem usar `KeyboardAvoidingView` configurado para iOS (`behavior="padding"` com offset correto do header).
  - Confirmações destrutivas e menus contextuais seguem a Prancha 10 (`957:2903`: ação destrutiva clara, botão cancelar sem destaque).
  - Ações principais (favoritar, publicar, confirmar encontro, erro) usam feedback tátil leve (*Haptics*) no iOS quando disponível.
- **RN-08 (Permissões e `infoPlist` em Português):** `app.json` deve declarar em `ios.infoPlist` mensagens claras em português explicando o uso de Câmera, Galeria de Fotos e Localização para os moradores de Piripiri.
- **RN-09 (Acessibilidade iOS):** Suporte completo ao **VoiceOver** (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) e escalonamento seguro de fontes (**Dynamic Type**) sem truncar botões ou quebrar cards.

---

## 4. Critérios de Aceite

| # | Critério | Verificação |
| --- | --- | --- |
| CA1 | Configuração `ios` em `app.json` completa (bundleIdentifier, `infoPlist` em PT-BR, ícones e deep links). | Inspeção de `app.json` e `npm run check:build-config`. |
| CA2 | Base Liquid Glass + Safe Areas + `KeyboardAvoidingView` isolada para iOS sem impactar Android/Web. | Testes unitários de componentes e `Platform.OS` mockado. |
| CA3 | Todas as 44 rotas de `src/app/` auditadas e adequadas às seções e pranchas do Figma iOS 26 (`design-system/telas-iphone-figma.md`). | Checklist por sub-issue + testes de renderização em modo iOS + auditoria visual lado a lado. |
| CA4 | Alvos de toque `≥ 44×44 pt`, suporte a Reduzir Transparência, Dynamic Type e rótulos VoiceOver (tema claro exclusivo). | Testes de acessibilidade e auditoria manual no simulador/iPhone. |
| CA5 | Android (MD3) e Web permanecem 100% intactos e sem regressões. | Suíte completa verde (`npm run validate`). |

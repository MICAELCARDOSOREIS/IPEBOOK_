# Pacote de Issues — Spec 137: iOS Nativo (Apple HIG & Liquid Glass)

> **Responsável Principal:** Eric Vinícius dos Santos Oliveira ([@Eric2025gh](https://github.com/Eric2025gh))  
> **Issue Mãe (Épico #225):** [`issue.md`](./issue.md)  
> **Referência Figma Atualizada:** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (`APP · 20 · iPhone · iOS 26` — tema claro exclusivo, 52 quadros principais, 4 estados após carregamento, 7 estados iOS 26, 25 telas de protótipo nativo e 2 pranchas iOS 26)

Este documento mapeia o trabalho do iPhone nativo às sub-issues reais do GitHub (`#226` a `#238`) com os **links diretos atualizados do Figma** para cada responsável evoluir e conferir as telas no padrão **Apple HIG / iOS 26** sem quebrar o Android (Material Design 3) nem a Web.

---

## Issue #226 (`T001`) — `[iOS Nativo · Config] Configurar app.json, infoPlist (PT-BR), deep links e ADR de escopo iOS`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `pessoa:eric`, `documentation`, `enhancement`
- **Branch sugerida:** `feature/ios-config-app-json` (base: `develop`)
- **Referências Figma:**
  - [Guia iPhone · iOS 26 (`915:384`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-384&m=dev)
  - [Notificações · permissões (`937:2386`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2386&m=dev)
- **Escopo:**
  - Registrar ADR atualizando a entrada do iOS Nativo em escopo (vinculado aos ADRs [0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md) e [0114](../../docs/adr/0114-remocao-tema-escuro.md) — tema claro exclusivo).
  - Revisar `ios` em `app.json`: `bundleIdentifier`, `buildNumber`, `supportsTablet`, ícones e splash screen.
  - Configurar `infoPlist` em português (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`).
  - Validar esquemas de URL / deep links (`src/app/auth/callback.tsx` e links de livros).
- **Critérios de aceite:**
  - `npm run check:build-config` passa sem erros.
  - `npx expo config --type public` exibe a seção `ios` completa e sem strings em inglês nas permissões.

---

## Issue #227 (`T002`) — `[iOS Nativo · Design System] Base Liquid Glass e componentes Apple HIG (Safe Areas, Dock, TopAppBar, BottomSheet)`

- **Status:** **Implementada (PRs `#239` e `#241` mergeados) · Pendente apenas conferência final com as pranchas `09` e `10` do Figma iOS 26**
- **Responsáveis:** Maria Clara (`@clarinhamartins`), Eric Vinícius (`@Eric2025gh`) · **Apoio:** Micael (`@MICAELCARDOSOREIS`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:micael`, `pessoa:maria-clara`, `pessoa:eric`
- **Referências Figma (Pranchas iOS 26):**
  - [Prancha iOS 26 · Botões, formulários e controles (`952:2303`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=952-2303&m=dev)
  - [Prancha · padrões de interação nativos (`957:2903`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=957-2903&m=dev)
- **O que já foi entregue:**
  - [ADR 0115](../../docs/adr/0115-base-liquid-glass-apple-hig.md) + PR `#239` (base Liquid Glass, Safe Areas, Dock flutuante, `TopAppBar`, `BottomSheet`, Reduzir Transparência e Haptics) + PR `#241` (refino de botões, formulários e cards).
- **Conferência pendente com o Figma novo:**
  - Conferir visualmente nas pranchas `952:2303` e `957:2903`: botão primário verde IpêBook, botão secundário em vidro (`--glass-fill`), campos `--ios-cell` (`#f7f3ec`) com borda de foco `#4e8a68`, pills de filtro translúcidos, Switch/Segmented Control iOS e estilos de alerta/ação destrutiva (`#f9dedc`).

---

## Issue #228 (`T003`) — `[iOS Nativo · Fluxo 01] Adequar telas de Acesso, Onboarding e Boas-vindas`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:eric`
- **Rotas (`src/app/`):** `bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx`
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - [01 · Bem-vindo (`915:394`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-394&m=dev)
  - [02 · Entrar (`915:434`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-434&m=dev)
  - [03 · Criar conta (`916:119`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-119&m=dev)
  - [04 · Esqueci minha senha (`916:156`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-156&m=dev)
  - [09 · Nova senha (`916:301`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-301&m=dev)
  - [51 · Autenticação · Carregando (`916:341`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-341&m=dev)
  - [52 · Autenticação · Erro (`916:356`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-356&m=dev)
  - Padrão de campos e botões: [Prancha iOS 26 (`952:2303`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=952-2303&m=dev)
- **Melhorias Apple HIG:**
  - Alinhar layout visual ao Figma atualizado (cabeçalho de boas-vindas com badge Piripiri e pílulas Venda/Troca/Doação, campos `#f7f3ec` com foco `#4e8a68`, estados de carregamento e erro).
  - Garantir que o teclado iOS nunca cubra os botões primários ("Entrar", "Criar conta", "Enviar link").
  - Alvos de toque `≥ 44×44 pt` e rótulos anunciados corretamente pelo VoiceOver.
- **Critérios de aceite:**
  - Todas as 6 rotas renderizam e navegam conforme os quadros do Figma sem sobreposição de Safe Area ou teclado no iPhone.

---

## Issue #229 (`T004`) — `[iOS Nativo · Descoberta e Livro] Adequar Catálogo, Busca, Favoritos, Alertas, Detalhe e Perfil Público`

- **Status:** **Em revisão** (PR `#240` mergeado por `@clarinhamartins`, [ADR 0116](../../docs/adr/0116-padronizacao-apple-hig-descoberta-busca-ios.md); PR `#243` aberto para `alertas/[id]` e `alertas/[id]/editar`; pendente validação em iPhone e conferência contra os novos quadros do Figma)
- **Responsáveis:** Maria Clara (`@clarinhamartins`) e Eric Vinícius (`@Eric2025gh`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:maria-clara`, `pessoa:eric`
- **Rotas (`src/app/`):** `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx`, `perfil/[userId].tsx`
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - Seção 02: [12 · Início (`915:472`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-472&m=dev), [13 · Pesquisa (`916:370`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-370&m=dev), [29 · Favoritos (`916:450`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-450&m=dev), [30 · Meus alertas (`916:490`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-490&m=dev), [32 · Detalhe venda (`915:557`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-557&m=dev), [37 · Detalhe doação (`916:512`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-512&m=dev), [38 · Detalhe rolagem (`916:542`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-542&m=dev), [47 · Gerenciar alerta (`916:595`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-595&m=dev), [48 · Editar alerta (`916:618`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-618&m=dev)
  - Seção 05: [36 · Perfil público (`916:2192`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2192&m=dev), [40 · Perfil de outro usuário (`916:2234`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2234&m=dev)
  - Seção 08 (Protótipo): [Explorar · busca ativa (`937:2434`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2434&m=dev), [resultados (`937:2563`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2563&m=dev), [filtros médios (`937:2603`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2603&m=dev), [filtros expandidos (`937:2709`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2709&m=dev), [enviar proposta (`937:3131`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3131&m=dev)
  - Seção 11: [53 · Busca · Sem resultados (`1016:2383`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2383&m=dev)
- **Pendências para fechamento:**
  - Concluir merge do PR `#243` (`alertas/[id]` e `alertas/[id]/editar`), validar no iPhone/simulador com `@Eric2025gh` e conferir visualmente com os quadros acima.

---

## Issue #230 (`T005`) — `[iOS Nativo · Publicação e Estante] Adequar Publicação (ISBN, Câmera, Fotos, Rascunhos), Estante e Pedidos`

- **Status:** **Implementação local entregue (`dcef8369`) · Pendente homologação em iPhone e conferência com o Figma atualizado**
- **Responsáveis:** Eric Vinícius (`@Eric2025gh`) e Antonio Carlos (`@gomes738`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:antonio`, `pessoa:eric`
- **Rotas (`src/app/`):** `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - Seção 03: [14 · Estante (`916:649`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-649&m=dev), [15 · Anunciar livro (`916:745`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-745&m=dev), [16 · Rascunhos (`916:787`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-787&m=dev), [33 · Gerenciar anúncio (`916:824`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-824&m=dev), [34 · Editar anúncio (`916:872`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-872&m=dev), [35 · Detalhe do próprio anúncio (`916:896`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-896&m=dev)
  - Seção 04: [17 · Meus pedidos (`916:1508`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1508&m=dev), [19 · Pedidos recebidos (`916:1620`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1620&m=dev)
  - Seções 07, 08 e 11: [34B · Editar anúncio · formulário (`921:1095`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=921-1095&m=dev), [Rascunhos · confirmar descarte (`997:2248`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=997-2248&m=dev), [55 · Pedidos · Vazio (`1016:2446`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2446&m=dev), [58 · Anúncio · Salvo com sucesso (`1016:2536`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2536&m=dev)
- **Pendências para fechamento:**
  - Homologação em iPhone pelo `@Eric2025gh` (câmera/Fotos negadas → Abrir Ajustes, entrada manual de ISBN, ação Concluir no teclado numérico, salvamento/descarte de rascunho) e conferência visual com os quadros acima.

---

## Issue #231 (`T006`) — `[iOS Nativo · Negociação e Compartilhar] Adequar Conversas, Encontro, Entrega e Compartilhamento`

- **Status:** **Validada no iPhone com Expo Go (`9eba578e`, `40aee97f`, `c71bed35`) · Conferência visual final com o Figma atualizado na auditoria #237**
- **Responsáveis:** Antonio Carlos (`@gomes738`) e Eric Vinícius (`@Eric2025gh`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:antonio`, `pessoa:eric`
- **Rotas (`src/app/`):** `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx`, `perfil/convidar.tsx`
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - Seção 04: [18 · Conversas (`916:1564`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1564&m=dev), [43 · Conversa · encontro confirmado (`915:603`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-603&m=dev), [44 · Reagendar encontro (`916:1667`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1667&m=dev), [45 · Acompanhar encontro (`916:1735`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1735&m=dev), [46 · Entrega do livro (`916:1780`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1780&m=dev), [50 · Combinar encontro (`916:1809`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1809&m=dev)
  - Seção 05: [27 · Convidar amigos (`916:2138`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2138&m=dev)
  - Seções 08, 10 e 11: [Detalhe · compartilhar no iOS (`937:2829`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2829&m=dev), [Negociação · proposta enviada (`937:3192`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3192&m=dev), [Conversa · teclado aberto (`937:3258`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3258&m=dev), [Agendamento nativo (`957:2903`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=957-2903&m=dev), [54 · Conversas · Vazio (`1016:2416`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2416&m=dev)

---

## Issue #232 (`T007`) — `[iOS Nativo · Perfil, Conta, Moderação e Estados] Adequar Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:eric`
- **Rotas (`src/app/`):** `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `perfil/encontros.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx`, `+not-found.tsx`
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - Seção 01 (ajuda/institucional): [05 · Sobre (`916:179`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-179&m=dev), [06 · Convite beta Android (`916:209`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-209&m=dev), [07 · Ajuda (`916:238`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-238&m=dev), [08 · Termos e privacidade (`916:270`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-270&m=dev), [10 · Página não encontrada (`916:322`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-322&m=dev)
  - Seção 05: [11 · Perfil sem sessão (`916:1881`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1881&m=dev), [20 · Meu perfil (`916:1899`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1899&m=dev), [21 · Editar perfil (`916:1946`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1946&m=dev), [22 · Configurações (`916:1971`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-1971&m=dev), [23 · Segurança e verificação (`916:2018`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2018&m=dev), [24 · Avaliações recebidas (`916:2036`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2036&m=dev), [25 · Histórico de encontros (`916:2070`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2070&m=dev), [26 · Pessoas bloqueadas (`916:2121`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2121&m=dev), [28 · Notificações (`916:2169`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2169&m=dev), [49 · Excluir conta (`916:2273`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2273&m=dev)
  - Seção 06: [31 · Moderação (`916:2307`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2307&m=dev), [39 · Denunciar anúncio (`916:2342`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2342&m=dev), [41 · Denunciar ou bloquear (`916:2376`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2376&m=dev), [42 · Denunciar pessoa (`916:2428`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2428&m=dev)
  - Seção 07: [21B · Editar perfil · formulário (`921:994`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=921-994&m=dev), [24B · Avaliações · vazio (`921:1041`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=921-1041&m=dev), [31B · Moderação · fila vazia (`921:1068`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=921-1068&m=dev)
  - Seção 08: [Configurações · listas agrupadas (`937:3426`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3426&m=dev), [título compacto (`937:3480`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3480&m=dev), [Conta e dados (`937:3588`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3588&m=dev), [Preferências (`937:3616`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3616&m=dev)
  - Seções 10 e 11: [Alertas/Ações destrutivas (`957:2903`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=957-2903&m=dev), [56 · Sem conexão (`1016:2476`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2476&m=dev), [57 · Erro (`1016:2506`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2506&m=dev), [59 · Carregando (`1016:2566`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1016-2566&m=dev)
- **Melhorias Apple HIG:**
  - Listas agrupadas estilo iOS em Configurações, Segurança, Conta e dados e Termos.
  - Confirmações destrutivas ("Sair da conta?", "Excluir conta", "Bloquear/Desbloquear") conforme Prancha 10 (`957:2903`).
  - Banner offline e estados de carregamento/erro posicionados abaixo da Dynamic Island / Notch.

---

## Issue #233 (`T008`) — `[iOS Nativo · Acessibilidade e Permissões] Permissões iOS, Reduzir Transparência, Dynamic Type e VoiceOver`

- **Status:** **Acessibilidade Apple HIG entregue por Maria Clara no PR `#242` · Pendente apenas fluxos nativos de permissão (`@Eric2025gh`) e conferência no Figma**
- **Responsáveis:** Maria Clara (`@clarinhamartins`) e Eric Vinícius (`@Eric2025gh`) · **Apoio:** Micael (`@MICAELCARDOSOREIS`)
- **Labels:** `accessibility`, `enhancement`, `pessoa:micael`, `pessoa:maria-clara`, `pessoa:eric`
- **Nota de escopo:** **Dark Mode removido** pela Spec 139 / ADR 0114 (o Figma iOS 26 atual opera em tema claro exclusivo e não contém telas de Dynamic Island / Live Activity).
- **Telas Figma (`APP · 20 · iPhone · iOS 26`):**
  - [Notificações · permissões (`937:2386`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2386&m=dev)
  - [Acessibilidade · texto maior (`937:3534`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3534&m=dev)
  - [Acessibilidade · transparência reduzida (`937:3645`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-3645&m=dev)
  - [Prancha iOS 26 (`952:2303`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=952-2303&m=dev) e [Prancha interação (`957:2903`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=957-2903&m=dev)
- **Pendências restantes:** validar fluxos de permissão nativa no iPhone (`937:2386`, câmera/galeria) com `@Eric2025gh` e conferir contra `937:3534` e `937:3645`.

---

## Issues #234 a #238 (`T009` a `T013`) — Auth Apple, Push APNs, Build/TestFlight, Auditoria Visual e QA Final

- **#234 (`T009` — `@MICAELCARDOSOREIS` + `@Eric2025gh`):** Sign in with Apple (`expo-apple-authentication` + Supabase Auth) nas telas [02 · Entrar (`915:434`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-434&m=dev) e [03 · Criar conta (`916:119`)](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-119&m=dev).
- **#235 (`T010` — `@gomes738` + `@Eric2025gh`):** Implementação local entregue em `2a7a9d98`; pendente credenciais APNs, implantação de `enviar-push` e homologação em iPhone/TestFlight ([28 · Notificações `916:2169`](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-2169&m=dev) e [`937:2386`](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2386&m=dev)).
- **#236 (`T011` — `@Eric2025gh`):** Configurar build iOS (`eas.json`), `PrivacyInfo.xcprivacy` e TestFlight.
- **#237 (`T012` — `@clarinhamartins` + `@Eric2025gh`):** Auditoria visual final lado a lado contra todos os quadros atualizados de [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (tema claro + Liquid Glass).
- **#238 (`T013` — `@MICAELCARDOSOREIS` + `@Eric2025gh`):** Verificação final no iPhone (Safe Areas, teclado, *swipe back*, VoiceOver, Dynamic Type, Reduzir Transparência) e regressão zero em Android (MD3) e Web (`npm run validate`).

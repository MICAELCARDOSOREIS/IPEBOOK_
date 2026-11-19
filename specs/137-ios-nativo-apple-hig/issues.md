# Pacote de Issues — Spec 137: iOS Nativo (Apple HIG & Liquid Glass)

> **Responsável Principal:** Eric Vinícius dos Santos Oliveira ([@Eric2025gh](https://github.com/Eric2025gh))  
> **Issue Mãe (Épico):** [`issue.md`](./issue.md)  
> **Referência Figma:** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (144 telas · `APP · 20 · iPhone · iOS 26`)

Este documento quebra o trabalho do iPhone nativo em **8 issues independentes e incrementais**, para que o Eric tenha visibilidade clara de cada bloco de telas e possa evoluir o app no padrão **Apple HIG** sem quebrar o Android (Material Design 3) nem a Web.

---

## Issue 1 — `[iOS Nativo · Config] Configurar app.json, infoPlist (PT-BR), deep links e ADR de escopo iOS`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `pessoa:eric`, `ios`, `config`, `documentation`
- **Branch:** `feature/ios-config-app-json` (base: `develop`)
- **Escopo:**
  - Registrar ADR atualizando a entrada do iOS Nativo em escopo (vinculado ao [ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)).
  - Revisar `ios` em `app.json`: `bundleIdentifier`, `buildNumber`, `supportsTablet`, ícones e splash screen.
  - Configurar `infoPlist` em português (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`).
  - Validar esquemas de URL / deep links (`auth/callback.tsx` e links de livros).
- **Critérios de aceite:**
  - `npm run check:build-config` passa sem erros.
  - `npx expo config --type public` exibe a seção `ios` completa e sem strings em inglês nas permissões.

---

## Issue 2 — `[iOS Nativo · Design System] Base Liquid Glass e componentes Apple HIG (Safe Areas, Dock, TopAppBar, BottomSheet)`

- **Status:** **Concluída** (Implementada por Maria Clara · `@clarinhamartins` · [ADR 0115](../../docs/adr/0115-base-liquid-glass-apple-hig.md))
- **Responsável:** Maria Clara (`@clarinhamartins`) · **Apoio:** Eric Vinícius (`@Eric2025gh`) e Micael (`@MICAELCARDOSOREIS`)
- **Labels:** `pessoa:maria-clara`, `ios`, `apple-hig`, `design-system`
- **Branch:** `feature/ios-design-system-liquid-glass` (integrada em `develop`)
- **Escopo:**
  - Isolar variações iOS via `Platform.OS === 'ios'` ou `.ios.tsx` nos componentes base:
    - `ScreenContainer`: Safe Areas nativas (Dynamic Island / Notch / Home Indicator) + `KeyboardAvoidingView` (`behavior="padding"`).
    - `ConnectedNavigationBar` (Tab Bar): estilo flutuante Liquid Glass (`glass-fill` / `glass-stroke`) respeitando o Home Indicator.
    - `TopAppBar`: título e botão voltar no padrão Apple HIG com alvo mínimo `44×44 pt`.
    - `BottomSheet` / modais: *drag handle* superior, cantos contínuos e fechamento por gesto.
  - Implementar fallback automático opaco para **Reduzir Transparência** (`AccessibilityInfo.isReduceTransparencyEnabled`) e helper de feedback tátil (*Haptics*).
- **Critérios de aceite:**
  - Nenhuma alteração visual no Android (MD3) ou Web.
  - Testes unitários cobrindo `Platform.OS === 'ios'` e fallback de transparência.

---

## Issue 3 — `[iOS Nativo · Fluxo 01] Adequar telas de Acesso, Onboarding e Escolha de Bairro (17 telas Figma)`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `pessoa:eric`, `ios`, `apple-hig`, `auth`
- **Rotas:** `src/app/bem-vindo.tsx`, `entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx`, `auth/callback.tsx`
- **Telas Figma:** `01.01` a `01.17` (Boas-vindas, Entrar, Criar conta, Recuperar acesso, Confira e-mail, Nova senha, erros de acesso/e-mail e `01.17 · Seu bairro`)
- **Melhorias Apple HIG:**
  - Garantir que o teclado iOS nunca cubra os botões primários ("Entrar", "Criar conta", "Enviar link").
  - Alvos de toque `≥ 44×44 pt` em links secundários ("Esqueci minha senha", "Voltar", toggles de senha).
  - Rótulos e avisos de erro anunciados corretamente pelo VoiceOver.
- **Critérios de aceite:**
  - Todas as 6 rotas renderizam e navegam sem sobreposição de Safe Area ou teclado no iPhone.

---

## Issue 4 — `[iOS Nativo · Fluxos 02 e 03] Adequar Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público (22 telas Figma)`

- **Status:** **Em revisão (Parcial)** (Implementada por Maria Clara · `@clarinhamartins` · PR #240 · [ADR 0116](../../docs/adr/0116-padronizacao-apple-hig-descoberta-busca-ios.md); pendente validação em iPhone/simulador e rotas de alertas `alertas/[id]` e `alertas/[id]/editar` com `@Eric2025gh`)
- **Responsável:** Maria Clara (`@clarinhamartins`) · **Apoio:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `pessoa:maria-clara`, `ios`, `apple-hig`, `discovery`
- **Rotas:** `index.tsx`, `pesquisa.tsx`, `favoritos.tsx`, `alertas.tsx`, `alertas/[id].tsx`, `alertas/[id]/editar.tsx`, `livro/[id].tsx`, `perfil/[userId].tsx`
- **Telas Figma:** `02.01` a `02.16` (Início, Explorar, Filtros, Busca, Favoritos, Alertas) e `03.01` a `03.06` (Detalhe venda/troca/doação, Perfil público, Propor troca, Fotos)
- **Melhorias Apple HIG:**
  - Barra de busca iOS com botão cancelar claro e histórico recente acessível.
  - Filtros de livros abertos em *Bottom Sheet* com *drag handle* e botões de confirmação acima do Home Indicator.
  - Galeria de fotos em `livro/[id].tsx` com swipe fluido e barra de ação fixa (*Thumb Zone*) respeitando `safe-area-inset-bottom`.
  - Botão de favoritar com feedback tátil leve (*Haptic*).

---

## Issue 5 — `[iOS Nativo · Fluxos 04 e 05] Adequar Publicação (ISBN, Câmera, Fotos, Rascunhos) e Minha Estante (29 telas Figma)`

- **Responsável:** Eric Vinícius (`@Eric2025gh`) · **Apoio:** Antonio Carlos (`@gomes738`)
- **Labels:** `pessoa:eric`, `ios`, `apple-hig`, `publish`
- **Rotas:** `anunciar.tsx`, `editar-anuncio/[id].tsx`, `gerenciar-anuncio/[id].tsx`, `rascunhos.tsx`, `meus-anuncios.tsx`, `meus-pedidos.tsx`, `pedidos-recebidos.tsx`
- **Telas Figma:** `04.01` a `04.21` (Etapas 1 e 2, Ler ISBN, Livro identificado, Fotos, Rascunhos, Erros de permissão/ISBN/upload, Excluir anúncio) e `05.01` a `05.08` (Estante, Propostas, Concluídos e estados vazios)
- **Melhorias Apple HIG:**
  - Tratamento de permissão negada de câmera/galeria no iOS com CTA para abrir os Ajustes do iPhone (`Linking.openSettings()`).
  - Teclado numérico para preço/ISBN com acessibilidade para concluir digitação no iOS.
  - Modais de confirmação ("Salvar para depois?", "Descartar rascunho?", "Excluir anúncio?") com ação destrutiva destacada conforme HIG.

---

## Issue 6 — `[iOS Nativo · Fluxos 06 e 08] Adequar Conversas, Negociação, Encontro, Entrega e Compartilhamento (24 telas Figma)`

- **Responsável:** Eric Vinícius (`@Eric2025gh`) · **Apoio:** Antonio Carlos (`@gomes738`)
- **Labels:** `pessoa:eric`, `ios`, `apple-hig`, `chat`
- **Rotas:** `conversas.tsx`, `conversa/[id].tsx`, `negociacao/[id].tsx`, `negociacao/[id]/encontro.tsx`, `negociacao/[id]/entrega.tsx`, `perfil/convidar.tsx`
- **Telas Figma:** `06.01` a `06.22` (Conversas, Chat, Proposta, Contraproposta, Combinar/Acompanhar/Reagendar/Cancelar Encontro, Concluir, Avaliar) e `08.01` a `08.02` (Compartilhar livro e Link copiado)
- **Melhorias Apple HIG:**
  - Chat (`conversa/[id].tsx`) com `KeyboardAvoidingView` nativo iOS, mantendo o campo de digitação colado acima do teclado e respeitando o Home Indicator quando fechado.
  - Compartilhamento usando a folha nativa do iOS (`Share.share` / `UIActivityViewController`) com feedback visual quando o link é copiado.
  - Fluxo de conclusão por QR Code com câmera respeitando Safe Area superior.

---

## Issue 7 — `[iOS Nativo · Fluxos 07, 09 e 10] Adequar Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais (33 telas Figma)`

- **Responsável:** Eric Vinícius (`@Eric2025gh`)
- **Labels:** `pessoa:eric`, `ios`, `apple-hig`, `profile`
- **Rotas:** `perfil.tsx`, `perfil/editar.tsx`, `perfil/avaliacoes.tsx`, `perfil/encontros.tsx`, `notificacoes.tsx`, `perfil/configuracoes.tsx`, `perfil/seguranca.tsx`, `perfil/bloqueados.tsx`, `excluir-conta.tsx`, `termos.tsx`, `ajuda.tsx`, `denunciar/[id].tsx`, `denunciar-pessoa/[userId].tsx`, `moderacao.tsx`, `sobre.tsx`, `beta.tsx`, `+not-found.tsx`
- **Telas Figma:** `07.01` a `07.23`, `09.01` a `09.07` e `10.01` a `10.03`
- **Melhorias Apple HIG:**
  - Listas agrupadas estilo iOS em Configurações, Segurança e Termos.
  - Confirmações destrutivas ("Sair da conta?", "Excluir conta", "Bloquear/Desbloquear") com linguagem clara e contraste acessível.
  - Banner offline e estados de carregamento/erro (`10.01`–`10.03`) posicionados abaixo da Dynamic Island / Notch.

---

## Issue 8 — `[iOS Nativo · Fluxos 11 e 12] Permissões iOS, Dynamic Island/Live Activity, Reduzir Transparência, Dynamic Type e VoiceOver (19 telas Figma)`

- **Status:** **Em andamento (Entrega parcial de IHC/Acessibilidade por Maria Clara)**
- **Responsável:** Eric Vinícius (`@Eric2025gh`) · **Apoio:** Micael (`@MICAELCARDOSOREIS`) e Maria Clara (`@clarinhamartins`)
- **Labels:** `pessoa:eric`, `pessoa:maria-clara`, `ios`, `apple-hig`, `accessibility`
- **Telas Figma:** `11.01` a `11.09` (Permissões e estados compactos/expandidos de Dynamic Island / Live Activity) e `12.01` a `12.10` (Reduzir Transparência e Texto Grande — Dark Mode revogado pela Spec 139 / ADR 0114)
- **Melhorias Apple HIG entregues por Maria Clara (`@clarinhamartins`):**
  - Validação e reforço de **Reduzir Transparência** (superfícies translúcidas Liquid Glass passam a ter fundo sólido legível em `surfaceContainer` no `BottomSheet`, `NavigationBar`, `IosCardSurface` e `OutlinedButton`; `ScreenContainer` e `TopAppBar` já operam diretamente com fundo sólido).
  - Suporte e blindagem de **Dynamic Type** e escala de texto multiplataforma (fontes ampliadas até 200% sem quebra de layout nem corte de botões, com teto defensivo de `maxFontSizeMultiplier` de 1.2x–1.3x restrito a barras e cabeçalhos fixos de navegação e alvos mínimos de `44×44 pt`).
  - Semântica e leitura completa com **VoiceOver** (`accessibilityRole="tablist"`, `"tab"`, `"header"`, `"button"`, estados e rótulos contextuais em português).
  - Documentação formal das diretrizes de acessibilidade iOS em `design-system/06-acessibilidade.md`.
- **Pendências restantes (outros integrantes):**
  - Telas de permissão nativas do iOS (`11.01` a `11.04` por `@Eric2025gh`).
  - Contratos de preparo para **Live Activity / Dynamic Island** no acompanhamento de encontro (`11.05` a `11.09` por `@MICAELCARDOSOREIS`).
- **Critérios de aceite:**
  - Suíte completa verde (`npm run typecheck`, `npm run lint`, `npm run check:architecture`, `npm run check:design-system`, `npm run test`, `npm run check:docs`).

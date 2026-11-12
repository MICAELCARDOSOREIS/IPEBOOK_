# Issue #220 — [PWA/iOS] Adequar telas do PWA no iPhone/Safari ao Apple HIG sem alterar comportamento Android/Web

* **Responsável:** Maria Clara Almeida Martins ([@clarinhamartins](https://github.com/clarinhamartins))
* **Labels:** `pessoa:maria-clara`, `enhancement`, `accessibility`, `documentation`
* **Branch base:** `develop`
* **Branch sugerida:** `feature/pwa-iphone-apple-hig`
* **Inventário de Telas iPhone no Figma:** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (Canvas `APP · 20 · iPhone · iOS 26`, 144 telas com links modo Dev)
* **Documentos de Referência:**
  - [ADR 0008 — Diretrizes Visuais por Plataforma](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)
  - [ADR 0035 — Service Worker e Cache Offline PWA](../../docs/adr/0035-service-worker-cache-offline-pwa.md)
  - [ADR 0106 — Padronização com ScreenContainer](../../docs/adr/0106-migracao-telas-autenticacao-screen-container-e-ihc.md)

---

## 📌 Contexto e Objetivo

O **IpêBook** oferece acesso via Web PWA para que leitores da comunidade em Piripiri (PI) possam utilizar a plataforma diretamente pelo navegador em seus smartphones, inclusive no **iPhone (Safari e modo instalado como PWA Standalone)**.

Atualmente, o aplicativo possui excelente acabamento em Material Design 3 voltado para Android, mas quando executado em iPhones (iOS / Safari), apresenta comportamentos característicos da web mobile tradicional que precisam de refinamento para atingir o padrão de qualidade do **Apple Human Interface Guidelines (HIG)** e uma experiência verdadeiramente nativa de PWA.

O objetivo da Maria Clara nesta issue é:
1. **Adequar a experiência no iPhone / Safari PWA ao Apple HIG:** safe areas (notch / Dynamic Island e Home Indicator), feedback visual de toque, tipografia legível, scroll e prevenção de comportamentos indesejados do Safari.
2. **Garantir funcionamento pleno como PWA no iOS:** suporte ao modo tela cheia (*standalone*), ícones de WebClip, status bar translúcida/integrada e auto-recuperação offline.
3. **Utilizar as skills apropriadas do projeto** para garantir conformidade arquitetural (MVVM) e boas práticas.
4. **Isolar completamente as alterações:** NÃO mexer nem degradar o comportamento das outras plataformas (Android e Web Desktop), garantindo que as implementações dos outros colegas continuem 100% preservadas.

---

## 🛑 Regra de Ouro: Escopo Isolado ("Sem Mexer nos Outros")

- **Não quebrar o Android nem a Web Desktop:** O Android segue estritamente Material Design 3 e a Web desktop possui seu layout próprio com cabeçalho largo e duas colunas. Todas as adequações específicas de iOS/Safari devem ser isoladas (ex.: via utilitários condicionais `Platform.OS === 'ios'`, detecção de Safari iOS no web/PWA ou classes/estilos específicos para ambiente iOS).
- **Não refatorar código alheio:** Focar exclusivamente no suporte ao iPhone / Safari PWA e nos componentes de contêiner e layout pertinentes.
- **Validação contínua:** Os testes existentes de Android, arquitetura e componentes devem permanecer 100% verdes (`npm run test`, `npm run typecheck`, `npm run check:architecture`).

---

## 🛠️ Uso Obrigatório de Skills

A Maria Clara deve utilizar as skills do projeto para guiar sua execução:
- **`skill_mvvm_simplificado`:** Seguir a arquitetura do curso (camadas estritas View -> ViewModel -> Service/Entity, injeção de dependência via DI Container e hooks desacoplados). Nenhuma regra de negócio deve ser colocada dentro de views.
- **`frontend-design` / `a11y-debugging`:** Garantir craft visual polido e acessibilidade digital de acordo com as recomendações de contraste e usabilidade.
- **`superpowers` (executing-plans / verification-before-completion):** Conduzir a implementação com verificação rigorosa antes de concluir e registrar evidências.

---

## 🔍 O que Ajustar no iPhone / Safari PWA (Apple HIG & PWA Checklist)

### 1. Respeito às Safe Areas do iPhone (Notch, Dynamic Island & Home Indicator)
- Garantir que o topo do app não colida com o entalhe (notch) ou Dynamic Island dos iPhones.
- Garantir que a barra de navegação inferior flutuante (`ConnectedNavigationBar`) e os botões fixos de rodapé (*Thumb Zone*) respeitem o espaçamento inferior da barra de gestos do iOS (`env(safe-area-inset-bottom)`), evitando cliques acidentais ou sobreposições.
- Verificar a integração do `ScreenContainer` e `SafeAreaProvider` no ambiente iOS Web.

### 2. Prevenção de Falhas Crônicas do Safari no iOS
- **Zoom Automático Involuntário em Inputs:** No Safari do iPhone, qualquer campo de texto com `font-size` menor que `16px` provoca zoom-in automático na tela, desconfigurando o layout do PWA. Garantir que todos os campos de formulário no mobile tenham tamanho de fonte ≥ 16px.
- **Scroll Elástico Excessivo (*Rubber-banding*):** Evitar que o arraste da página desloque o cabeçalho fixo ou crie barras brancas indesejadas no topo/fundo no modo PWA standalone (aplicar `overscroll-behavior-y: none` no container raiz da web mobile).
- **Remoção de Highlight Cinza do Safari:** Garantir `-webkit-tap-highlight-color: transparent` em elementos clicáveis para dar lugar ao feedback visual nativo do app.

### 3. Experiência PWA Standalone no iOS
- **Status Bar Adaptativa:** Configurar `<meta name="apple-mobile-web-app-status-bar-style" content="default">` ou `black-translucent` para que a barra de status se harmonize com o tema claro/escuro do IpêBook.
- **WebClip / Ícones de Inicialização:** Conferir as tags `<link rel="apple-touch-icon">` para que o app, quando adicionado à tela de início do iPhone ("Adicionar à Tela de Início"), exiba o ícone correto de alta resolução sem bordas distorcidas.
- **Capacidade Standalone:** Validar `apple-mobile-web-app-capable: yes` e título reduzido da tela de início.

### 4. Padrões de Navegação e Interação (Apple HIG)
- **Títulos e Cabeçalhos:** Alinhamento limpo e tipografia `Plus Jakarta Sans` com pesos e espaçamentos adequados à leitura no iPhone.
- **Botões e Modais:** Cantos arredondados contínuos (*squircles*) e modais com pegador (*drag handle*) no topo quando abertos como BottomSheets.
- **Áreas de Toque:** Garantir piso mínimo de 44×44 pt (48×48 dp) para todos os alvos interativos no iPhone.
- **Navegação de Retorno:** Garantir que o botão "Voltar" no cabeçalho seja acessível e que o fluxo de retorno não fique preso caso o usuário use o modo PWA sem a barra nativa do Safari.

---

## 📋 Telas de Referência para Validação no iPhone

Consultar o arquivo [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) para conferir a anatomia esperada das telas no iPhone:
- [ ] **Fluxo 01 — Acesso:** `01.01 · Boas-vindas` (`129:1989`), `01.02 · Entrar` (`334:3219`), `01.03 · Criar conta` (`336:12902`).
- [ ] **Fluxo 02 — Início & Descoberta:** `02.01 · Início` (`83:834`), `02.02 · Explorar` (`70:1313`), `02.15 · Busca` (`192:2641`).
- [ ] **Fluxo 03 — Detalhe do Livro:** `03.01 · O Pequeno Príncipe` (`70:1470`) e fluxo de propostas.
- [ ] **Fluxo 04 — Anúncio:** Formulário de cadastro de livros com teclado virtual no iPhone.
- [ ] **Fluxo 05 — Minha Estante:** Barra de filtros por chips e listagem com scroll suave.
- [ ] **Fluxo 06 — Mensagens:** Chat de negociações com área de digitação visível acima do teclado do iOS.
- [ ] **Fluxo 07 — Perfil:** Visualização de dados e configurações.

---

## ✅ Critérios de Aceite

1. O aplicativo funciona fluidamente no iPhone (Safari e adicionado à Tela de Início como PWA standalone).
2. Não há sobreposição com a Safe Area superior (notch / Dynamic Island) nem inferior (Home Indicator).
3. O foco em campos de formulário não gera zoom involuntário na tela no Safari iOS.
4. O scroll elástico não quebra o layout fixo nem desloca cabeçalhos no modo PWA.
5. As diretrizes do Apple HIG (alvos de toque ≥ 44pt, contraste, legibilidade) são respeitadas no ambiente iOS.
6. **O comportamento e a estética no Android (Material Design 3) e na Web Desktop permanecem 100% inalterados.**
7. Todas as regras da arquitetura MVVM do projeto são respeitadas.
8. A suíte de validação do projeto passa sem falhas:
   ```bash
   npm run typecheck
   npm run check:architecture
   npm run test
   ```

# Especificação 135 — [PWA/iOS] Adequar telas do PWA no iPhone/Safari ao Apple HIG sem alterar comportamento Android/Web

**Estado:** Especificada em 2026-11-11  
**Responsável:** Maria Clara Almeida Martins (`pessoa:maria-clara`)  
**Issue:** #220  
**ADR:** [0108](../../docs/adr/0108-pwa-iphone-safari-apple-hig.md)  
**Inventário de Telas iPhone no Figma:** `design-system/telas-iphone-figma.md` (Canvas `APP · 20 · iPhone · iOS 26`, 144 telas com links modo Dev)

---

## 1. Contexto e Objetivo

O **IpêBook** oferece acesso Web como Progressive Web App (PWA) para que leitores da comunidade de Piripiri (PI) possam utilizar a plataforma no navegador de seus smartphones, incluindo o **iPhone (Safari e modo instalado como PWA Standalone)**.

Enquanto a versão Android segue estritamente o Material Design 3 e a versão Web Desktop possui layout próprio em duas colunas, a experiência no iPhone / Safari PWA apresentava características indesejadas da web móvel tradicional que demandavam refinamento para atender ao padrão de qualidade do **Apple Human Interface Guidelines (HIG)**:
1. **Safe Areas do iPhone:** Notches, Dynamic Island e Home Indicator precisam de respeito milimétrico tanto no topo quanto na barra inferior de navegação flutuante (`ConnectedNavigationBar`) e áreas de rodapé (*Thumb Zone*).
2. **Prevenção de Falhas Crônicas do Safari:**
   - Zoom automático involuntário ao focar em inputs com `font-size` menor que 16px.
   - Rolagem elástica desregulada (*rubber-banding*) que desloca cabeçalhos fixos e deixa faixas brancas no modo standalone.
   - Destaque cinza (*tap highlight*) nativo do Safari ao tocar em elementos interativos.
3. **PWA Standalone no iOS:** Ícones WebClip de alta resolução (`apple-touch-icon`), status bar adaptativa e capacidade de tela cheia sem barras de navegação do browser.
4. **Padrões Apple HIG e Retorno Seguro:** Alvos de toque com área mínima de 44×44 pt (48×48 dp) e garantia de que o botão "Voltar" nos cabeçalhos (`TopAppBar`) funcione mesmo quando o app for aberto diretamente sem histórico anterior (`router.canGoBack() === false`).
5. **Isolamento Absoluto:** As adequações devem ser isoladas, garantindo que o comportamento e o design no Android (MD3) e na Web Desktop permaneçam 100% inalterados.

---

## 2. Regras de Negócio e Comportamento Esperado

- **RN-01 (Viewport com Safe Area Cover):** A meta tag `viewport` em `src/app/+html.tsx` deve incluir `viewport-fit=cover`, permitindo o preenchimento de ponta a ponta da tela e a ativação das variáveis CSS `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` no Safari iOS.
- **RN-02 (Prevenção de Zoom Involuntário no Safari):** Todos os campos de formulário (`input`, `select`, `textarea`) no ambiente mobile / Safari iOS devem possuir tamanho de fonte mínimo de 16px (`font-size: 16px !important;`), eliminando o zoom-in automático desestabilizador do iOS.
- **RN-03 (Bloqueio de Rubber-Banding no Container Raiz):** A raiz da página (`html, body`) deve aplicar `overscroll-behavior-y: none;` para estabilizar os cabeçalhos fixos e evitar deslocamento elástico indesejado no modo PWA standalone.
- **RN-04 (Remoção do Tap Highlight Cinza):** A propriedade `-webkit-tap-highlight-color: transparent;` deve ser aplicada globalmente aos elementos interativos, dando lugar ao feedback visual nativo do design system do app (micro-bounce e estados pressed).
- **RN-05 (Respeito ao Home Indicator na Barra de Navegação):** O container da barra inferior flutuante (`[data-testid="navigation-bar-tablist"]`) deve utilizar espaçamento inferior compatível com a barra de gestos do iOS (`max(12px, calc(8px + env(safe-area-inset-bottom, 0px)))`), garantindo que o dock não colida com o Home Indicator do iPhone.
- **RN-06 (WebClip e Ícones de Inicialização iOS):** O cabeçalho HTML deve declarar as tags `<link rel="apple-touch-icon">` para tamanhos de ícone de alta resolução (180x180, 192x192, 512x512) e meta tags PWA (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`).
- **RN-07 (Detecção de Telefone Desativada):** A meta tag `<meta name="format-detection" content="telephone=no" />` deve ser adicionada para evitar que números de páginas, preços ou ISBN sejam indevidamente convertidos em links azuis de discagem telefônica no Safari iOS.
- **RN-08 (Blindagem de Navegação de Retorno no PWA):** A função de retorno `backOnce` deve inspecionar `router.canGoBack()`; caso o app tenha sido iniciado diretamente em uma subrota (ex.: via link compartilhado ou atalho de PWA standalone) sem histórico na pilha, deve navegar para a rota de fallback segura (`/`), evitando que o usuário fique bloqueado na tela.
- **RN-09 (Ergonomia e Alvos de Toque Apple HIG):** Todos os alvos de toque interativos em cabeçalhos, abas e botões devem manter dimensão mínima de 44×44 pt (48×48 dp), em conformidade com as diretrizes do Apple HIG e WCAG 2.1 AA.
- **RN-10 (Isolamento de Plataforma):** Nenhuma das alterações do Safari/iOS deve alterar o layout do Android (Material Design 3) nem da Web Desktop (layout largo em duas colunas).

---

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | A meta tag viewport contém `viewport-fit=cover` e a meta `format-detection` está configurada como `telephone=no`. | Inspeção de `src/app/+html.tsx` e teste unitário. |
| CA2 | Regras CSS para prevenção de zoom (`font-size: 16px`), bloqueio de rubber-banding (`overscroll-behavior-y: none`) e remoção de tap highlight cinza estão presentes no HTML raiz da Web. | Teste unitário e verificação de `+html.tsx`. |
| CA3 | A barra flutuante de navegação respeita a safe area do Home Indicator via `env(safe-area-inset-bottom)`. | Regra CSS presente em `+html.tsx` e padding calculado. |
| CA4 | Tags `apple-touch-icon` estão configuradas com ícones de alta resolução e dimensões adequadas (180x180, 192x192, 512x512). | Inspeção de `+html.tsx` e existência dos assets. |
| CA5 | `backOnce` previne bloqueio de usuário quando `router.canGoBack()` for falso, redirecionando para a rota de fallback. | Teste unitário em `tests/unit/pwaIphoneAppleHig.test.ts`. |
| CA6 | Alvos de toque nos componentes de topo e navegação mantêm conformidade com o piso mínimo de 44×44 pt do Apple HIG. | Teste unitário de acessibilidade interativa. |
| CA7 | O comportamento e visual do Android (MD3) e Web Desktop permanecem 100% inalterados. | Testes existentes verdes sem regressões. |
| CA8 | Suíte completa de validação passa com 100% de sucesso (`npm run typecheck`, `npm run check:architecture`, `npm run test`). | Comandos executados com código de saída 0. |

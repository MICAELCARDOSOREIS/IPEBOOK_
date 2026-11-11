# ADR 0108 — Adequação do PWA no iPhone/Safari ao Apple HIG

- **Status:** Aceito
- **Data:** 11 de novembro de 2026
- **Autores:** Maria Clara Almeida Martins (`pessoa:maria-clara`)
- **Decisores:** Time de Engenharia e Design IpêBook
- **Contexto técnico:** Adequação de telas e ergonomia web no iPhone (Safari e modo PWA Standalone) em conformidade com o Apple Human Interface Guidelines (HIG) sem afetar Android e Web Desktop.
- **Relacionado a:** ADR 0008 (Diretrizes Visuais por Plataforma), ADR 0020 (Publicação Web Cloudflare Pages), ADR 0035 (Service Worker e Cache Offline PWA), ADR 0106 (Padronização com ScreenContainer), ADR 0107 (Adoção da Plus Jakarta Sans na Interface).
- **Issue:** #220
- **Spec:** 135

---

## Contexto

O **IpêBook** é oferecido na Web como Progressive Web App (PWA) para que pessoas da comunidade em Piripiri (PI) possam utilizar a plataforma diretamente pelo navegador em seus smartphones, incluindo o **iPhone (Safari e modo adicionado à Tela de Início como PWA Standalone)**.

Enquanto a versão nativa Android segue estritamente o Material Design 3 e a versão Web Desktop possui seu layout largo em duas colunas, a experiência no iPhone / Safari PWA apresentava características da web mobile tradicional que demandavam refinamento para atender ao padrão de qualidade do **Apple Human Interface Guidelines (HIG)**:
1. As safe areas (Notch / Dynamic Island e Home Indicator) não contavam com declaração explícita de `viewport-fit=cover`, gerando riscos de barras cinzas ou colisão com a barra inferior flutuante.
2. No Safari do iOS, qualquer campo de formulário com tamanho de fonte inferior a 16px provoca zoom-in automático desestabilizador de layout ao receber foco.
3. O efeito de scroll elástico excessivo (*rubber-banding*) da web móvel podia deslocar cabeçalhos fixos e exibir faixas brancas no modo standalone.
4. O Safari aplica por padrão um retângulo cinza (*tap highlight*) em elementos tocados, poluindo o feedback visual nativo do app.
5. No modo PWA standalone (sem botões de navegação do browser), abrir uma rota profunda diretamente sem histórico anterior poderia prender o usuário se o botão "Voltar" dependesse puramente de `router.back()`.

## Decisão

1. **Ativação de Safe Areas e Viewport no Safari (`viewport-fit=cover`):**
   - Configurar `viewport-fit=cover` na meta tag `viewport` em `src/app/+html.tsx`.
   - Adicionar `<meta name="format-detection" content="telephone=no" />` para impedir que números de páginas, preços ou ISBN sejam transformados involuntariamente em links de ligação no Safari.
   - Fornecer links de alta resolução para `<link rel="apple-touch-icon">` (180x180, 192x192 e 512x512).

2. **Prevenção de Falhas Crônicas do Safari via CSS Defensivo:**
   - Adicionar regra `@supports (-webkit-touch-callout: none)` e `@media screen and (max-width: 768px)` fixando `font-size: 16px !important;` em `input`, `select` e `textarea` no mobile iOS, eliminando por completo o zoom involuntário.
   - Definir `overscroll-behavior-y: none;` na raiz (`html, body`) para eliminar o efeito elástico que quebra cabeçalhos fixos no modo PWA standalone.
   - Aplicar `-webkit-tap-highlight-color: transparent;` globalmente, garantindo que o feedback de toque seja provido exclusivamente pelos tokens de elevação e estado do app.

3. **Proteção da Barra de Navegação Inferior contra o Home Indicator:**
   - Aplicar no dock flutuante (`[data-testid="navigation-bar-tablist"]`) a regra `padding-bottom: max(12px, calc(8px + env(safe-area-inset-bottom, 0px))) !important;`, assegurando que em iPhones com Home Indicator a pílula do dock mantenha elevação segura acima da barra de gestos sem colisão.

4. **Blindagem de Navegação de Retorno no PWA Standalone:**
   - Adaptar `backOnce` em `src/view/pushOnce.ts` para verificar `router.canGoBack?.()`. Caso não haja histórico de navegação na pilha (acesso direto a tela interna no PWA), redirecionar automaticamente para a rota segura (`/`), evitando que a pessoa fique presa.

5. **Isolamento Estrito das Plataformas:**
   - As regras acima são restritas ao ambiente Web e tratadas via media queries e suporte WebKit touch, garantindo que o comportamento e a estética no Android (Material Design 3) e na Web Desktop permaneçam 100% inalterados.

## Consequências

- **Positivas:**
  - Experiência nativa, fluida e ergonômica no iPhone / Safari e em modo PWA standalone, alinhada ao Apple HIG.
  - Eliminação de falhas clássicas de usabilidade do Safari móvel (zoom indesejado, tap highlight cinza, rubber-banding).
  - Respeito seguro às safe areas do notch, Dynamic Island e Home Indicator.
  - Navegação de retorno garantida em todas as circunstâncias de uso no PWA.
  - Total isolamento: zero impacto nas versões Android e Web Desktop.
- **Negativas / Limitações:**
  - Em campos de texto mobile na web, a fonte mínima de 16px é forçada para cumprir a exigência do WebKit iOS, o que deve ser considerado no design de novos formulários compactos.

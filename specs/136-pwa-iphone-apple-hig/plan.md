# Plano de Implementação — Spec 135: Adequar PWA no iPhone/Safari ao Apple HIG

## 1. Visão Geral

Este plano descreve as etapas para implementar a Spec 135 (Issue #220), adequando as telas do PWA no iPhone/Safari aos padrões do Apple Human Interface Guidelines (HIG) e PWA Standalone de alta qualidade, mantendo isolamento completo em relação ao Android (MD3) e Web Desktop.

## 2. Fases de Execução

### Fase 1: Arquitetura e Decisão Técnica (ADR)
- Elaborar o ADR 0108 (`docs/adr/0108-pwa-iphone-safari-apple-hig.md`).
- Atualizar o índice `docs/adr/README.md`.

### Fase 2: Configuração e Cabeçalho PWA Web (`src/app/+html.tsx`)
- Adicionar `viewport-fit=cover` à tag meta viewport.
- Adicionar `<meta name="format-detection" content="telephone=no" />`.
- Expandir links `apple-touch-icon` para cobrir resoluções padrão do iOS (180x180, 192x192, 512x512).
- Adicionar estilos defensivos específicos para WebKit/Safari mobile:
  - `html, body { overscroll-behavior-y: none; -webkit-overflow-scrolling: touch; }`
  - `* { -webkit-tap-highlight-color: transparent; }`
  - `@supports (-webkit-touch-callout: none) { input, select, textarea { font-size: 16px !important; } }`
  - `@media screen and (max-width: 768px) { input, select, textarea { font-size: 16px !important; } }`
  - Suporte a Home Indicator no dock flutuante: `[data-testid="navigation-bar-tablist"] { padding-bottom: max(12px, calc(8px + env(safe-area-inset-bottom, 0px))) !important; }`
  - Antialiasing suave no iOS: `body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }`

### Fase 3: Blindagem de Navegação de Retorno no PWA Standalone (`src/view/pushOnce.ts`)
- Aprimorar a função `backOnce(fallback?: Href)`:
  - Verificar `router.canGoBack?.()`.
  - Se `false`, realizar `replaceOnce(fallback ?? "/")` para não deixar o usuário bloqueado na tela sem botão nativo do Safari.

### Fase 4: Testes Automatizados e Verificações
- Criar `tests/unit/pwaIphoneAppleHig.test.ts` cobrindo todas as novas regras e comportamentos.
- Executar e validar `npm run typecheck`.
- Executar e validar `npm run check:architecture`.
- Executar e validar `npm run test`.
- Atualizar métricas documentadas em `docs/estado.md` e `README.md` para passar em `npm run check:docs`.

### Fase 5: Conclusão e Entrega
- Revisar diff completo (`git diff`).
- Validar conformidade com os critérios de aceite da Issue #220.

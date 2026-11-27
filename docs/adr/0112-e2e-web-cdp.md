# 0112 — Testes E2E Web com Chrome CDP nativo (sem Playwright)

- **Data:** 2026-11-17
- **Status:** Aceito
- **Spec relacionada:** [Spec 138 — Suíte de Testes E2E Web via Chrome CDP](../../specs/138-e2e-web-cdp/spec.md)

## Contexto

O projeto já mantém alta cobertura de testes unitários, de hooks, de componentes (RNTL) e de integração no Vitest, mas os fluxos ponta a ponta na Web vinham sendo verificados manualmente via comandos ad-hoc no Chrome headless. A constituição do projeto veda expressamente o uso de Playwright (`AGENTS.md`), e o Node 24 LTS já oferece `WebSocket` e `fetch` nativos.

## Decisão

Adotar uma suíte E2E versionada em `tests/e2e/` usando **Chrome DevTools Protocol (CDP) puro** sobre Node.js 24 + `google-chrome --headless=new`, executando contra uma exportação Web estática isolada em modo memória (`EXPO_PUBLIC_BACKEND=memory` em `dist-e2e/`).

## Consequências

- **Positivas:**
  - Zero dependências novas no `package.json` (sem Playwright, Puppeteer ou `ws`).
  - Execução determinística e offline-friendly, sem depender do Supabase remoto ou sujar o `dist/` de produção.
  - Validação real de renderização, roteamento do Expo Router, armazenamento local e interação DOM no Chromium.
- **Negativas / Trade-offs:**
  - Não testa chamadas reais ao Supabase nem fluxos nativos exclusivos de Android/iOS (que seguem dependendo de aparelho físico/emulador e Maestro).
  - Exige `google-chrome` (ou Chromium) disponível no PATH do ambiente de execução.

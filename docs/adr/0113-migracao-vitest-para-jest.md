# 0113 — Migração do motor de testes de Vitest para Jest

- **Data:** 2026-11-17
- **Status:** Aceito (substitui o item 1 do [ADR 0003](0003-estrategia-testes-iso25010.md))

## Contexto

A suíte automatizada do Ipebook utilizava Vitest (`vitest` e `@vitest/coverage-v8`) desde a fundação do projeto ([ADR 0003](0003-estrategia-testes-iso25010.md)). Por solicitação explícita para alinhar o projeto ao executor padrão do ecossistema React Native/Expo (Jest), tornou-se necessário migrar toda a suíte (unitários, hooks, componentes com RNTL, mocks de tela, integração e cobertura V8) sem perda de cobertura nem relaxamento dos limiares mínimos de 80% da norma ISO/IEC 25010.

## Decisão

1. **Motor de testes e transformação:** Adotar **Jest** com `babel-jest` e `babel-preset-expo` em ambiente Node (`testEnvironment: "node"`), preservando o isolamento determinístico dos mocks nativos via `moduleNameMapper` em [`jest.config.cjs`](../../jest.config.cjs).
2. **Compatibilidade ESM/Assets:** Mapear arquivos estáticos (`.png`, fontes e mídias) para [`tests/mocks/fileMock.cjs`](../../tests/mocks/fileMock.cjs) e aplicar o plugin [`tests/babelJestEsmCompat.cjs`](../../tests/babelJestEsmCompat.cjs) para transformar `import()` dinâmicos e `import.meta` durante a execução no Jest em CommonJS.
3. **Helpers e contratos de teste:** Substituir utilitários exclusivos do Vitest (`vi.*`, `vi.hoisted`, `importOriginal`, `toHaveBeenCalledOnce`) pelos equivalentes do Jest (`jest.*`, prefixo `mock*`, `jest.requireActual`, `toHaveBeenCalledTimes(1)`) e pelo helper [`tests/helpers/stubGlobal.ts`](../../tests/helpers/stubGlobal.ts) para `stubGlobal`/`unstubAllGlobals`.
4. **Cobertura e relatório:** Manter o provedor V8 (`coverageProvider: "v8"`) com limiar mínimo de **80%** em *statements*, *branches*, *functions* e *lines*, exportando `coverage/relatorio-testes.json` via `--json --outputFile=coverage/relatorio-testes.json` para manter a conferência automática em `npm run check:docs`.

## Consequências

- **Positivas:**
  - Alinhamento com o executor padrão do ecossistema Jest/React Native/Expo (`jest`, `@types/jest`, `babel-jest`).
  - Remoção completa de `vitest`, `@vitest/coverage-v8` e `vitest.config.mts`, preservando a mesma pirâmide de testes, cobertura V8 ≥ 80% e validação unificada em `npm run validate`.
- **Negativas / Trade-offs:**
  - Requer o plugin auxiliar `babelJestEsmCompat.cjs` para suportar `import()` dinâmico e `import.meta.url` em scripts `.mjs` sem habilitar `--experimental-vm-modules`.
  - Mocks que usam `jest.mock()` precisam respeitar as regras de hoisting do Babel/Jest (variáveis prefixadas com `mock*` e fábricas síncronas).

Vínculos: [ADR 0003](0003-estrategia-testes-iso25010.md), [qualidade.md](../qualidade.md), [jest.config.cjs](../../jest.config.cjs).

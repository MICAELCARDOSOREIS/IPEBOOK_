# Especificação 131 — Design harmonioso de erros visuais, auto-recuperação de conexão e tratamento de rede

**Estado:** Especificada em 2026-11-09  
**ADR:** [0102](../../docs/adr/0102-design-de-erros-e-auto-recuperacao-offline.md)

## Objetivo e escopo

Harmonizar visualmente todas as mensagens de erro do front-end com o Design System do IpêBook (eliminando textos vermelhos soltos e desalinhados) e tornar o modo offline inteligente por meio de auto-recuperação de tela ao restabelecer sinal e mensagens com diagnóstico semântico de rede.

## Regras de negócio

- **RN-01 (Card visual para erros inline):** Mensagens de erro de formulários, submissões e ações devem ser apresentadas no componente `InlineErrorCard`, contendo fundo `colors.errorContainer`, borda sutil, ícone `error`, tipografia padronizada e papéis de acessibilidade (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`).
- **RN-02 (Aprimoramento de `ErrorState` e `OfflineState`):** Os componentes de estado global de erro e offline devem ser apresentados em um cartão acolhedor centralizado, com respiro, ícone circular e botão de ação primária bem dimensionado (mínimo de 48 dp).
- **RN-03 (Auto-recuperação do `OfflineState`):** Quando a tela estiver em `OfflineState` e o status de rede transicionar de desconectado para conectado (`isOnline: false -> true`), a função `onRetry` deve ser acionada automaticamente, sem exigir toque manual.
- **RN-04 (Diagnóstico semântico de rede no Supabase):** Erros de transporte HTTP (`Network request failed`, `Failed to fetch`, `AbortError`) devem ser traduzidos para mensagens claras em português sobre queda de conexão (*"Sem conexão com a internet. Verifique sua rede e tente novamente."*).
- **RN-05 (Preservação de contratos e acessibilidade):** Manter 100% dos testes e catracas arquiteturais aprovados, sem regressões.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Componente `InlineErrorCard` criado e aplicado em substituição a textos soltos de erro. | `src/view/components/InlineErrorCard.tsx`, `tests/components/inlineErrorCard.test.tsx` |
| CA2 | `ErrorState` e `OfflineState` atualizados com design acolhedor centralizado. | `src/view/components/ErrorState.tsx`, `src/view/components/OfflineState.tsx` |
| CA3 | `OfflineState` executa `onRetry` automaticamente quando a rede volta a ficar online. | `tests/components/offlineStateAutoRetry.test.tsx` |
| CA4 | `toDomainError` identifica falhas de rede e produz mensagem de conectividade amigável. | `src/infra/supabaseErrors.ts`, `tests/unit/supabaseErrors.test.ts` |
| CA5 | Pipeline completo `npm run validate` aprovado com 0 erros. | `npm run validate` |

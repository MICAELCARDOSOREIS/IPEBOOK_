# Especificação 105 — Avaliação na loja e atualizações sem loja

Status: implementada e testada localmente; vale a partir da próxima build nativa. ADR: [0081](../../docs/adr/0081-atualizacoes-eas-update.md).

## Objetivo
Pedir a nota do app na loja no momento certo e permitir corrigir erros de JavaScript sem esperar a revisão da Play Store.

## Regras
- **RN-01** Depois de enviar uma avaliação de 4 ou 5 estrelas numa negociação, o app pede a avaliação nativa da loja (`expo-store-review`), no máximo uma vez por abertura; o sistema decide se mostra.
- **RN-02** Sem loja (web, emulador) ou com erro, nada acontece.
- **RN-03** `expo-updates` com `runtimeVersion` pela versão do app: cada build só recebe atualizações da mesma versão; o app busca ao abrir e aplica na abertura seguinte. Canais `development`, `preview` e `production` no `eas.json`.

## Como publicar uma correção sem loja
`eas update --channel production --message "descrição"` (só muda JavaScript e imagens; mudança nativa exige build nova e versão nova).

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | RN-01 | `tests/hooks/useNegotiationRatingViewModel.test.tsx` |
| CA2 | RN-01 e RN-02 no serviço | `tests/unit/expoStoreReviewService.test.ts` |
| CA3 | RN-03 configurado sem chaves | `npm run check:build-config`; `npm run build:web` |

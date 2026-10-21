# Validação — Spec 037

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/unit/requestDetailUseCases.test.ts`: cada ponto seguro retornado por `getRequestDetail`
  possui `name`, `address` e `recommendedTime` preenchidos (RN-01).
- `tests/components/requestDetailView.test.tsx`:
  - renderização de endereço de cada ponto no cartão "Encontro seguro em Piripiri";
  - toque em "Como chegar" aciona `Linking.openURL` com a URL de busca do Google Maps contendo o
    endereço do ponto (RN-02, critério 2);
  - falha em `Linking.openURL` (rejeição) exibe mensagem de erro acessível (`accessibilityRole="alert"`)
    específica do ponto, sem interromper a renderização dos demais (RN-03, critério 3);
  - rótulo de acessibilidade do botão identifica o ponto ("Como chegar à Campus IFPI Piripiri")
    (RN-04, critério 4).
- `tests/hooks/useRequestDetailViewModel.test.tsx` e `tests/integration/requestDetailIntegration.test.tsx`
  atualizados para a nova estrutura de `safeMeetingPoints`.

## Comandos executados

- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  **781 testes, 114 arquivos, todos aprovados.**

## Limitações

- Fluxo real no dispositivo (toque efetivo abrindo Google Maps/Apple Maps) não verificado via ADB
  nesta entrega; apenas o contrato de chamada a `Linking.openURL` foi validado por teste
  automatizado. Fica como validação manual pendente antes da publicação.
- Foto/ilustração de cada ponto (Figma `06.06`) não foi implementada — fora de escopo (ver spec).

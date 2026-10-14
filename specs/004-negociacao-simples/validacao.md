# Validação: negociação simples

Data: 2026-10-14. Base: `develop`, após o merge do PR #44 (issue #21).
Estado: implementação integrada em `develop`; validação automatizada local aprovada após a
correção da geração dos tipos de rota. Fluxo em dispositivo físico não verificado nesta etapa.

## Correção de tipagem

Antes desta correção, `npm run validate` parava em `tsc --noEmit` porque o arquivo gerado e
ignorado `.expo/types/router.d.ts` não incluía `/pedidos-recebidos` e `/meus-pedidos`. O script
`typecheck` agora executa `expo customize tsconfig.json` antes de `tsc --noEmit`, conforme a
[documentação de rotas tipadas do Expo](https://docs.expo.dev/router/reference/typed-routes/).
Para verificar a geração desde um estado sem tipos prévios, o arquivo gerado foi removido
temporariamente antes da execução; o comando o recriou com ambas as rotas.

## Evidências locais

- `npm run validate`: código de saída 0. TypeScript sem erros; verificador de arquitetura:
  45 arquivos, nenhuma violação; Vitest: 144 testes aprovados em 24 arquivos.
- Cobertura total: 94,19% statements, 82,54% branches, 94,44% funções e 95,88% linhas;
  todas as métricas acima do limite de 80%.
- SC-002 é coberto por `tests/integration/sc002Integration.test.tsx`; os bloqueios e a recusa
  automática também têm testes em `tests/unit/bookRequestUseCases.test.ts`.
- SC-003: `npm run validate` passou após regenerar as rotas.

## Limites

- Não houve validação manual do fluxo SC-001 em dispositivo físico nesta correção.
- `npm run build:web` não foi repetido nesta correção. O resultado anterior está registrado em
  `docs/estado.md`.
- A persistência permanece em memória; os pedidos desaparecem ao encerrar a execução.

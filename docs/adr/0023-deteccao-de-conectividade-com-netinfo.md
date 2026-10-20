# 0023 — Detecção de conectividade com `@react-native-community/netinfo`

Data: 2026-10-20. Status: aceito.

## Contexto

A spec 021 (issue #76) pede um estado "sem conexão" reaproveitável, que detecte perda de
conectividade de rede, distinto do estado de erro genérico (`ErrorState`). O projeto não tinha
nenhuma dependência de detecção de rede instalada.

Duas abordagens foram consideradas:

- **Sem dependência nova**: inferir "sem conexão" apenas pelo tipo de erro retornado pelo
  datasource (ex.: `TypeError: Failed to fetch`), sem um listener ativo de conectividade.
- **Com dependência nova**: usar `@react-native-community/netinfo`, biblioteca padrão do
  ecossistema React Native/Expo para esse fim, com listener ativo de conectividade em
  iOS/Android/Web.

A primeira opção foi apresentada ao usuário como padrão simples, sem custo de dependência; o
usuário optou explicitamente pela segunda, priorizando detecção real de conectividade.

## Decisão

Adicionar `@react-native-community/netinfo` (instalado via `npx expo install`, garantindo a
versão compatível com o SDK do Expo do projeto), isolado atrás do contrato
`INetworkStatusDataSource` (`src/model/datasources/`), com duas implementações em `src/infra/`:

- `NetInfoNetworkStatusDataSource`: produção, usa o NetInfo real.
- `MemoryNetworkStatusDataSource`: testes e fallback, sempre reporta "online".

O hook `useNetworkStatus` (viewmodel) consome o datasource via `src/di/container.ts`, seguindo o
mesmo padrão de injeção já usado para os demais datasources do projeto (Auth, Book, etc.).

`isConnected === false` é o único caso tratado como offline; `null` (estado ainda não
determinado pelo NetInfo) é tratado como online, conforme a documentação da própria biblioteca
recomenda, para não piscar "sem conexão" no instante inicial.

## Alternativas consideradas

- **Inferir pelo erro do datasource, sem nova dependência:** rejeitada pelo usuário. Teria a
  vantagem de não adicionar dependência nativa nova ao build gerenciado pelo Expo, mas não
  detecta ativamente a perda de conectividade — só reage a falhas de chamada já ocorridas.

## Consequências

- Nova dependência nativa no projeto, instalada e gerenciada via `expo install` (compatibilidade
  de versão com o SDK garantida automaticamente).
- Testes precisam de mock dedicado (`tests/mocks/netinfo.ts`/`.cjs`), seguindo o mesmo padrão já
  usado para `react-native`, `expo-symbols` e `@expo/vector-icons` neste projeto.
- Se o projeto decidir, no futuro, operar em modo offline de verdade (cache local, fila de ações
  pendentes — hoje fora de escopo, ver spec 021), esta decisão é a base a partir da qual isso
  seria construído.

Vínculos: [spec 021](../../specs/021-estados-globais-de-carregamento-e-erro/spec.md),
[design-system/04-componentes/estados-do-sistema.md](../../design-system/04-componentes/estados-do-sistema.md).

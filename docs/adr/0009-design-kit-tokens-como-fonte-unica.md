# 0009 — `design-kit/tokens.json` como fonte única de tokens; carregamento de fonte no Expo

Data: 2026-10-14. Status: **substituído por [ADR 0010](0010-design-system-substitui-design-kit.md)**
(que move a fonte única de `design-kit/tokens.json` para `design-system/tokens.json` e remove
`design-kit/` do repositório). O registro abaixo é mantido como histórico da decisão original;
a decisão sobre carregamento de fonte no Expo (item 3) continua válida. Substitui parcialmente
o item 2 do [ADR 0004](0004-design-system-e-tokens-ihc.md).

## Contexto

O repositório tinha dois arquivos de tokens: `design-tokens.json` (raiz, formato DTCG, decidido
no ADR 0004) e `design-kit/tokens.json` (trazido do Design System artifact em 2026-10-14, ver
[docs/estado.md](../estado.md)), mais completo — inclui papéis Material 3, tags de modalidade
(Venda/Troca/Doação/Reservado/Concluído), capas ilustrativas e escalas tipográficas por
plataforma (Android, iOS, Web, marca). Isso bloqueava a Tarefa 23/24 (implementação das telas),
que não sabiam qual seguir. Faltava também decidir como carregar as fontes da marca
(Source Serif 4 Bold, ADR 0007) e da interface no Expo/React Native.

## Decisão

1. **`design-kit/tokens.json` é a fonte única de tokens daqui para frente.** `design-tokens.json`
   na raiz foi removido. `src/view/tokens.ts` continua sendo o módulo TypeScript consumido pelo
   código (mantendo o que o ADR 0004 já decidiu sobre isso), mas seus valores agora vêm de
   `design-kit/tokens.json`, tema claro apenas (ADR 0008).
2. **Chaves antigas de `tokens.ts` preservadas** (`colors.action`, `colors.background` etc.) para
   não quebrar `src/view/home.tsx` e os testes existentes. Um novo grupo `colors.m3` foi
   acrescentado com os papéis Material 3 que ainda não tinham equivalente (`onSurface`,
   `surfaceContainer*`, `secondaryContainer`, `doacaoContainer` etc.), para uso em componentes
   novos das specs 003/004.
3. **Fontes carregadas via `expo-font` + pacotes `@expo-google-fonts`:**
   `@expo-google-fonts/source-serif-4` (peso 700, a marca) e `@expo-google-fonts/roboto` (pesos
   400/500/600, a interface) — ambos instalados, e `src/view/useIpebookFonts.ts` criado com o
   hook `useIpebookFonts()`, usado em `src/app/_layout.tsx` para bloquear a renderização até as
   fontes carregarem.
4. **Roboto no lugar de Roboto Flex:** o design-kit especifica "Roboto Flex" como fonte de
   interface, mas o pacote `@expo-google-fonts/roboto-flex` só distribui o corte estático
   Regular (é uma fonte variável; o gerador do Expo não gera cortes de peso para ela). Como a
   tipografia dos tokens usa pesos 400/500/600, foi usado `@expo-google-fonts/roboto`
   (família próxima, com cortes estáticos reais nesses pesos) em vez de inventar negrito
   sintético. Isso é uma pequena divergência visual assumida — registrada aqui, não escondida.

## Alternativas consideradas

- Manter os dois arquivos de tokens e deixar quem implementar decidir: rejeitada — é exatamente
  o bloqueio que gerou esta tarefa.
- Usar Roboto Flex mesmo com um peso só (Regular) e simular negrito/semibold via `fontWeight`
  sobre uma fonte customizada: rejeitada — React Native não sintetiza peso de forma confiável
  sobre uma fonte carregada manualmente; o resultado visual seria pior que usar Roboto estático.

## Consequências

- `design-tokens.json` não existe mais; qualquer link para ele (ADR 0004, `docs/design-system.md`)
  deve apontar para `design-kit/tokens.json`.
- Telas futuras (specs 003/004) já têm fonte da marca carregada e papéis Material 3 disponíveis
  em `tokens.colors.m3`, sem precisar redecidir isso.
- Contraste: os pares de cor documentados em `design-kit/tokens.json` (ex. `on-surface` sobre
  `surface`, 16,5:1) já trazem a razão de contraste calculada nas notas de uso de origem; uma
  verificação pontual de 4 pares críticos (texto principal, texto de apoio, erro, anel de foco,
  todos sobre `surface` clara) confirmou os valores documentados dentro da margem de
  arredondamento esperada. Não foi feita uma auditoria de todos os ~50 tokens de cor.

Vínculos: [ADR 0004](0004-design-system-e-tokens-ihc.md), [ADR 0007](0007-serifa-da-marca.md),
[ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md),
[design-system/README.md](../../design-system/README.md).

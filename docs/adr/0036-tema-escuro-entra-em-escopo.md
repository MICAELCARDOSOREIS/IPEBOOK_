# 0036 — Tema escuro entra em escopo (substitui a decisão 1 da ADR 0008)

Data: 2026-10-21. Status: aceito.

## Contexto

A [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md) decidiu, em 2026-10-14, adiar o
tema escuro: "o app usa só o tema claro... sem benefício claro para o MVP decidido". As decisões
2–4 daquela ADR (Android segue Material Design 3, iOS segue Liquid Glass quando entrar em escopo,
Web sem tema escuro) permanecem válidas e não são reabertas aqui.

A Issue #147 (auditoria de acessibilidade, fluxo 12) pediu explicitamente o suporte a tema escuro
como item de acessibilidade — contraste e preferência do usuário, não só estética. `design-system/
tokens.json` já documenta os 50 tokens com par `light`/`dark` e a razão de contraste de cada um
(ex. `primary` claro `#2c5e45` 7,2:1 → escuro `#9fd4b3` 11,1:1), preparado desde a ADR 0008 para
esse momento.

## Decisão

1. **Tema escuro entra em escopo.** Substitui a decisão 1 da ADR 0008. O app passa a detectar o
   tema do sistema operacional (`useColorScheme`) e permite alternância manual (Sistema/Claro/
   Escuro), persistida no dispositivo.
2. **Só os tokens semânticos mudam de valor** — nenhum componente muda de estrutura, exatamente
   como a ADR 0008 já previa ao adiar a decisão. `src/view/tokens.ts` ganha um par `colors`
   (claro, já existente, inalterado) / `darkColors` (novo), ambos com a mesma forma.
3. **Entrega incremental.** Dado o tamanho da superfície (49 arquivos de view consomem
   `tokens.colors` hoje), esta entrega cobre a infraestrutura completa (detecção de sistema,
   alternância manual persistida, `ThemeProvider`/`useTheme`) mais a Home e os componentes do
   Design System que ela usa diretamente, como fatia vertical completa e verificável. A migração
   das telas restantes fica registrada como trabalho de acompanhamento (ver Issue de
   continuação vinculada no PR desta entrega).
4. Tokens sem par `dark` documentado em `tokens.json` (ex. `success` como cor de texto) usam o
   equivalente semântico mais próximo já definido (`primary` escuro), verificado por teste de
   contraste automatizado — nunca um valor inventado sem checagem.

## Alternativas consideradas

- Migrar todas as ~49 telas de uma vez: rejeitada por tamanho e risco — um único PR gigante
  dificulta revisão e aumenta a chance de regressão visual sem validação real tela a tela.
- Inventar uma paleta escura nova em vez de reaproveitar `tokens.json`: rejeitada — o trabalho de
  design e de verificação de contraste já existe e está documentado; reaproveitá-lo evita
  divergência entre o Figma e o código.

## Consequências

- A decisão 1 da ADR 0008 está substituída; as decisões 2–4 continuam valendo.
- `src/view/tokens.ts` deixa de ser só o recorte claro: ganha `darkColors` e passa a ser
  consumido através de `useTheme()` (via `ThemeProvider` em `src/app/_layout.tsx`) nos arquivos já
  migrados, em vez de `tokens.colors` direto.
- Testes de contraste (`tests/unit/themeContrast.test.ts`) travam qualquer regressão de
  acessibilidade nos pares claro/escuro verificados.
- Arquivos de view ainda não migrados continuam funcionando normalmente em tema claro fixo até
  serem migrados na issue de acompanhamento.

Vínculos: [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md) (parcialmente
substituída), [design-system/02-tokens.md](../../design-system/02-tokens.md) §4.

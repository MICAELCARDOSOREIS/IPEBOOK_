# Como usar esta pasta

Conteúdo trazido em 2026-10-14 do Design System do IpêBook publicado como Artifact
(`https://claude.ai/artifact/DL8SuFjyx3YpgAer81fvoh`), para a equipe usar ao implementar as
telas das specs 003 e 004 (`specs/003-autenticacao-e-cadastro-de-anuncio/`,
`specs/004-negociacao-simples/`).

## O que tem aqui

- `README.md` — o brand book: cor, tipografia, espaçamento, estados, plataformas,
  acessibilidade e iconografia do IpêBook. Leitura obrigatória antes de estilizar qualquer tela.
- `tokens.json` — os tokens de design (cor, tipografia, espaçamento, raio, elevação, movimento).
  **É a fonte única de tokens do projeto** (ADR 0009) — `src/view/tokens.ts` consome os valores
  daqui.
- `components/<Nome>/README.md` — guia de uso de cada um dos 23 componentes (Button, TextField,
  BookCover, BookRow, Dialog, EmptyState, NavigationBar, Snackbar, TopAppBar etc.).
- `components/<Nome>/preview.html` — exemplo visual de cada componente, renderizado com o
  bundle abaixo (eles rodam dentro do artifact original; aqui servem como referência de marcação
  e classes CSS, não para abrir direto no navegador fora do artifact).
- `components/bundle.js` / `bundle.css` / `index.d.ts` — implementação de referência em React
  Web (`window.React`/`window.ReactDOM` globais) dos 23 componentes, com classes CSS prefixadas
  `ipb-*` que consomem os tokens via `var(--token)`. **É React Web, não React Native** — o
  Ipebook é Expo/React Native, então isto não roda direto no app; serve como referência de
  nomes de classe, estrutura e regras de acessibilidade (rótulos, `aria-*`, alvo de toque) para
  recriar os componentes equivalentes em `src/view/components/`.

## Resolvido: `tokens.json` desta pasta é a fonte única (ADR 0009)

`design-tokens.json` que existia na raiz foi removido. `design-kit/tokens.json` é agora o
contrato canônico; `src/view/tokens.ts` consome seus valores (tema claro — ADR 0008), mantendo
as chaves antigas (`colors.action` etc.) e acrescentando `colors.m3` com os papéis Material 3
que ainda não tinham equivalente. Fontes (Source Serif 4 Bold e Roboto) já carregam via
`src/view/useIpebookFonts.ts`, chamado em `src/app/_layout.tsx`. Ver
[ADR 0009](../docs/adr/0009-design-kit-tokens-como-fonte-unica.md) para o registro completo,
incluindo por que Roboto (não Roboto Flex) foi usado.

## Decidido: sem dark mode; Android Material 3, iOS Liquid Glass (ADR 0008)

- **Sem tema escuro nesta etapa.** Ignorar os valores `dark` em `tokens.json` ao reconciliar os
  tokens — só o tema claro entra em código agora. Não implementar toggle de tema nem lógica de
  `useColorScheme`.
- **Android segue Material Design 3** (compostos, elevação, `surface-container-*`, navegação de
  5 destinos) — ver `README.md` deste kit, seção "Plataformas".
- **iOS segue Liquid Glass** (vidro em controles flutuantes) **só quando/se iOS voltar ao
  escopo** — hoje a plataforma-alvo é Android e Web (Tarefa 4). Não implementar nada de Liquid
  Glass agora; é só a intenção registrada para o futuro.
- Ver [ADR 0008](../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md) para o
  registro completo da decisão.

## Como usar ao implementar

1. Ler `README.md` (este README do design-kit) para entender voz, cor, tipografia e regras de
   acessibilidade antes de montar uma tela nova.
2. Para cada componente novo de UI (botão, campo de texto, diálogo etc.), abrir o
   `components/<Nome>/README.md` correspondente e seguir a nota de uso.
3. Recriar o componente em `src/view/components/` como componente React Native, usando
   `src/view/tokens.ts` (incluindo o novo grupo `colors.m3`) em vez de valores soltos, seguindo
   o padrão já usado em `src/view/components/AppIcon.tsx`, `IconBadge.tsx` e `Icon.tsx`.
4. Não copiar o HTML/CSS Web diretamente — ele é referência de estrutura e acessibilidade, não
   código para colar no app.

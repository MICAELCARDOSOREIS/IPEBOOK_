# Tarefa 26 (Micael) — Resolver pendências técnicas do design-kit

Responsável: Micael Cardoso Reis
Depende de: —
Bloqueia: implementação das telas nas Tarefas 23 (Maria Clara) e 24 (Eric)

## Contexto

Ao trazer `design-kit/` para o repositório, ficaram pendentes 3 itens técnicos (dark mode e a
linguagem visual por plataforma já foram decididos — ver
[ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)):

1. **Dois arquivos de tokens** (`design-tokens.json` na raiz e `design-kit/tokens.json`) sem
   decisão de qual usar — ver `design-kit/USO.md`.
2. **Carregamento de fontes**: `design-kit/components/bundle.css` carrega Source Serif 4 e
   Roboto Flex via `@import url(...)` do Google Fonts, que não funciona em React Native —
   ninguém decidiu como carregar essas fontes no Expo.
3. **Contraste não verificado**: o `README.md` do kit afirma contraste 4.5:1/3:1 em várias
   combinações, mas ninguém mediu os valores reais que o app vai usar (agora só tema claro,
   depois do ADR 0008).

## O que fazer

1. Decidir entre `design-tokens.json` (já em uso, `src/view/tokens.ts`) e `design-kit/tokens.json`
   (mais completo: modalidade, capas ilustrativas) — provavelmente migrar para o segundo,
   removendo os valores de tema escuro (fora de escopo pelo ADR 0008), e atualizar
   `src/view/tokens.ts` para consumir o resultado. Registrar a escolha num ADR novo.
2. Escolher e configurar o mecanismo de carregamento de fonte no Expo (`expo-font` com arquivo
   local, ou `@expo-google-fonts/source-serif-4` e `@expo-google-fonts/roboto-flex`, se
   existirem como pacotes) para a serifa da marca e a interface Android/Web.
3. Medir o contraste real das combinações de cor que o app vai usar (ex. com uma ferramenta de
   contraste) e corrigir no README do kit ou nos tokens qualquer valor que não bata com o que
   está documentado.

## O que não fazer

- Não implementar dark mode nem toggle de tema — fora de escopo (ADR 0008).
- Não implementar nada de iOS/Liquid Glass agora — fora do escopo de plataformas (Tarefa 4).

## Entregável

Token único em uso por `src/view/tokens.ts`, fontes carregando corretamente no Expo, e
contraste real verificado — para que Maria Clara e Eric não precisem decidir isso no meio da
implementação das telas.

---

## Registro de execução

- Data: 2026-10-14
- Decisão de tokens: `design-kit/tokens.json` é a fonte única; `design-tokens.json` na raiz foi
  removido. `src/view/tokens.ts` passou a refletir esses valores (tema claro), mantendo as
  chaves antigas intactas e acrescentando `colors.m3` com os papéis Material 3 ainda não
  cobertos. Registrado em [ADR 0009](../../docs/adr/0009-design-kit-tokens-como-fonte-unica.md).
- Mecanismo de fonte escolhido: `expo-font` + `@expo-google-fonts/source-serif-4` (peso 700,
  marca) e `@expo-google-fonts/roboto` (pesos 400/500/600, interface) — não `roboto-flex`, que só
  tem o corte estático Regular disponível via Expo. Hook `src/view/useIpebookFonts.ts`, usado em
  `src/app/_layout.tsx` (bloqueia a renderização até carregar).
- Contraste verificado (resultado): calculados manualmente (fórmula WCAG de luminância relativa)
  6 pares críticos — todos bateram com os valores documentados no `tokens.json`: on-surface/
  surface 16,47:1, on-surface-variant/surface 8,79:1, error/surface 6,27:1, focus-ring/surface
  3,90:1, on-secondary-container/secondary-container 12,10:1, on-doacao-container/
  doacao-container 7,02:1. Não foi feita auditoria dos ~50 tokens de cor restantes.
- Testes: `npm run validate` passa (typecheck, arquitetura, 36 testes, cobertura 98,79%
  statements). Novo teste em `tests/unit/useIpebookFonts.test.ts`.
- Pendências: nenhuma das 3 originais. Resta, para quem implementar as telas, efetivamente usar
  `fontFamily`/`colors.m3` nos componentes novos (não é desta tarefa).

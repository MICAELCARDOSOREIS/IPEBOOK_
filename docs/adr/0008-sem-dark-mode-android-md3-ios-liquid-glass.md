# 0008 — Sem dark mode nesta etapa; Android segue Material Design 3, iOS segue Liquid Glass

Data: 2026-10-14. Status: aceito.

## Contexto

Ao revisar `design-kit/` (trazido do Design System artifact, ver
[docs/estado.md](../estado.md)), ficaram pendentes: se o tema escuro entraria no escopo, e qual
linguagem visual cada plataforma deveria seguir — o `design-kit/tokens.json` já trazia tema
claro e escuro completos, e o README do kit menciona Material 3 (Android) e componentes
oficiais do iOS lado a lado, sem o projeto ter decidido isso formalmente.

Isso é uma decisão de design, separada da decisão de plataformas já registrada no
[ADR de plataformas (Tarefa 4)](../../tasks/eric-vinicius-dos-santos-oliveira/04-plataformas.md):
lá ficou decidido que a primeira entrega cobre Android e Web, com iOS fora por enquanto. Este
ADR não reabre essa decisão — só documenta a linguagem visual pretendida para quando/se cada
plataforma for implementada.

## Decisão

1. **Sem dark mode nesta etapa.** O app usa só o tema claro. Os valores de tema escuro que já
   existem em `design-kit/tokens.json` ficam guardados para uso futuro, não implementados agora.
2. **Android segue Material Design 3** — compostos, elevação, tokens de superfície
   (`surface-container-*`) e barra de navegação de 5 destinos conforme já documentado em
   `design-kit/README.md`, seção "Plataformas".
3. **iOS segue Liquid Glass** (linguagem visual da Apple a partir do iOS 26, com vidro —
   `glass-fill`/`glass-stroke` — em controles flutuantes) **quando iOS entrar em
   implementação** — hoje continua fora do escopo da primeira entrega (ADR de plataformas,
   Tarefa 4). Não implementar nada de Liquid Glass agora; isto só registra a intenção para
   quando essa decisão de escopo mudar.
4. **Web** segue a terceira variação já documentada no kit (cabeçalho com busca, grade de
   cartões), sem tema escuro, consistente com a decisão 1.

## Alternativas consideradas

- Implementar dark mode desde já: rejeitada — aumenta o escopo de toda tela nova (duas versões
  de cada cor) sem benefício claro para o MVP decidido.
- Um único visual neutro para Android e iOS (sem diferenciar Material 3 de Liquid Glass):
  rejeitada — o design-kit já documenta as duas linguagens separadamente, e unificá-las
  descartaria trabalho de design já feito.

## Consequências

- Nenhuma tela precisa, por ora, de lógica de tema (claro/escuro) nem de toggle de tema.
- Quando a implementação para iOS for retomada, ela segue Liquid Glass, não os mesmos
  componentes Material usados no Android — os dois não devem compartilhar os mesmos arquivos de
  componente de UI específicos de plataforma.
- `design-kit/USO.md` é atualizado para registrar esta decisão e evitar que alguém implemente
  dark mode ou misture as linguagens visuais por engano.

Vínculos: [design-kit/USO.md](../../design-kit/USO.md),
[design-kit/README.md](../../design-kit/README.md),
[tasks/eric-vinicius-dos-santos-oliveira/04-plataformas.md](../../tasks/eric-vinicius-dos-santos-oliveira/04-plataformas.md).

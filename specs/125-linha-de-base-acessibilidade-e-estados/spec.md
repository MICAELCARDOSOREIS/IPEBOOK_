# Spec 125 — Linha de base de acessibilidade e consistência de estados nas telas

## Contexto

A análise integral das 136 telas de `src/view` e das 45 rotas de `src/app` (2026-11-05) confirmou que o design system **já tem a regra escrita** e que a auditoria anterior (Issue #96, `docs/auditoria-acessibilidade.md`) já corrigiu três achados via issues #104, #105 e #106. O que falta aqui é aplicação uniforme das regras vigentes, não regra nova: seis padrões existem em alguns componentes e não nos seus vizinhos, de forma que o usuário de leitor de tela, de tela estreita ou de conexão instável recebe tratamento diferente dependendo da tela.

Base normativa reutilizada (nada aqui inventa critério novo):

- `design-system/06-acessibilidade.md:21-25` — alvo de toque mínimo de 48 dp, com o `Chip` de 32 px compensado por padding invisível.
- `design-system/06-acessibilidade.md:38-41` — mensagens de status com `accessibilityLiveRegion="polite"` e diálogo que prende o foco e devolve ao gatilho.
- `design-system/06-acessibilidade.md:45-46` — nada de altura fixa em elemento com texto: cresce ou quebra, nunca corta.
- `docs/auditoria-acessibilidade.md:99-117` — o precedente de prisão de foco aplicado em `Dialog.tsx` (issue #105), que este spec estende aos demais modais.

Decisão arquitetural relacionada: [ADR 0097](../../docs/adr/0097-linha-de-base-acessibilidade-e-estados-das-telas.md).

## Defeitos e comportamento esperado

| # | Defeito (evidência) | Comportamento esperado |
|---|---|---|
| D1 | Modais sem barreira de acessibilidade: `PhotoSourceSheet.tsx:23` e `BarcodeScannerModal.tsx:62` abrem `<Modal>` sem `accessibilityViewIsModal`, enquanto `Dialog.tsx:139`, `FilterSheet.tsx:83`, `SortSheet.tsx:39`, `ProposalSheet.tsx:76`, `ReservedListingSheet.tsx:59` e `NegotiationRatingModal.tsx:52` já usam. Os dois também ficaram de fora da prisão de foco na Web estabelecida para o `Dialog`. | Todo modal isola o conteúdo de fundo no nativo (`accessibilityViewIsModal`) e, na Web, prende o foco enquanto aberto e o devolve ao gatilho ao fechar. |
| D2 | Pinos do mapa nativo abaixo do mínimo: `MeetingMap.native.tsx:113` (36 dp) e `MeetingMap.tsx:31` (`size = selected ? touchTarget : 36`) sem `hitSlop`. **O `Chip` não está neste defeito**: `Chip.tsx:33` usa `hitSlop={8}` (32 + 8 + 8 = 48), conforme já verificado em `docs/auditoria-acessibilidade.md:151-153`. | Pino não selecionado atinge 48 dp de área de toque por `hitSlop`, mantendo a arte em 36 dp — o mesmo artifício já usado no `Chip`. |
| D3 | Linhas de chips sem quebra: `editListing.tsx:423` (`modalityRow` é `row` + `gap`, sem `flexWrap`) usado em `:172` (5 categorias de `:44`), `:189` (4 estados de conservação), `:253` e `:289`. | As opções cabem na largura disponível quebrando linha; nada é cortado em 360 dp nem com fonte ampliada. |
| D4 | Estados de erro inventados, fora do componente padrão: `bookDetail.tsx:515,517-519` (erro como `Text` sem retry) e `searchAlerts.tsx:90,99,114` (erro vira *hint* de campo, carregando próprio). | Falha de datasource usa `ErrorState` com ação explícita de tentar de novo; offline usa `OfflineState`; carregando usa `LoadingState`. |
| D5 | Regiões vivas ausentes no feedback assíncrono: `ErrorState.tsx:27` e `OfflineState.tsx:31` têm `accessibilityRole="alert"` sem `accessibilityLiveRegion`; o par já é aplicado corretamente em `createListingStep1.tsx:168-169` e no `Snackbar`. | Mudança assíncrona de estado é anunciada sem exigir navegação, cumprindo `design-system/06-acessibilidade.md:38-39`. |
| D6 | Mensagem de senha incoerente com a regra de negócio: `src/infra/datasources/supabaseAuthDataSource.ts:104` orienta "mínimo 6 caracteres" contra `MIN_PASSWORD_LENGTH = 8` em `src/model/validators/authValidator.ts:6`. | A orientação visível deriva do validador; nenhum texto repete o limite como literal solto. |
| D7 | Rótulo acessível que contradiz a ação: `termsAndPrivacy.tsx:104-113` expõe `accessibilityLabel="Solicitar exclusão da minha conta e dados"` num botão que apenas navega para a tela de gerenciamento (o texto visível diz "exportar ou excluir"). | O rótulo descreve o destino real da ação; exportação e exclusão continuam separadas na tela de destino. |

## Critérios de aceite e testes

- **CA1** — `npm run check:design-system` passa a reprovar `<Modal>` em `src/view` sem barreira de acessibilidade, e um teste de componente cobre o anúncio de foto e o leitor de ISBN abertos. Prevenção automatizada, não só correção pontual.
- **CA2** — Pinos do mapa atingem `tokens.accessibility.touchTarget` somado ao `hitSlop`; o teste lê o valor do token em vez de número solto.
- **CA3** — `modalityRow` e equivalentes aplicam quebra de linha, verificado por teste de componente nas linhas de categoria, conservação e modalidade de `editListing`.
- **CA4** — `bookDetail` e `searchAlerts` exibem `ErrorState` com retry que aciona o `reload` do respectivo ViewModel; os testes de regressão falham antes da correção e passam depois.
- **CA5** — `ErrorState` e `OfflineState` anunciam a mudança: a bateria de `tests/unit/interactiveAccessibility.test.ts` é estendida para exigir o par `accessibilityRole="alert"` + `accessibilityLiveRegion`.
- **CA6** — A mensagem de senha deriva de `MIN_PASSWORD_LENGTH`, com teste que compara o texto do datasource ao validador.
- **CA7** — O botão de LGPD tem rótulo coerente com o destino, testado por `getByRole("button", { name: ... })`.
- **CA8** — `npm run validate` integralmente verde e as métricas de `docs/estado.md`/`README.md` conferidas por `npm run check:docs` (esta entrega soma uma spec, um ADR e os testes novos).

## Limitações de verificação

O ambiente de testes roda em Node com os mocks de `tests/mocks/react-native.ts`, sem DOM real: como já registrado em `docs/auditoria-acessibilidade.md:114-121`, a prisão de foco na Web é exercitada pela função pura extraída, não ponta a ponta, e TalkBack/axe-core continuam bloqueados (sem hardware e sem navegador conectado, e Playwright é proibido pelo projeto). A verificação efetiva destes critérios é estática e por teste de componente; a conferência sensorial real fica pendente para quem tiver aparelho ou navegador conectado.

## Fora do escopo

- **Entrada manual de ISBN** e o callback morto `onSetIsbn` (recebido em `createListingStep1.tsx:92` e nunca invocado): decisão de produto, spec própria.
- **Regras de negócio que vivem na View** (contagem de propostas da Spec 043 RN-03 em `myListings.tsx:93-100`, filtro `status !== "draft"` em `ownerListings.tsx`): mudança de camadas, revisão da constituição MVVM.
- **`src/app/**` fora da cobertura** e sem nenhum teste: infraestrutura de qualidade, entrega separada.
- **Refatoração dos componentes acima de 900 linhas** (`home.tsx`, `profileHub.tsx`, `bookDetail.tsx`, `scheduleMeeting.tsx`, `chat.tsx`) e o sequestro de rolagem/windowing do chat.
- **Os ~50 tokens de cor sem auditoria manual** e a verificação em TalkBack/axe-core, já registrados como pendências herdadas em `docs/auditoria-acessibilidade.md:161-173`.

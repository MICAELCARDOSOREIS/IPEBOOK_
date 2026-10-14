# Tarefa 5 — Integrar AppIcon, IconBadge e Icon na tela Home

> **Redistribuída em 2026-10-14.** Estava com o Eric; redistribuída junto com as demais
> tarefas/issues dele entre os integrantes. Issue [#1](https://github.com/Ghostyxseven/IPEBOOK_/issues/1)
> já foi reatribuída e **concluída** sob esta responsabilidade.

Responsável: Micael Cardoso Reis
Depende de: — (pode começar já, é ajuste técnico sobre o que já existe)
Bloqueia: nada diretamente, mas evita que o trabalho de design system fique "morto" no código

## Contexto

Ver [00-achados-da-analise.md](../00-achados-da-analise.md), achado 2.
`src/view/components/AppIcon.tsx`, `IconBadge.tsx` e `Icon.tsx` foram adicionados ao projeto,
mas `src/view/home.tsx` ainda renderiza tudo com `View`/`Text` simples, sem usar nenhum desses
componentes. O design system ([docs/design-system.md](../../docs/design-system.md)) já prevê
ícones e badges de modalidade — o código não reflete isso ainda.

## O que fazer

- Ler os três componentes (`AppIcon.tsx`, `IconBadge.tsx`, `Icon.tsx`) para entender a API que
  eles expõem (props, variantes).
- Avaliar onde, na tela atual (`src/view/home.tsx`), faz sentido usá-los sem inventar
  funcionalidade nova — por exemplo, ícone de status de carregamento/erro, ou badge visual
  simples se já houver campo de modalidade no modelo atual (senão, aguardar a Tarefa 7/8, que
  pode trazer o campo de modalidade para `Book`).
- Se os componentes dependerem de um campo que `Book` ainda não tem (ex.: modalidade), registrar
  isso como bloqueio nesta tarefa em vez de inventar dado falso na tela.

## O que não fazer

- Não forçar o uso de um componente numa tela onde ele não faz sentido ainda, só para "usar o
  que foi importado".
- Não mudar a arquitetura MVVM nem o contrato de `Book` aqui — isso é tarefa de modelo (Tarefa 2
  / Tarefa 7), não de view.

## Entregável

`src/view/home.tsx` (ou nova tela, se aplicável) usando os componentes visuais onde fizer
sentido no estado atual do produto, com os testes existentes continuando a passar (`npm test`
ou comando equivalente do projeto) e qualquer ajuste de acessibilidade (48×48dp, rótulos)
preservado conforme `docs/design-system.md`.

---

## Registro de execução

- Data: 2026-10-14
- O que foi integrado: `AppIcon` (name="error") no estado de erro de `src/view/home.tsx`, ao
  lado da mensagem de alerta já existente.
- O que ficou bloqueado (e por quê): o badge de modalidade (`IconBadge`) não foi aplicado —
  `Book` ainda não tem campo de modalidade (ver issue
  [#26](https://github.com/Ghostyxseven/IPEBOOK_/issues/26), Maria Clara).
- Testes executados e resultado: `npm test` 39/39 passando, `npm run typecheck` ok,
  `npm run check:architecture` sem violações, `npm run test:coverage` 98,79% statements.
- Pendências: nenhuma para o escopo atual. PR [#33](https://github.com/Ghostyxseven/IPEBOOK_/pull/33)
  mergeado em `develop`, issue #1 fechada.

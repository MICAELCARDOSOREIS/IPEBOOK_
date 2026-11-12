# Spec 124 — Correções do teste manual da Spec 123

**Data:** 2026-11-04
**Status:** implementada e validada localmente
**Relacionada:** Spec 123 (correções da análise integral), Spec 083 (acompanhar encontro), Spec 076/089 (Conversas), Spec 052 (encontro)

## Contexto

O teste manual no Chrome (Expo web, backend em memória), feito durante a revisão do PR da Spec 123, encontrou quatro defeitos que já existiam antes dele.

## Defeitos e comportamento esperado

| # | Defeito | Causa | Comportamento esperado |
|---|---------|-------|------------------------|
| 1 | Negociação pendente aparece com a etapa "Aceita" e mostra o erro "O encontro só pode ser combinado depois que o pedido for aceito." | `RequestDetail` marcava "Aceita" como concluída sempre e carregava o `MeetingCard` para qualquer status. | Pedido pendente mostra a etapa "Aguardando resposta" e um aviso que depende do papel, sem carregar o encontro. Pedido recusado ou cancelado esconde o andamento e informa o encerramento. |
| 2 | Depois de aceitar uma proposta e voltar, Conversas continua com o selo "Nova proposta". | A tela não recarregava ao voltar ao foco e dependia só do tempo real, que não avisa quem aceitou. | `/meus-pedidos` passa `focusKey` e a lista recarrega sempre que a tela volta ao foco. |
| 3 | Na web larga, o estado vazio de Notificações fica espremido à direita quando há aviso de permissão. | O aviso dividia a linha (`flexDirection: row`) com a lista. | O aviso ocupa a linha inteira (`flexWrap`); filtros e lista ficam abaixo dele. |
| 4 | Escolher o bairro em Criar anúncio gera `<button> cannot contain a nested <button>` na web. | O botão "Limpar bairro" ficava dentro do `Pressable` do campo. | O botão de limpar é irmão do campo, sobreposto na mesma posição. |

## Critérios de aceite e testes

- CA1: o pedido pendente mostra "Aguardando resposta" e nenhum "Combine o encontro"; o pedido recusado não mostra o andamento. Testado em `tests/components/requestDetailView.test.tsx`.
- CA2: a mudança de `focusKey` chama `reload` uma vez, e a primeira renderização não chama. Testado em `tests/components-mocked/conversationsView.test.tsx`.
- CA3: na web larga, o aviso tem `width: 100%` e a linha tem `flexWrap: wrap`. Testado em `tests/components-mocked/notificationsWideMocked.test.tsx`.
- CA4: o botão de limpar não é descendente do botão do campo. Testado em `tests/components/createListingView.test.tsx`.

## Fora do escopo

- Ligar ou remover a `SentRequestsScreen`, que não é usada por rota alguma; isso fica em uma entrega separada.

# Spec 079 — Usabilidade do acompanhamento do encontro

**Data:** 26 de outubro de 2026
**Telas afetadas:** `src/view/requests/requestDetail.tsx` (`06.06 · Acompanhar encontro`) e
`src/view/requests/meetingCard.tsx`.

## Problema

A tela não mostrava em que ponto a negociação estava; o cartão do encontro não tinha rota para o local
escolhido nem dizia quanto faltava; "Concluir e avaliar" pedia a conclusão antes mesmo do encontro; e o
banner "Negociação aceita!" continuava depois da avaliação.

## Escopo

1. Indicador de andamento com três etapas: Aceita → Combinar encontro / Encontro combinado → Concluída,
   lido por leitores de tela como "Andamento: n de 3 etapas. <próxima etapa>".
2. Cartão do encontro: "Hoje", "Amanhã" ou "Em n dias" (`describeMeetingCountdown` em
   `src/view/meetingFormat.ts`), aviso "O horário combinado já passou" e botão "Como chegar" ao ponto
   escolhido, com erro em alerta se o mapa não abrir.
3. Cartão de conclusão: antes do encontro confirmado e passado, orienta a voltar depois da entrega
   (o botão continua disponível para encontros combinados fora do app).
4. Depois da avaliação, manchete e banner passam a "Negociação concluída".

## Fora do escopo

Lembretes por notificação, mapa embutido e mudanças no banco.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Andamento correto sem encontro | `requestDetailView.test.tsx` |
| CA2 | Texto da conclusão antes do encontro | `requestDetailView.test.tsx` |
| CA3 | Regras de Hoje/Amanhã/Em n dias/passou | `tests/hooks/meetingCountdown.test.ts` |
| CA4 | "Como chegar" abre o mapa e mostra erro se falhar | `meetingViews.test.tsx` |
| CA5 | Cartão informa o encontro atual à tela | `meetingViews.test.tsx` |

## Validação

`npm run validate`: 179 arquivos e 1.299 testes passando. Sem conferência em aparelho.

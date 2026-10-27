# Spec 089 — Conversas: proposta no topo, tempo vivo e chat mais legível

## Objetivo
Melhorar a lista de Conversas e a tela do chat após a análise das mensagens.

## Comportamento esperado
1. **Proposta recebida pendente** aparece no topo da lista, com o selo "Nova proposta"; as demais conversas seguem da mais recente para a mais antiga.
2. **Rótulo de tempo** ("9h", "10 min", "Ontem") se atualiza sozinho a cada minuto, sem recarregar a lista.
3. **Chat**: cabeçalho com voltar, foto da outra pessoa e nome; mensagens seguidas da mesma pessoa ficam agrupadas (espaço menor, sem separador de dia entre elas); respiro no fim da lista; "Combinar" como botão tonal (M3).

## Fora de escopo
Consulta única de últimas mensagens (N+1) e paginação do histórico.

## Critérios de aceite e validação
- CA1 ordem e selo: `tests/hooks/useConversationsViewModel.test.tsx` e `tests/components-mocked/conversationsView.test.tsx`.
- CA2 tempo vivo: `conversationsView.test.tsx` (relógio simulado: "9h" → "10h" após 1 min).
- CA3 agrupamento: `tests/unit/chatTimeline.test.ts` (campo `grouped`).
- CA4 cabeçalho com foto/Voltar e "Combinar": `tests/components-mocked/chatView.test.tsx`.

## Validação
`npm run validate` aprovado (189 arquivos, 1.396 testes). Sem conferência no Galaxy A16 (pendente).

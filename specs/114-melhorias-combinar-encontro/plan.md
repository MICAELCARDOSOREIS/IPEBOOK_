# Plano de Implementação — Spec 114 (Melhorias em Combinar Encontro)

## 1. Arquitetura e Impacto

1. **Camada de Domínio e Validação:**
   - Atualizar `src/model/validators/meetingValidator.ts` com função para obter horários permitidos dado o ponto e o dia (`meetingTimeSlotsForPoint`) e validação de expediente em `validateMeetingProposal`.
   - Adicionar testes de unidade em `tests/unit/meetingValidator.test.ts`.

2. **Camada de ViewModel:**
   - Atualizar `src/viewmodel/useScheduleMeetingViewModel.ts` para recalcular `timeSlots` dinamicamente conforme o ponto e o dia selecionados, limpando o horário se ele se tornar inválido.
   - Testar o ViewModel em `tests/unit/` ou `tests/hooks/`.

3. **Camada de Apresentação (UI):**
   - Atualizar `src/view/requests/scheduleMeeting.tsx`:
     - Utilizar `useIsWideWeb` para chavear entre o layout mobile (com sheet/mapa de fundo) e o layout web largo (2 colunas lado a lado: painel à esquerda, mapa à direita).
     - Desabilitar botão principal quando `!summary.complete`.
     - Exibir dica contextual de expediente nos locais com restrição de dias úteis.
   - Atualizar `src/view/conversations/NegotiationStatusCard.tsx`:
     - Adicionar suporte aos callbacks `onReschedule` / `onSuggestOtherTime`.
     - Exibir botão secundário "Sugerir outro horário" no estado `proposed` para quem recebeu a proposta.
     - Exibir botão "Reagendar" no estado `confirmed`.
   - Atualizar `src/view/conversations/chat.tsx` repassando a navegação para `/negociacao/[id]/encontro`.

4. **Validação:**
   - Executar `npm run check:numbering`, `npm run check:architecture`, `npm run typecheck`, `npm test`.

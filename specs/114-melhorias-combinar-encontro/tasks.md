# Tarefas — Spec 114 (Melhorias em Combinar Encontro)

Status geral: [x] Concluído

## Fase 1: Domínio e Validações
- [x] T1.1 Criar regras de expediente de pontos em `src/model/validators/meetingValidator.ts` (funções `meetingTimeSlotsForPoint` e validação estrita em `validateMeetingProposal`).
- [x] T1.2 Atualizar testes unitários em `tests/unit/meetingValidator.test.ts`.

## Fase 2: ViewModel de Agendamento
- [x] T2.1 Atualizar `src/viewmodel/useScheduleMeetingViewModel.ts` para computar slots dinâmicos e invalidar horário se fora da regra do ponto/dia.
- [x] T2.2 Adicionar testes unitários do ViewModel para a nova lógica.

## Fase 3: Interface e Experiência (UI)
- [x] T3.1 Atualizar `src/view/requests/scheduleMeeting.tsx` para suporte a Desktop largo em 2 colunas com `useIsWideWeb`.
- [x] T3.2 Desabilitar o botão principal de envio até conclusão do preenchimento (`disabled={!summary.complete}`).
- [x] T3.3 Atualizar `src/view/conversations/NegotiationStatusCard.tsx` adicionando botões de reagendamento/sugestão no chat.
- [x] T3.4 Conectar as novas ações no `src/view/conversations/chat.tsx`.

## Fase 4: Validação e Testes
- [x] T4.1 Atualizar testes de componentes em `tests/components/meetingViews.test.tsx` e `negotiationStatusCard.test.tsx`.
- [x] T4.2 Executar `npm run check:numbering` e `npm run check:architecture`.
- [x] T4.3 Executar `npm run typecheck` e `npm test`.

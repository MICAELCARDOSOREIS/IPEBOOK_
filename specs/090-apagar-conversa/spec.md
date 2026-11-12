# Spec 090 — Apagar conversa

## Objetivo
Permitir que a pessoa apague uma conversa da sua lista.

## Decisão
O histórico de mensagens é imutável e compartilhado (RLS proíbe `update`/`delete`), então "apagar" **oculta a conversa só para quem apagou**, na tabela `v2_hidden_conversations` (`user_id`, `request_id`, `hidden_at`, RLS por dono). Se chegar mensagem posterior a `hidden_at`, a conversa volta à lista. A outra pessoa não é afetada.

## Comportamento
- Na aba Conversas, toque longo numa conversa aceita abre o diálogo "Apagar conversa?" (Manter / Apagar). Propostas pendentes não têm essa opção.
- Falha ao apagar mostra aviso e mantém a conversa.
- Rodapé orienta: "Para apagar uma conversa, mantenha o dedo sobre ela."
- No chat, a lista rola até a última mensagem também ao ser montada (`onLayout`), para a mensagem final não ficar sob o campo de digitação.

## Validação
- `tests/hooks/useConversationsViewModel.test.tsx`: some ao apagar, volta com mensagem nova, falha devolve `false`.
- `tests/components-mocked/conversationsView.test.tsx`: toque longo + confirmação; pendente não oferece.
- `tests/unit/supabaseRemoteHealth.test.ts`: nova migração reconhecida (25).
- `npm run validate`: 189 arquivos, 1.400 testes. **Pendente: aplicar a migração `202610270001` no Supabase remoto e conferir no Galaxy A16.**

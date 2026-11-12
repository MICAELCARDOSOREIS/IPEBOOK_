# 0076 — Avisos de mensagem, pedido recusado e avaliação no servidor

- Data: 2026-10-28
- Status: aceito
- Especificação: [100](../../specs/100-avisos-restantes/spec.md)

## Contexto
O chat, a recusa de pedidos e as avaliações não criavam avisos; o push (ADR 0071) só envia o que entra em `v2_notifications`.

## Decisão
Seguir o padrão do ADR 0074: gatilhos `SECURITY DEFINER` no banco criam os avisos `new_message`, `request_rejected` e `rating_received`. Para não encher a central nem repetir o push numa conversa ativa, a mensagem só gera aviso se não houver outro de mensagem não lido da mesma negociação.

## Alternativas consideradas
- Criar os avisos pelo app: depende do cliente estar aberto e permite forjar avisos.
- Um aviso por mensagem: polui a central; o agrupamento do push (ADR 0075) não resolve a lista.

## Consequências
- Tabela de canais e restrição de tipos precisam continuar em sincronia entre app, Edge Function e banco (coberto por teste).
- Quem lê o aviso volta a receber outro na mensagem seguinte.

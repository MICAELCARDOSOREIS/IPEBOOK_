# 0074 — Avisos de pedido recebido e aceito no servidor

Data: 2026-10-28. Status: aceito. Especificação: [098](../../specs/098-avisos-de-pedido/spec.md). Complementa a Spec 096 (push de avisos para o celular).

## Contexto
O aplicativo já possuía suporte aos tipos de notificação `request_received` e `request_accepted` (na interface, nos modelos e na restrição de integridade da tabela `public.v2_notifications`), porém nenhuma função ou gatilho no banco de dados criava essas notificações quando um leitor clicava em "Tenho interesse" ou quando o proprietário aceitava o pedido. Consequentemente, quem anunciava um livro nunca era avisado sobre novos pedidos, quem solicitava nunca recebia aviso de aceite, e nenhum push era disparado aos celulares dos envolvidos.

## Decisão
- Criar a migração `202610280005_avisos_de_pedido.sql` com a função `public.v2_notify_request_change()` e o gatilho `v2_request_notifies` na tabela `public.v2_book_requests`.
- O gatilho roda após `INSERT` e após `UPDATE OF status` em `public.v2_book_requests`:
  - No `INSERT` (novo pedido): cria notificação com tipo `request_received`, título "Novo pedido para o seu livro" e link para `/pedidos-recebidos`, destinada ao dono do anúncio (`livro.owner_id`).
  - No `UPDATE` com status transicionando para `accepted`: cria notificação com tipo `request_accepted`, título "Seu pedido foi aceito" e link para `/negociacao/[id]`, destinada ao solicitante (`new.requester_id`).
- A função roda como `SECURITY DEFINER` com `search_path = ''` para não depender de permissões do usuário que realizou a ação e para garantir isolamento seguro contra injeções.
- O disparo de notificações push para o dispositivo móvel ocorre automaticamente através do gatilho preexistente `v2_notification_pushes_to_device` (Spec 096), que escuta inserções na tabela `public.v2_notifications`.

## Alternativas consideradas
- Criar o aviso diretamente no cliente React Native ao enviar o pedido ou ao chamar a RPC de aceite: frágil e inseguro, pois se o aplicativo falhar, for fechado antes da resposta ou perder rede, o aviso não é gerado; além disso, exigiria permissão de inserção direta do cliente em `v2_notifications`, o que é bloqueado por RLS.
- Criar o aviso dentro da RPC `accept_book_request` e numa nova RPC para criar pedido: aumentaria a complexidade das RPCs e não cobriria inserções normais de pedidos via REST/Supabase client.

## Consequências
- Todo "Tenho interesse" gera notificação imediata para o dono do livro.
- Todo aceite gera notificação para o leitor interessado.
- Os avisos alimentam automaticamente a fila de push do celular.
- A migração `202610280005_avisos_de_pedido.sql` precisa ser aplicada no backend Supabase remoto.

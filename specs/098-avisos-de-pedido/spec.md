# Especificação 098 — Avisos de pedido recebido e aceito

Status: implementada e testada localmente; migração aguardando aplicação no Supabase remoto. ADR: [0074](../../docs/adr/0074-avisos-de-pedido-recebido-e-aceito.md).

## Objetivo
Garantir que o anunciante seja notificado no aplicativo e via push no celular assim que alguém manifestar interesse em seu livro ("Tenho interesse"), e que o solicitante seja notificado assim que o pedido for aceito para combinar a entrega.

## Escopo
- Gatilho e função de banco `public.v2_notify_request_change()` na tabela `public.v2_book_requests`.
- Criação automática de registro na tabela `public.v2_notifications` com os tipos já reconhecidos pelo app: `request_received` e `request_accepted`.
- Acionamento em cadeia do gatilho de push existente `v2_notification_pushes_to_device` (Spec 096).
- Roteamento correto no app: `/pedidos-recebidos` para o anunciante e `/negociacao/[id]` para o leitor.
- Fora do escopo: alteração de layout das telas de pedidos e negociação.

## Regras de negócio
- **RN-01** Ao inserir um pedido (`INSERT` em `v2_book_requests`), o proprietário do livro anunciado recebe uma notificação `request_received` com o título "Novo pedido para o seu livro" e link para `/pedidos-recebidos`.
- **RN-02** Ao aceitar um pedido (`UPDATE` de status para `accepted`), o solicitante recebe uma notificação `request_accepted` com o título "Seu pedido foi aceito" e link para `/negociacao/[id]`.
- **RN-03** O solicitante nunca recebe a notificação `request_received` do próprio pedido.
- **RN-04** O anunciante nunca recebe a notificação `request_accepted` do próprio aceite.
- **RN-05** Terceiros não têm acesso às notificações criadas (protegidas por RLS de `v2_notifications`).

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Novo pedido gera notificação `request_received` apontando para `/pedidos-recebidos` para o dono | Cenário SQL local (`verificar-migracoes.mjs`) |
| CA2 | Aceite de pedido gera notificação `request_accepted` apontando para `/negociacao/[id]` para o leitor | Cenário SQL local (`verificar-migracoes.mjs`) |
| CA3 | Terceiros não recebem nem visualizam os avisos de pedido de outros usuários | Cenário SQL local (`verificar-migracoes.mjs`) |
| CA4 | Tipos e rotas são reconhecidos pelo frontend sem erros de renderização ou navegação | Testes de unidade e componentes |
| CA5 | Reconciliação remota identifica a migração `202610280005_avisos_de_pedido.sql` | `scripts/verificar-migracoes-remotas.mjs` e `tests/unit/supabaseRemoteHealth.test.ts` |

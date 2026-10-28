# 0075 — Preferências de aviso, canais de entrega e push profissional

Data: 2026-10-28. Status: aceito. Especificação: [099](../../specs/099-preferencias-e-canais-de-notificacao/spec.md). Complementa as Specs 096 (push de avisos) e 098 (avisos de pedido).

## Contexto
O envio de notificações push (Spec 096) utilizava um canal genérico `default` sem prioridade alta no Android, fazendo com que avisos chegassem discretamente sem banner flutuante (*heads-up*), sem som e sem vibração. Além disso, notificações seguidas da mesma negociação acumulavam-se na bandeja sem agrupamento, o ícone na barra de status usava o padrão genérico em vez da silhueta da marca, e o usuário não podia escolher quais tipos de aviso desejava receber no celular.

## Decisão
- Criar a migração `202610280006_preferencias_de_aviso.sql`, adicionando a coluna `muted_types text[] not null default '{}'` na tabela `public.v2_user_preferences`, protegida por RLS privada do titular.
- Na Edge Function `enviar-push`:
  - Mapear cada tipo de aviso para um canal específico (`NOTIFICATION_CHANNEL`):
    - `messages`: "Conversas e propostas" (alta prioridade, heads-up, som e vibração) para `request_received` e `request_accepted`.
    - `reminders`: "Lembretes de encontro" (alta prioridade, heads-up, som e vibração) para `meeting_update`.
    - `updates`: "Avisos e novidades" (prioridade padrão) para `search_alert_match`, `safety_tip` e `system`.
  - Respeitar `muted_types`: se o tipo do aviso estiver na lista de silenciados do usuário, o push não é disparado, mas a notificação permanece acessível na central interna do app.
  - Agrupar notificações da mesma negociação no Android e iOS usando `collapseId`, `tag` e `threadId` baseados em `action_url`, substituindo a notificação anterior em vez de poluir a barra de status.
- No aplicativo:
  - Configurar `"icon": "./assets/notificacao-icone.png"` e cor da marca `#2C5E45` no plugin `expo-notifications` do `app.json`.
  - Configurar os canais de entrega Android no `ExpoPushNotificationService` via `setNotificationChannelAsync`.
  - Sincronizar o selo numérico de não lidas (*badge*) no ícone do aplicativo com `push.setBadgeCount(unreadCount)` em `useNotificationsViewModel`.
  - Adicionar a seção "Notificações" em Configurações (`settings.tsx`) com seletores (*switches*) intuitivos para Propostas, Encontros, Alertas e Sistema, geridos por `useNotificationPreferencesViewModel`.

## Alternativas consideradas
- Manter canal único `default` com importância máxima para tudo: desrespeitaria as diretrizes do Android e incomodaria o usuário com alertas de baixa urgência (como novidades de busca) interrompendo a tela com som.
- Salvar preferências de notificação no AsyncStorage local: perderia as preferências ao trocar de aparelho e impediria o servidor de filtrar antes de chamar a API do Expo.

## Consequências
- Notificações de propostas e encontros chegam de forma profissional e com destaque na tela (heads-up banner).
- Usuário ganha autonomia para silenciar categorias sem perder histórico interno.
- A migração `202610280006_preferencias_de_aviso.sql` precisa ser aplicada no Supabase remoto.

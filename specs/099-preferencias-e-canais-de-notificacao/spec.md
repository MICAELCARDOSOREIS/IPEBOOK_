# Especificação 099 — Preferências de aviso, canais de entrega e push profissional

Status: implementada e testada localmente; migração aguardando aplicação no Supabase remoto. ADR: [0075](../../docs/adr/0075-preferencias-e-canais-de-notificacao.md).

## Objetivo
Tornar a experiência de notificações e push profissional, garantindo destaque adequado no Android (canais específicos, som, vibração e banner heads-up para propostas e encontros), agrupamento inteligente de avisos da mesma negociação, silhueta correta da marca na barra de status, sincronização do selo numérico de não lidas no ícone do app e controle granular pelo usuário em Configurações.

## Escopo
- Migração `202610280006_preferencias_de_aviso.sql` (`muted_types` em `v2_user_preferences`).
- Mapeamento e despacho de canais Android (`messages`, `reminders`, `updates`) e prioridades (`high` / `default`) na Edge Function `enviar-push`.
- Agrupamento de notificações por `action_url` (`collapseId`, `tag`, `threadId`).
- Configuração do plugin `expo-notifications` no `app.json` com ícone monocromático (`notificacao-icone.png`) e canal padrão.
- Sincronização reativa do selo numérico (*badge count*) com a quantidade de notificações não lidas.
- Tela de Configurações com switches para Propostas, Encontros, Alertas e Sistema via `useNotificationPreferencesViewModel`.

## Regras de negócio
- **RN-01** Avisos de negociação (`request_received`, `request_accepted`) e encontros (`meeting_update`) são despachados em canais com alta prioridade, som e vibração para que o celular toque e mostre banner no topo.
- **RN-02** Avisos de alertas de busca (`search_alert_match`), dicas e comunicados do sistema (`safety_tip`, `system`) são despachados no canal `updates` com prioridade padrão, sem interromper o usuário com som estridente.
- **RN-03** Se o usuário silenciar uma categoria em Configurações, os tipos correspondentes são gravados em `muted_types` e a Edge Function não envia o push, mantendo o registro na lista de notificações do app.
- **RN-04** Notificações da mesma negociação usam a rota (`action_url`) como identificador de agrupamento, substituindo a notificação anterior no Android em vez de empilhar várias na barra de notificações.
- **RN-05** O selo (*badge*) no ícone do aplicativo reflete o número de notificações não lidas e é zerado quando o usuário marca todas como lidas ou encerra a sessão.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | `muted_types` aceita lista de tipos desativados, é privado do titular e vem vazio por padrão | Cenário SQL local (`verificar-migracoes.mjs`) |
| CA2 | `enviar-push` não despacha push para tipos presentes em `muted_types` | Testes de unidade em `enviarPushLogic.test.ts` |
| CA3 | Mensagens recebem canais, prioridades e collapseId corretos | Testes de unidade em `enviarPushLogic.test.ts` |
| CA4 | ViewModel de preferências carrega, ativa e desativa categorias reativamente | Testes de unidade em `useNotificationPreferencesViewModel.test.tsx` |
| CA5 | Selo numérico é sincronizado com as notificações não lidas | Testes de unidade em `useNotificationsViewModel.test.tsx` |
| CA6 | Plugin nativo registra ícone monocromático e canal no `app.json` | Verificador de build (`check:build-config`) |
| CA7 | Diagnóstico remoto mapeia a migração `202610280006_preferencias_de_aviso.sql` | `scripts/verificar-migracoes-remotas.mjs` e `tests/unit/supabaseRemoteHealth.test.ts` |

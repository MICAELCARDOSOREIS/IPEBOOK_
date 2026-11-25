# 0119. Endurecimento de segurança, RLS e LGPD

- **Status:** Aceito
- **Data:** 2026-11-25
- **Especificação:** [143](../../specs/143-endurecimento-seguranca-rls-lgpd/spec.md)
- **Decisões relacionadas:** ADRs 0025, 0026, 0039, 0071, 0078, 0079, 0083 e 0093

## Contexto

Uma auditoria técnica de segurança (`Vigia`) identificou oito lacunas de defesa em profundidade (três altas e cinco médias): transições de estado de `v2_books` manipuláveis diretamente pela role `authenticated`; ausência de segredo dedicado de webhook e respostas que expunham estado interno na Edge Function `enviar-push`; portabilidade e eliminação incompletas frente ao Art. 18 da LGPD (tabelas ausentes em `exportUserData()`, resíduos em `v2_beta_testers`, remoção prematura de fotos no Storage por conta suspensa, listagem sem paginação e arquivo exportado persistido em `documentDirectory`); brechas na política `INSERT` de `v2_book_requests` e falta de sanitização em `initialMessage`; vulnerabilidade de substituição `$&`/`` $` `` e ausência de validação de UUID e `https://` no fluxo Open Graph; contorno do limite de alertas ativos via reativação (`UPDATE OF active`) em `v2_search_alerts`; políticas `UPDATE`/`DELETE` ausentes para conta suspensa e validação incompleta de `v2_books.photos`; e política CSP web ainda permissiva (`'unsafe-inline'` em `script-src` e wildcards `*.supabase.co`).

## Decisão

Adotar endurecimento coordenado em banco, serverless, domínio e cabeçalhos web, mantendo a autoridade no servidor:

1. **Integridade no banco (RLS e triggers):**
   - Impor máquina de estados em `BEFORE UPDATE` de `v2_books` bloqueando retorno a `draft` de anúncios já publicados e bloqueando alteração de `status` por `authenticated` quando `old.status in ('reserved', 'delivered')` ou `old.moderation_hold = true`.
   - Exigir na política `INSERT` de `v2_book_requests` ausência de bloqueio bilateral em `v2_blocked_users` e propriedade com `status = 'available'` quando `offered_book_id` for informado.
   - Estender o gatilho de `v2_search_alerts` para `BEFORE INSERT OR UPDATE OF active` (quando `new.active = true`) e impor limite total de alertas por usuário.
   - Adicionar políticas restritivas `UPDATE` e `DELETE` em `v2_books` usando `not public.v2_current_user_suspended()` e validação SQL exigindo `https://` em todos os itens de `v2_books.photos` (máximo de 5 itens).
2. **Webhook autenticado e sem oráculo em `enviar-push`:**
   - Exigir segredo dedicado `PUSH_WEBHOOK_SECRET` comparado em tempo constante, armazenado em `v2_push_settings` para o disparo via `v2_push_new_notification()`, e padronizar as respostas da Edge Function para não revelar existência de notificação, token ou preferências.
3. **Conformidade LGPD Art. 18 e minimização:**
   - Completar `exportUserData()` com `v2_user_preferences`, `v2_negotiation_messages`, `v2_meetings`, `v2_deliveries`, `v2_blocked_users`, `v2_user_reports`, `v2_hidden_conversations`, `initial_message`/`offered_book_id` e metadados completos de `v2_books`.
   - Incluir remoção de `v2_beta_testers` em `delete_user_account()`.
   - Impedir que contas suspensas apaguem arquivos do Storage antes da recusa da RPC, paginar `bucket.list` em `removeUserPhotos` e gravar o JSON exportado em `cacheDirectory` com exclusão em `finally` após o compartilhamento.
4. **Sanitização, Open Graph e CSP estrita:**
   - Sanitizar `initialMessage` com `sanitizeTextInput`, restringir `isValidHttpUrl` e `photoUrl` do Open Graph exclusivamente a `https://`, usar callbacks `() => ...` em `.replace()` no `openGraphFormatter.ts` e validar UUID em `functions/livro/[id].ts`.
   - Extrair o registro inline do Service Worker de `src/app/+html.tsx` para `public/sw-register.js`, remover `'unsafe-inline'` de `script-src`, incluir `base-uri 'self'`, `form-action 'self'` e `object-src 'none'`, e restringir `img-src`/`connect-src` ao host específico do projeto Supabase (`xiuuiggpccpgrwkzeloc.supabase.co`).

## Alternativas consideradas

- **Validar transições de `v2_books` e bloqueios apenas nos UseCases do aplicativo:** descartada, pois chamadas diretas à API REST do Supabase com JWT de `authenticated` contornariam as regras.
- **Manter `'unsafe-inline'` em `script-src` usando hash SHA-256 no `_headers`:** descartada em favor de um arquivo estático dedicado (`public/sw-register.js`), evitando acoplamento de hash a cada edição de `src/app/+html.tsx` e eliminando scripts inline de execução.
- **Usar a própria `publishable_key` como segredo de `enviar-push`:** descartada, pois a chave publicável é pública por definição e não autentica chamadas internas do banco.

## Consequências

- Chamadas diretas à API do Supabase passam a respeitar as mesmas invariantes de estado, suspensão, bloqueio bilateral, limites de alerta e URLs HTTPS que o aplicativo.
- A Edge Function `enviar-push` exige provisionamento operacional de `PUSH_WEBHOOK_SECRET` via `supabase secrets set` e atualização correspondente em `public.v2_push_settings` ao implantar no ambiente remoto; até a sincronização remota, o banco local é validado em PGlite (`npm run test:sql`).
- O arquivo de exportação LGPD no celular não permanece residualmente em `documentDirectory`, reduzindo exposição de dados pessoais no armazenamento do dispositivo.
- Links de fotos com esquema `http://` passam a ser recusados em novos cadastros e edições; registros legados no banco não são quebrados graças à estratégia de validação progressiva.

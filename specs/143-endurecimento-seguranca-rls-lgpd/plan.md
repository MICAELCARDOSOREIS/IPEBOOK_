# Plano do endurecimento de segurança, RLS e LGPD

## Estratégia técnica

Agrupar as mudanças em uma migração SQL idempotente e bem documentada em `supabase/migrations/`, acompanhada de ajustes pontuais na Edge Function `enviar-push`, nas camadas `model`, `usecase` e `infra` (preservando estritamente MVVM e sem novas dependências), na Cloudflare Pages Function `functions/livro/[id].ts` e nos artefatos estáticos web (`src/app/+html.tsx`, `public/sw-register.js`, `public/_headers`).

## Mapa de alterações por achado

1. **Banco de dados e RLS (A1, A2, A3, M4, M6, M7)** — nova migração em `supabase/migrations/` + suíte PGlite em `scripts/verificar-migracoes.mjs`:
   - **A1**: trigger `BEFORE UPDATE` em `public.v2_books` (coordenada com `v2_guard_moderation_hold()`) para vetar retorno a `draft` quando `old.status <> 'draft'` e vetar mudança de `status` por `authenticated` quando `old.status in ('reserved', 'delivered')` ou `old.moderation_hold = true`.
   - **A2**: coluna `webhook_secret text` em `public.v2_push_settings` e envio do cabeçalho dedicado em `public.v2_push_new_notification()` (mantendo RN-05: falha/ausência de configuração não impede gravar `v2_notifications`).
   - **A3**: atualizar `public.delete_user_account(uuid)` para excluir registros do titular em `public.v2_beta_testers` antes de `delete from auth.users`.
   - **M4**: substituir a política `INSERT` de `public.v2_book_requests` verificando ausência de bloqueio bilateral em `public.v2_blocked_users` e, se `offered_book_id is not null`, existência em `public.v2_books` com `owner_id = auth.uid()` e `status = 'available'`.
   - **M6**: atualizar `public.v2_enforce_rate_limit()` e o trigger `v2_search_alerts_rate_limit` para `BEFORE INSERT OR UPDATE OF active` (checando limite de 20 ativos quando `new.active = true` e teto total por usuário em `INSERT`).
   - **M7**: adicionar políticas restritivas `UPDATE` e `DELETE` em `public.v2_books` com `not public.v2_current_user_suspended()`; validar em SQL `array_length(photos, 1) <= 5` e que todos os itens de `photos` começam com `https://` (`NOT VALID` ou trigger de escrita para preservar registros legados sem quebrar a migração).

2. **Edge Function de push (A2)** — `supabase/functions/enviar-push/index.ts` e `supabase/functions/enviar-push/logic.ts`:
   - Validar cabeçalho de segredo contra `Deno.env.get("PUSH_WEBHOOK_SECRET")` com comparação em tempo constante em função testável em `logic.ts`, recusando com `401` quando ausente/inválido ou segredo não configurado.
   - Padronizar corpo de resposta (`200` / erro) sem expor motivos internos que sirvam de oráculo sobre existência de aviso, presença de token ou preferências de silenciamento.
   - Registrar nota operacional de implantação remota: configurar `supabase secrets set PUSH_WEBHOOK_SECRET=...`, reimplantar `enviar-push` e atualizar `webhook_secret` em `public.v2_push_settings`.

3. **Portabilidade, exclusão e arquivos temporários (A3)** — `src/model/entities/userExportData.ts`, `src/infra/datasources/supabaseUserDataExportDataSource.ts`, `src/infra/datasources/memoryUserDataExportDataSource.ts`, `src/infra/datasources/supabaseAuthDataSource.ts`, `src/infra/services/fileDownloadService.ts`:
   - Estender `UserExportData` e ambos os datasources de exportação com `v2_user_preferences`, `v2_negotiation_messages`, `v2_meetings`, `v2_deliveries`, `v2_blocked_users`, `v2_user_reports`, `v2_hidden_conversations`, `initialMessage`/`offeredBookId` nos pedidos e metadados completos de `v2_books` (`createdAt`, `updatedAt`, `isBox`, `boxVolumesCount`, `edition`, `publisher`, `publicationYear`, `isbn`, `moderationHold`, conforme existentes na entidade/tabela).
   - Em `SupabaseAuthDataSource`, verificar se a conta está suspensa antes de remover arquivos no Storage (ou validar via RPC/consulta segura antes da deleção no bucket) e paginar `bucket.list` com `limit`/`offset` em `removeUserPhotos` até esgotar os arquivos.
   - Em `FileDownloadService.downloadJson`, escrever o arquivo em `FileSystem.cacheDirectory` e removê-lo em `finally` (`deleteAsync(..., { idempotent: true })`) após o compartilhamento.

4. **Validação de domínio e Open Graph (M4, M5, M7)** — `src/usecase/bookRequestUseCases.ts`, `src/model/validators/bookValidator.ts`, `src/model/formatters/openGraphFormatter.ts`, `functions/livro/[id].ts`:
   - Aplicar `sanitizeTextInput` (`src/model/validators/textSanitizer.ts`) em `initialMessage` antes de validar tamanho e persistir.
   - Restringir `isValidHttpUrl` em `bookValidator.ts` a `parsed.protocol === "https:"`, atualizando as mensagens de validação correspondentes.
   - Em `openGraphFormatter.ts`, substituir strings de reposição por callbacks `() => ...` em `injectOpenGraphIntoHtml` e exigir `https://` em `photoUrl`.
   - Em `functions/livro/[id].ts`, validar `bookId` contra regex estrita de UUID antes de chamar a REST API do Supabase.

5. **Endurecimento Web/CSP (M8)** — `src/app/+html.tsx`, `public/sw-register.js`, `public/_headers`:
   - Mover o registro do Service Worker para `public/sw-register.js` e carregá-lo via `<script src="/sw-register.js" defer />` em `src/app/+html.tsx`.
   - Atualizar a diretiva `Content-Security-Policy` em `public/_headers`: remover `'unsafe-inline'` de `script-src`, adicionar `base-uri 'self'`, `form-action 'self'` e `object-src 'none'`, e remover os wildcards `https://*.supabase.co` e `wss://*.supabase.co` mantendo apenas `https://xiuuiggpccpgrwkzeloc.supabase.co` e `wss://xiuuiggpccpgrwkzeloc.supabase.co`.

## Riscos e cuidados

- Garantir compatibilidade dos testes existentes de `bookValidator` que porventura usavam `http://` (atualizar apenas expectativas que contrariem o novo requisito explícito `https://`).
- Conferir que a exportação web (`npm run build:web`) e os testes E2E CDP (`npm run test:e2e`) continuam operando sem violações de CSP ao remover `'unsafe-inline'` de `script-src`.
- Atualizar contagens de migrações, specs, ADRs e testes em `docs/estado.md` e `README.md` apenas ao final da implementação, validando com `npm run check:docs` e `npm run check:numbering`.

Decisão arquitetural registrada no [ADR 0119](../../docs/adr/0119-endurecimento-seguranca-rls-lgpd.md).

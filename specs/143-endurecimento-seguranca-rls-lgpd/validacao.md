# Validação — Spec 143 (Endurecimento de segurança, RLS e LGPD)

**Data:** 2026-11-25  
**Branch:** `fix/seguranca-rls-lgpd-143`  
**Decisão arquitetural:** [ADR 0119](../../docs/adr/0119-endurecimento-seguranca-rls-lgpd.md)

## Critérios verificados localmente

| Achado | Evidência de implementação | Verificação executada |
| --- | --- | --- |
| **A1** — Máquina de estados em `v2_books` | Trigger `v2_guard_moderation_hold()` em `supabase/migrations/202611250001_endurecimento_seguranca_rls_lgpd.sql` bloqueando retorno a `draft` e alteração direta de `status` por `authenticated` em `reserved`, `delivered` ou `moderation_hold`. | `npm run test:sql` (PGlite): vetores negados e fluxos legítimos (`draft -> available`, `available <-> paused`, `service_role`) aprovados. |
| **A2** — Webhook autenticado e sem oráculo em `enviar-push` | `webhook_secret` em `v2_push_settings` e cabeçalho `X-Push-Webhook-Secret` em `v2_push_new_notification()`; comparação em tempo constante (`constantTimeEqual` / `isAuthorizedWebhookSecret`) e resposta padronizada (`PUSH_ACCEPTED_RESPONSE`) em `supabase/functions/enviar-push/{logic.ts,index.ts}`. | `npm run test:sql` (bloqueio de leitura por `authenticated` e preservação da RN-05) + `tests/unit/enviarPushLogic.test.ts` (comparação em tempo constante, validação antes de `createClient` e ausência de oráculos). |
| **A3** — Conformidade LGPD Art. 18 | `delete_user_account()` limpa `v2_beta_testers`; políticas restritivas em `storage.objects` para conta suspensa; `UserExportData`, `SupabaseUserDataExportDataSource` e `MemoryUserDataExportDataSource` exportam `v2_user_preferences`, `v2_negotiation_messages`, `v2_meetings`, `v2_deliveries`, `v2_blocked_users`, `v2_user_reports`, `v2_hidden_conversations`, `initialMessage`/`offeredBookId` e metadados completos de `v2_books`; `SupabaseAuthDataSource` verifica `v2_current_user_suspended()` antes do Storage e pagina `bucket.list`/`remove`; `FileDownloadService` grava em `cacheDirectory` e limpa em `finally`. | `npm run test:sql` + `tests/unit/userDataExportUseCases.test.ts` + `tests/unit/supabaseAuthDataSource.test.ts` + `tests/unit/fileDownloadService.test.ts`. |
| **M4** — Integridade de pedidos em `v2_book_requests` | Política `INSERT` com `v2_has_block_with_listing_owner(listing_id)` (bloqueio bilateral) e verificação de posse+disponibilidade de `offered_book_id`; `sanitizeTextInput` em `initialMessage` (`src/usecase/bookRequestUseCases.ts`). | `npm run test:sql` + `tests/unit/bookRequestUseCases.test.ts`. |
| **M5** — Proteção de template e entrada no Open Graph | Callbacks `() => ...` nas 3 chamadas `.replace()` e `^https://` em `src/model/formatters/openGraphFormatter.ts`; validação estrita de UUID em `functions/livro/[id].ts` antes do `fetch`. | `tests/unit/openGraphFormatter.test.ts` (padrões `$&`, `` $` ``, `$'` e rejeição de `http://`) + `tests/unit/cloudflareFunction.test.ts` (IDs inválidos não chamam Supabase). |
| **M6** — Limite completo de alertas em `v2_search_alerts` | Trigger `BEFORE INSERT OR UPDATE OF active` em `v2_enforce_rate_limit()`: 20 alertas ativos (incluindo reativação) + teto de 50 alertas totais por usuário. | `npm run test:sql` (`IBLIM` no 21º ativo em `INSERT`, na reativação via `UPDATE` e no 51º total). |
| **M7** — Suspensão e URLs HTTPS em `v2_books` | Políticas restritivas `UPDATE`/`DELETE` em `v2_books` para conta suspensa; constraint `v2_books_photos_https_max5` (`NOT VALID`) via `v2_valid_https_photos(photos)`; `isValidHttpUrl` restrito a `https:` em `src/model/validators/bookValidator.ts`. | `npm run test:sql` + `tests/unit/bookValidator.test.ts` + `tests/unit/bookValidatorDrafts.test.ts`. |
| **M8** — Endurecimento da CSP na Web | Script inline extraído de `src/app/+html.tsx` para `public/sw-register.js`; `public/_headers` sem `'unsafe-inline'` em `script-src`, sem wildcards `*.supabase.co`, com `base-uri 'self'`, `form-action 'self'` e `object-src 'none'`. | `tests/unit/webCspHeaders.test.ts`, `npm run check:build-config` e `npm run test:e2e:build`. |

## Comandos de validação

- `npm run validate` — **aprovado (exit 0)**: `typecheck`, `lint` (0 erros), `check:architecture` (0 violações em 497 arquivos), `check:design-system`, `check:numbering` (142 specs e 119 ADRs sem colisão), `check:build-config`, `test:sql` (44 migrações no PGlite com todos os vetores A1–A3/M4/M6/M7 validados), `test:coverage` (**318/318 suítes, 2.361/2.361 testes**; cobertura **95,29% statements, 85,65% branches, 85,84% functions, 95,29% lines**) e `check:docs` (`Documentação sincronizada: 2361 testes em 318 arquivos, 44 migrações, 46 rotas, 142 specs, 119 ADRs.`).
- `npm run test:e2e:build` — **aprovado (exit 0)**: exportação Web estática (`dist-e2e/` incluindo `dist-e2e/sw-register.js`) e suíte Chrome CDP (**8/8 cenários aprovados**).

## Pendências de implantação remota (T008 — fora do escopo local)

As alterações de produção no Supabase e Cloudflare Pages permanecem pendentes de autorização explícita:
1. Aplicar a migração `202611250001_endurecimento_seguranca_rls_lgpd.sql` no Supabase remoto (`supabase db push`).
2. Configurar o segredo dedicado na Edge Function: `supabase secrets set PUSH_WEBHOOK_SECRET=<segredo-aleatorio-forte>`.
3. Reimplantar a Edge Function `enviar-push` (`supabase functions deploy enviar-push`).
4. Atualizar `public.v2_push_settings.webhook_secret` no banco remoto com o mesmo segredo configurado no passo 2.
5. Validar o ambiente remoto com `npm run health:supabase:remote` e publicar a nova compilação Web (`npm run build:web`) no Cloudflare Pages para ativar `public/_headers`, `public/sw-register.js` e `functions/livro/[id].ts`.

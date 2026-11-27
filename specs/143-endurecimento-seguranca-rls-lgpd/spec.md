# Endurecimento de segurança, RLS e LGPD

## Contexto e objetivo

O parecer de segurança (`Vigia`) identificou 8 achados (3 de severidade alta e 5 de severidade média) distribuídos entre banco de dados (`v2_*`, RLS e triggers), Edge Function `enviar-push`, exportação e exclusão de conta (LGPD Art. 18), validadores, Open Graph e cabeçalhos CSP da versão web. Esta especificação estabelece os critérios verificáveis do Bloco 1 de endurecimento, sem invadir o escopo de iOS nativo (`Spec 137`).

## Critérios de aceite

### Achados altos

- **A1 — Máquina de estados de `v2_books`**: trigger `BEFORE UPDATE` em `public.v2_books` deve bloquear a transição para `draft` sempre que `old.status <> 'draft'` e bloquear qualquer alteração de `status` pela role `authenticated` quando `old.status in ('reserved', 'delivered')` ou `old.moderation_hold = true`, preservando transições legítimas via `service_role` / RPCs `SECURITY DEFINER`. Coberto em PGlite (`npm run test:sql`) com casos permitidos e negados.
- **A2 — Autenticação e ausência de oráculo em `enviar-push`**: `supabase/functions/enviar-push/index.ts` deve exigir segredo dedicado de webhook (`PUSH_WEBHOOK_SECRET`), validado com comparação em tempo constante, e devolver resposta padronizada que não exponha se um aviso existe, se já foi enviado, se o destinatário possui token ou se silenciou o tipo. A tabela `public.v2_push_settings` e a trigger `public.v2_push_new_notification()` devem enviar esse segredo no cabeçalho da chamada HTTP. A implantação remota deve documentar a configuração de `supabase secrets set PUSH_WEBHOOK_SECRET=...` e a atualização da linha em `v2_push_settings`.
- **A3 — Conformidade LGPD Art. 18 (portabilidade, eliminação e minimização)**:
  - `exportUserData()` (entidade `UserExportData`, `SupabaseUserDataExportDataSource` e `MemoryUserDataExportDataSource`) deve exportar também `v2_user_preferences`, `v2_negotiation_messages`, `v2_meetings`, `v2_deliveries`, `v2_blocked_users`, `v2_user_reports`, `v2_hidden_conversations`, os campos `initial_message` e `offered_book_id` nos pedidos e todos os metadados pertinentes de `v2_books`.
  - `public.delete_user_account(uuid)` deve apagar também os registros do titular em `public.v2_beta_testers`.
  - `SupabaseAuthDataSource` não deve apagar arquivos do titular no Storage quando a conta estiver suspensa (impedindo perda de fotos antes da recusa da RPC) e `removeUserPhotos` deve paginar `bucket.list` até remover todas as páginas de arquivos do usuário.
  - `FileDownloadService.downloadJson` no ambiente nativo deve gravar o JSON temporário em `FileSystem.cacheDirectory` e removê-lo em bloco `finally` após `Sharing.shareAsync`.

### Achados médios

- **M4 — Integridade de pedidos em `v2_book_requests`**: a política RLS de `INSERT` em `public.v2_book_requests` deve rejeitar pedidos quando houver bloqueio bilateral em `public.v2_blocked_users` entre solicitante e dono do anúncio e, quando `offered_book_id` for informado, exigir que o livro pertença ao solicitante e esteja com `status = 'available'`. Em `src/usecase/bookRequestUseCases.ts`, `initialMessage` deve ser sanitizada com `sanitizeTextInput`.
- **M5 — Proteção de template e entrada no Open Graph**: `injectOpenGraphIntoHtml` em `src/model/formatters/openGraphFormatter.ts` deve usar callbacks `() => ...` em todas as chamadas `.replace()` que inserem conteúdo derivado de dados do livro (neutralizando padrões especiais como `$&` e `` $` ``); `buildBookOpenGraph` deve aceitar somente `photoUrl` com esquema `https://` (recorrendo à capa ilustrativa nos demais casos); `functions/livro/[id].ts` deve validar que `id` é um UUID válido antes de consultar a API REST do Supabase.
- **M6 — Limite completo de alertas em `v2_search_alerts`**: a trigger de limite de alertas deve disparar em `BEFORE INSERT OR UPDATE OF active` (impedindo burlar o limite de 20 alertas ativos por reativação quando `new.active = true`) e aplicar também um limite total de alertas por usuário no banco, com cobertura em PGlite.
- **M7 — Suspensão e URLs HTTPS em `v2_books`**: criar políticas RLS restritivas de `UPDATE` e `DELETE` em `public.v2_books` condicionadas a `not public.v2_current_user_suspended()`; validar em SQL que `v2_books.photos` possui no máximo 5 itens e que todos iniciam com `https://` (sem quebrar dados legados já existentes); restringir `isValidHttpUrl` em `src/model/validators/bookValidator.ts` apenas ao protocolo `https:`.
- **M8 — Endurecimento da CSP na Web**: extrair o script inline de registro do Service Worker de `src/app/+html.tsx` para `public/sw-register.js` e referenciá-lo como script externo; em `public/_headers`, remover `'unsafe-inline'` de `script-src`, adicionar `base-uri 'self'`, `form-action 'self'` e `object-src 'none'`, e remover os wildcards `https://*.supabase.co` e `wss://*.supabase.co`, restringindo ao host do projeto (`xiuuiggpccpgrwkzeloc.supabase.co`).

## Fora de escopo

- Alterações de interface visual, fluxos de iOS nativo (`Spec 137`) ou criação de novas telas.
- Execução direta de `supabase secrets set` ou aplicação remota em produção sem autorização explícita (fica registrada como etapa de implantação remota).

## Validação esperada

- Testes SQL/PGlite (`npm run test:sql`) cobrindo casos permitidos e negados de A1, A2 (esquema/trigger), A3 (`delete_user_account` + `v2_beta_testers`), M4, M6 e M7.
- Testes unitários Jest cobrindo A2 (`enviar-push/logic.ts` / validação em tempo constante), A3 (exportação completa, paginação de `removeUserPhotos`, bloqueio para conta suspensa, `cacheDirectory` + limpeza no `FileDownloadService`), M4 (`sanitizeTextInput`), M5 (`$&`/`` $` ``, `https://` e UUID em `functions/livro/[id].ts`), M7 (`bookValidator.ts`) e M8 (CSP em `public/_headers` + ausência de script inline no `+html.tsx` / existência de `public/sw-register.js`).
- Conferência de governança (`npm run validate` ao final da implementação e `npm run check:numbering` para os artefatos).

# 0033 — Verificação de saúde e migrações do Supabase remoto

Data: 2026-10-21. Status: aceito.

## Contexto

O IpêBook possui um conjunto de migrações SQL em `supabase/migrations/` que implementam a arquitetura v2 de banco de dados (tabelas de anúncios, pedidos, favoritos, alertas, denúncias, perfis, preferências e avaliações com RLS).

No ambiente local e na integração contínua (CI), a execução do script `scripts/verificar-migracoes.mjs` (`npm run test:sql`) valida o conjunto completo de migrações e regras de segurança utilizando uma instância isolada do PostgreSQL em memória (PGlite). Contudo, essa verificação local não afere se a instância remota do Supabase (utilizada pela aplicação em desenvolvimento, homologação ou produção) já recebeu todas as migrações aplicadas.

Ao mesmo tempo, as diretrizes de segurança do projeto proíbem o armazenamento ou vazamento de credenciais administrativas (`service_role` ou senhas de banco) em repositórios e estações de desenvolvimento, devendo toda a interação com o backend remoto ser realizada de forma segura via chave pública/anônima (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) e REST API.

## Decisão

1. Implementar o script e módulo `scripts/verificar-migracoes-remotas.mjs`, adicionando o comando `npm run health:supabase:remote` no `package.json`.
2. Utilizar a API REST PostgREST e os endpoints de Storage do Supabase com a chave pública de ambiente (`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) para inspecionar:
   - Conectividade básica e latência de rede;
   - Existência e integridade das tabelas críticas (`v2_books`, `v2_profiles`, `v2_book_requests`, `v2_favorites`, `v2_search_alerts`, `v2_reports`, `v2_ratings`, `v2_notifications`, `v2_user_preferences`);
   - Presença de colunas novas ou evoluídas em tabelas existentes (ex: `condition`, `description`, `photos`, `city`, `neighborhood` em `v2_books`; `photo_url`, `social_handle` em `v2_profiles`; `modalities` em `v2_search_alerts`);
   - Disponibilidade pública e operabilidade do bucket `book-photos` no Supabase Storage;
   - Registro de funções RPC críticas (`delete_user_account` e `accept_book_request`).
3. Mapear cada arquivo de migração versionado em `supabase/migrations/` aos seus respectivos artefatos no banco remoto, reconciliando e emitindo o status de cada migração (aplicada vs. pendente).
4. Suportar dois modos de formatação:
   - Terminal amigável e legível por humanos (padrão);
   - JSON estruturado (`--json`) para integração com automações, scripts de deploy e dashboards operacionais.
5. Garantir estritamente que credenciais e tokens nunca sejam registrados em logs ou impressos no console.
6. Retornar código de saída `0` se o backend estiver saudável e com todas as migrações locais aplicadas (ou se `--allow-pending` for fornecida em checagens não bloqueantes), e código `1` caso ocorra falha de conectividade ou pendências de esquema.

## Alternativas consideradas

- Confiar apenas nos testes locais de migração (PGlite): rejeitado pois não detecta descompassos (drift) entre o código do repositório e o banco de dados remoto real.
- Conexão direta ao banco via TCP/Postgres com driver `pg`: rejeitada pois exige expor senhas administrativas de banco e credenciais privilegiadas de superusuário na máquina de desenvolvimento e em CI. A inspeção via PostgREST com chave publicável é suficiente, segura e reflete a visão real da aplicação cliente.
- Dependência da CLI oficial do Supabase vinculada: a CLI exige login OAuth ou token de acesso da conta da plataforma Supabase, inviabilizando verificações simples e anônimas a partir de arquivos `.env` padrão.

## Consequências

- A equipe obtém visibilidade instantânea sobre o estado do banco remoto antes de novos deploys ou testes na beta comunitária.
- Qualquer migração pendente é apontada com clareza, indicando o arquivo SQL correspondente a ser aplicado.
- A segurança de credenciais é preservada, sem vazamento de tokens em pipelines ou logs.

Vínculos: [Spec 039](../../specs/039-saude-migracoes-supabase-remoto/spec.md), [ADR 0012](0012-supabase-com-rls.md), [ADR 0013](0013-reset-esquema-legado-supabase.md), [ADR 0021](0021-indices-busca-e-robustez-operacional.md), [ADR 0027](0027-resiliencia-seguranca-e-verificacao-release.md).

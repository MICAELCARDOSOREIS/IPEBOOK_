# Tarefas — Spec 047

- [x] T01 Criar especificação técnica e critérios de aceite da auditoria de métricas em `specs/047-metricas-beta-piripiri/spec.md`.
- [x] T02 Registrar ADR 0032 sobre script de auditoria e métricas agregadas da beta com conformidade LGPD.
- [x] T03 Implementar script `scripts/auditoria-metricas-beta.mjs` com agregador, formatos (terminal, markdown, json) e adaptadores de fonte de dados (PGlite e Supabase REST).
- [x] T04 Adicionar script de execução `stats:beta` no `package.json`.
- [x] T05 Criar testes unitários em `tests/unit/betaMetricsAggregator.test.ts` cobrindo agregação, formatos e garantia LGPD.
- [x] T06 Validar execução local (`terminal`, `--json`, `--markdown`) e executar `npm run validate`.
- [x] T07 Registrar evidências de validação em `specs/047-metricas-beta-piripiri/validacao.md`.

# 0023 — Pipeline de Integração Contínua com GitHub Actions

Data: 2026-10-20. Status: aceito.

## Contexto

O projeto conta com validações automatizadas de qualidade que cobrem tipos (`tsc --noEmit`), conformidade arquitetural em 7 camadas (`scripts/verificar-arquitetura.mjs`), migrações e políticas RLS de banco de dados (`scripts/verificar-migracoes.mjs` via PGlite) e testes unitários/integração. Sem uma automação centralizada em pull requests e branches principais, revisores e autores dependem exclusivamente de execuções manuais locais, correndo o risco de regressões passarem despercebidas para `develop`.

## Decisão

Adotar o GitHub Actions como ferramenta oficial de Integração Contínua (CI) por meio do workflow `.github/workflows/validacao.yml`.

O pipeline é acionado automaticamente em:
- Todo `push` nas branches `main` e `develop`.
- Todo `pull_request` apontando para `main` e `develop`.

As etapas executadas no runner `ubuntu-latest` (Node.js 24) são:
1. `npm ci` para instalação reprodutível baseada no `package-lock.json`.
2. Verificação de tipos TypeScript (`npm run typecheck`).
3. Verificação de barreiras arquiteturais entre camadas (`npm run check:architecture`).
4. Execução de migrações SQL e testes de segurança RLS (`npm run test:sql`).
5. Execução dos testes automatizados (`npm test`).

## Alternativas consideradas

- **Validação apenas local por scripts**: rejeitada por falta de garantia formal de execução antes do merge e dependência exclusiva da disciplina individual.
- **Serviços externos pagos de CI**: rejeitados, pois o GitHub Actions já está integrado nativamente ao repositório do projeto, sem custo operacional ou complexidade adicional.

## Consequências

- Qualquer commit ou pull request com falha de tipos, quebra de camada arquitetural, erro em migração SQL ou falha de teste é bloqueado na CI antes de alcançar `develop` ou `main`.
- Rastreabilidade pública do status de compilação diretamente nos PRs.

Vínculos: [Issue #126](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/126), [ADR 0003](0003-estrategia-testes-iso25010.md).

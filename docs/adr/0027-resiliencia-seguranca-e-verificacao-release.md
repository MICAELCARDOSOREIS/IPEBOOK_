# 0027 — Resiliência offline no catálogo, logging estruturado, rate limiting e verificação de release

Data: 2026-10-20. Status: aceito.

## Contexto

À medida que o Ipebook se prepara para a fase beta com o backend Supabase oficial ativado (`EXPO_PUBLIC_BACKEND=supabase`), quatro desafios operacionais de infraestrutura e robustez precisavam ser endereçados sem interferir na camada de visualização/interface:
1. Conexão instável ou falha transitória de rede móvel em Piripiri, PI, impedindo leitores de consultarem anúncios previamente carregados.
2. Risco de vazamento inadvertido de dados sensíveis (senhas, chaves de API, tokens JWT) em logs do console ou rastreamento de erros.
3. Risco de abuso no cliente (rajadas de cliques múltiplos, repetição involuntária de propostas e envio repetido de denúncias).
4. Necessidade de uma rotina única de conferência pré-deploy garantindo que tipos, arquitetura, banco, testes automatizados e o bundle web estático em `dist/` estejam 100% íntegros antes de qualquer publicação.

## Decisão

Implementar uma suíte de soluções desacopladas nas camadas de Domínio (`model`) e Infraestrutura (`infra`):

1. **Cache Local Resiliente (`CachedBookDataSource`)**:
   - Padrão Decorator encapsulando `IBookDataSource` com armazenamento via `AsyncStorage` (`IKeyValueStorage`).
   - Salva a lista de livros obtida com sucesso da rede. Caso a chamada ao Supabase falhe (rede offline, timeout), retorna os livros do cache local como fallback transparente.
   - Invalidação automática de cache em operações de escrita (`create`, `update`, `updateStatus`, `delete`).

2. **Logging Estruturado e Sanitizado (`SafeLogger`)**:
   - Contrato `ILogger` em `src/model/services/iLogger.ts` e implementação `SafeLogger` em `src/infra/services/safeLogger.ts`.
   - Sanitização recursiva com mascaramento obrigatório (`[REDACTED]`, `[REDACTED_JWT]`, `Bearer [REDACTED]`) para senhas, tokens e chaves privadas, em conformidade com a LGPD e boas práticas de segurança.

3. **Rate Limiting no Cliente (`ClientRateLimiter`)**:
   - Contrato `IRateLimiter` e implementação em janela deslizante (sliding window) para limitar ações de risco por chave de contexto, protegendo o app contra repetição acidental de formulários.

4. **Script de Verificação de Release Pré-deploy (`scripts/verificar-release.mjs`)**:
   - Script consolidado invocado via `npm run verify:release`, que valida sequencialmente:
     - Documentação de variáveis em `.env.example`.
     - Tipos TypeScript (`npm run typecheck`).
     - Invariantes de arquitetura em 7 camadas (`npm run check:architecture`).
     - Migrações SQL e políticas RLS (`npm run test:sql`).
     - Testes automatizados (`npm test`).
     - Compilação estática Web (`npm run build:web`).
     - Integridade dos artefatos de distribuição (`dist/index.html`, `dist/manifest.json`, `dist/_headers`, `dist/_redirects`).

## Alternativas consideradas

- **Colocar lógica de cache e rate limiting dentro das Views/Telas**: rejeitada, pois violaria a arquitetura MVVM e causaria acoplamento desnecessário com as tarefas da interface.
- **Utilizar bibliotecas externas pesadas para rate limiting e logger**: rejeitada para evitar inchaço do bundle React Native e manter a independência operacional do projeto.

## Consequências

- O catálogo ganha comportamento resiliente e offline-first sem alterar uma linha das telas da aplicação.
- Logs tornam-se seguros para auditoria sem expor segredos.
- O pipeline de deploy ganha um verificador unificado e reproduzível.

Vínculos: [ADR 0002](0002-adotar-expo-mvvm.md), [ADR 0020](0020-publicacao-web-cloudflare-pages.md), [ADR 0023](0023-pipeline-ci-github-actions.md).

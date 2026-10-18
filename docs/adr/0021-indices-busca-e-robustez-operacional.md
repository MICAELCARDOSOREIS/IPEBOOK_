# 0021 — Índices de Busca, Semente de Piripiri e Robustez de Tipagem

## Status

Aceito

## Contexto

À medida que o Ipebook avança para a fase beta comunitária restrita a Piripiri, PI (ADR 0016), a base técnica requer estabilidade operacional sem colidir com as entregas de IHC e telas de usuário sob responsabilidade da integrante Maria Clara:

1. **Desempenho de Consultas no PostgreSQL / Supabase:** O catálogo de livros (`v2_books`), pedidos (`v2_book_requests`), favoritos (`v2_favorites`), alertas de busca (`v2_search_alerts`) e notificações (`v2_notifications`) possuíam apenas chaves primárias e constraints básicas. Consultas por cidade, bairro, status, modalidade e ordenação por data se tornariam lentas com o crescimento do catálogo.
2. **Ambiente de Testes e Homologação:** A equipe precisava de uma massa de dados de teste padronizada, realista e reprodutível que refletisse os 17 bairros reais de Piripiri, PI, sem poluir o banco ou exigir criação manual a cada ciclo de teste.
3. **Robustez do Script `typecheck`:** O comando anterior (`expo customize tsconfig.json && tsc --noEmit`) tentava sobrescrever o `.gitignore` e `tsconfig.json` a cada execução. Em ambientes de desenvolvimento com restrição de escrita (sandboxes, contêineres Docker, agentes de IA ou CI com permissões mínimas), isso disparava erro `EROFS` e impedia a execução do pipeline de validação local.

## Decisão

1. **Índices de Busca e Performance (Migração `202610180001_indices_busca_catalogo.sql`):**
   - Criação de índices parciais e compostos no PostgreSQL:
     - `idx_v2_books_catalog_status_created` para listagem da vitrine (`status = 'available'` ordenado por `created_at desc`).
     - `idx_v2_books_location_active` para filtragem regional por `city` e `neighborhood`.
     - `idx_v2_books_modality_active` para filtragem por modalidade (venda/troca/doação).
     - `idx_v2_books_category_active` para filtragem por categoria.
     - `idx_v2_books_title_lower` e `idx_v2_books_author_lower` para aceleração de buscas textuais case-insensitive.
     - Índices de integridade e consultas em `v2_book_requests`, `v2_favorites`, `v2_search_alerts`, `v2_notifications` e `v2_reports`.
   - Inclusão e validação imediata no script `scripts/verificar-migracoes.mjs` via PGlite.
2. **Script de Semente Oficial da Beta (`scripts/popular-catalogo-piripiri.mjs`):**
   - Criação do comando `npm run db:seed` que valida localmente a inserção de 10 livros realistas em múltiplos bairros de Piripiri (Centro, Paciência, Petecas, Crioli, Vista Alegre, etc.).
   - Suporte ao argumento `--sql` para exportação direta de comandos SQL prontos para execução no SQL Editor do Supabase.
   - Suíte de testes unitários dedicada em `tests/unit/seedCatalogoPiripiri.test.ts`.
3. **Estabilização do `npm run typecheck`:**
   - Remoção da chamada desnecessária a `expo customize tsconfig.json` no script de verificação, invocando diretamente `tsc --noEmit`. Os arquivos de configuração do TypeScript já estão consolidados e versionados no repositório.

## Consequências

- **Positivas:**
  - Consultas na vitrine, alertas de busca e moderação com execução indexada em tempo sub-milissegundo no PostgreSQL.
  - Semente determinística e reproduzível para testes manuais e de homologação.
  - `npm run validate` e `npm run typecheck` executam de forma limpa, rápida e estável em qualquer ambiente.
  - Isolamento completo em relação às tarefas de IHC e telas em desenvolvimento pela Maria Clara.
- **Negativas / Limitações:**
  - Índices consom espaço adicional em disco no banco de dados (impacto desprezível para o porte da beta).
  - Novos campos em `v2_books` que venham a ser adicionados no futuro devem ser avaliados quanto à necessidade de indexação.

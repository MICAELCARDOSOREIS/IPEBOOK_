# 0024 — Busca textual acelerada com extensão pg_trgm e índice GIN

Data: 2026-10-20. Status: aceito.

## Contexto

A busca de livros no catálogo atende a buscas parciais por título e autor (ex.: "Dom Casmurro", "Machado"). Consultas com operador `ILIKE '%termo%'` realizam varredura sequencial na tabela `v2_books` caso não haja índices adequados, gerando degradação de tempo de resposta conforme o número de anúncios cresce. O Supabase (PostgreSQL) suporta a extensão `pg_trgm` (trigramas) e índices GIN, ideais para acelerar buscas parciais insensíveis a maiúsculas/minúsculas.

No entanto, o projeto utiliza PostgreSQL em memória via PGlite (`npm run test:sql`) para validação de migrações em ambientes isolados e em runners de CI, onde a extensão compilada em C `pg_trgm` pode não estar carregada no binário WebAssembly do PGlite.

## Decisão

Adotar a migração `202610200004_extensao_pg_trgm_indices.sql` com estratégia híbrida resiliente:
1. Criar índice composto B-Tree em `(lower(title) text_pattern_ops, lower(author) text_pattern_ops)` para aceleração garantida de prefixos e compatibilidade universal com qualquer engine PostgreSQL.
2. Executar um bloco condicional `DO $$ ... BEGIN ... EXCEPTION WHEN OTHERS THEN NULL; END $$;` que tenta ativar `CREATE EXTENSION IF NOT EXISTS pg_trgm;` e criar índice GIN trigram `idx_v2_books_search_trgm` em `(title gin_trgm_ops, author gin_trgm_ops)`.

Se a extensão estiver disponível (no Supabase remoto ou instâncias completas de PostgreSQL), o índice GIN é ativado automaticamente. Caso contrário (PGlite local sem a extensão C), a migração conclui com sucesso sem quebrar os testes locais.

## Alternativas consideradas

- **Depender exclusivamente de Full Text Search com `tsvector`**: rejeitada para a beta, pois FTS lida com radicais linguísticos e palavras completas, enquanto a busca de títulos e autores precisa de correspondência flexível por substring e trigramas.
- **Forçar falha na migração caso `pg_trgm` falhe**: rejeitada porque inviabilizaria os testes rápidos com PGlite em CI e máquinas locais.

## Consequências

- Desempenho otimizado no Supabase em produção com indexação trigram.
- 100% de compatibilidade e sucesso preservados no script de validação local `npm run test:sql`.

Vínculos: [Issue #127](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/127), [ADR 0021](0021-indices-busca-e-robustez-operacional.md).

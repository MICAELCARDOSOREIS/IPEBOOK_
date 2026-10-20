-- Otimização de busca textual com pg_trgm (no Supabase) e fallback com text_pattern_ops

-- 1. Índice padrão com text_pattern_ops (compatível com todos os ambientes Postgres, inclusive PGlite WASM)
create index if not exists idx_v2_books_title_author_pattern
  on public.v2_books (lower(title) text_pattern_ops, lower(author) text_pattern_ops)
  where status = 'available';

-- 2. Ativação de pg_trgm e índice GIN quando suportado pelo ambiente de destino (Supabase PostgreSQL)
do $$
begin
  create extension if not exists pg_trgm;
  create index if not exists idx_v2_books_trgm_search
    on public.v2_books using gin (title gin_trgm_ops, author gin_trgm_ops)
    where status = 'available';
exception
  when feature_not_supported or undefined_file or others then
    -- Permite execução em ambientes de teste sem extensões compiladas
    null;
end;
$$;

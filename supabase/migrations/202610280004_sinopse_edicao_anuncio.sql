-- Spec 097 / ADR 0073: sinopse e dados da edição do livro, preenchidos pelo ISBN (BrasilAPI, Open Library, Google Books).
-- O anúncio não guarda o ISBN, então os dados precisam ser gravados junto. Colunas aditivas e opcionais: anúncios
-- existentes ficam como estão. Herdam a RLS e os privilégios da tabela (leitura pública do catálogo, escrita do dono).

alter table public.v2_books
  add column if not exists synopsis text check (synopsis is null or char_length(synopsis) <= 2000),
  add column if not exists publisher text check (publisher is null or char_length(publisher) <= 120),
  add column if not exists page_count integer check (page_count is null or page_count between 1 and 20000),
  add column if not exists publication_year integer check (publication_year is null or publication_year between 1000 and 2100);

comment on column public.v2_books.synopsis is 'Sinopse da edição, do ISBN (até 2000 caracteres).';
comment on column public.v2_books.publisher is 'Editora da edição, do ISBN (até 120 caracteres).';

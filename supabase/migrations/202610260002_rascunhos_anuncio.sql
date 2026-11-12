-- Spec 017 · Rascunhos de anúncio.
-- Permite salvar o progresso do fluxo de publicar como um Book com status 'draft',
-- que a pessoa pode retomar, descartar ou publicar depois. Um rascunho é incompleto
-- por natureza (pode estar "Sem título"), então os CHECKs de conteúdo e da regra
-- preço↔modalidade são flexibilizados enquanto status = 'draft'. Ao publicar, o mesmo
-- registro passa a 'available' e volta a ser validado integralmente.

-- 1) Etapa do assistente em que o rascunho parou (1 Livro, 2 Fotos, 3 Detalhes).
alter table public.v2_books
  add column if not exists draft_step smallint;

-- 2) Status aceita 'draft'.
alter table public.v2_books
  drop constraint if exists v2_books_status_check;
alter table public.v2_books
  add constraint v2_books_status_check
  check (status in ('available', 'reserved', 'paused', 'draft'));

-- 3) Título e autor podem ser vazios apenas em rascunho; ao publicar voltam a valer.
alter table public.v2_books
  drop constraint if exists v2_books_title_check;
alter table public.v2_books
  add constraint v2_books_title_check
  check (status = 'draft' or char_length(trim(title)) between 1 and 160);

alter table public.v2_books
  drop constraint if exists v2_books_author_check;
alter table public.v2_books
  add constraint v2_books_author_check
  check (status = 'draft' or char_length(trim(author)) between 1 and 120);

-- 4) Regra preço↔modalidade é suspensa em rascunho (a pessoa ainda pode não ter decidido).
alter table public.v2_books
  drop constraint if exists v2_book_price_matches_modality;
alter table public.v2_books
  add constraint v2_book_price_matches_modality check (
    status = 'draft' or
    (modality = 'sale' and price is not null) or
    (modality <> 'sale' and price is null)
  );

-- 5) RLS · rascunho só é visível ao próprio dono (nunca no catálogo público).
drop policy if exists "Catálogo público desta versão" on public.v2_books;
create policy "Catálogo público desta versão" on public.v2_books
  for select to anon, authenticated
  using (status <> 'draft' or owner_id = (select auth.uid()));

-- 6) RLS · o dono pode criar anúncio 'available' ou 'draft' seu.
drop policy if exists "Conta publica o próprio livro nesta versão" on public.v2_books;
create policy "Conta publica o próprio livro nesta versão" on public.v2_books
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and status in ('available', 'draft'));

-- 7) RLS · o dono descarta o próprio rascunho (exclusão física só em 'draft').
drop policy if exists "Dono descarta o próprio rascunho nesta versão" on public.v2_books;
create policy "Dono descarta o próprio rascunho nesta versão" on public.v2_books
  for delete to authenticated
  using (owner_id = (select auth.uid()) and status = 'draft');

grant delete on public.v2_books to authenticated;

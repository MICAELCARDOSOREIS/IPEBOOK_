-- Tabelas desta versão do Ipebook no projeto Supabase compartilhado.
-- O esquema legado usa listings, profiles e book_requests; não alterá-los aqui.
create table public.v2_books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  author text not null check (char_length(trim(author)) between 1 and 120),
  modality text not null check (modality in ('sale', 'trade', 'donation')),
  price numeric(10,2) check (price > 0),
  status text not null default 'available' check (status in ('available', 'reserved')),
  created_at timestamptz not null default now(),
  constraint v2_book_price_matches_modality check (
    (modality = 'sale' and price is not null) or
    (modality <> 'sale' and price is null)
  )
);

create index v2_books_created_at_idx on public.v2_books (created_at desc);
create index v2_books_owner_id_idx on public.v2_books (owner_id);

alter table public.v2_books enable row level security;

create policy "Catálogo público desta versão" on public.v2_books
  for select to anon, authenticated using (true);
create policy "Conta publica o próprio livro nesta versão" on public.v2_books
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'available');
create policy "Dono altera o próprio livro nesta versão" on public.v2_books
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant select on public.v2_books to anon, authenticated;
grant insert, update on public.v2_books to authenticated;

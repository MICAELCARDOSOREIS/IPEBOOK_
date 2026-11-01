-- Spec 112 / ADR 0086: suporte a box e coleções de múltiplos volumes de livros.
-- Permite identificar anúncios que compreendem uma coleção inteira ou box.

alter table public.v2_books
  add column if not exists is_box boolean not null default false,
  add column if not exists box_volumes_count integer check (box_volumes_count is null or (box_volumes_count >= 2 and box_volumes_count <= 100));

alter table public.v2_books
  drop constraint if exists v2_books_box_consistency,
  add constraint v2_books_box_consistency check (box_volumes_count is null or is_box = true);

create index if not exists idx_v2_books_is_box on public.v2_books (is_box) where is_box = true;

comment on column public.v2_books.is_box is 'Indica se o anúncio é referente a um box, coleção ou saga com múltiplos volumes.';
comment on column public.v2_books.box_volumes_count is 'Quantidade de volumes do box/coleção (de 2 a 100).';

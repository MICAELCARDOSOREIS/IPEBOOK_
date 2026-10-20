-- Spec 028: estado de conservação e descrição do anúncio, pedidos pela etapa de detalhes do
-- Figma (`04.05 · Detalhes do livro`). Ambos são opcionais para não invalidar anúncios já
-- publicados antes desta migração.
alter table public.v2_books add column if not exists condition text;
alter table public.v2_books add column if not exists description text;

alter table public.v2_books drop constraint if exists v2_books_condition_check;
alter table public.v2_books add constraint v2_books_condition_check
  check (condition is null or condition in ('new', 'good', 'marked', 'worn'));

-- 280 caracteres é o limite mostrado pelo contador da própria tela.
alter table public.v2_books drop constraint if exists v2_books_description_length_check;
alter table public.v2_books add constraint v2_books_description_length_check
  check (description is null or char_length(description) <= 280);

comment on column public.v2_books.condition is
  'Estado de conservação do exemplar: new, good, marked ou worn (Spec 028).';
comment on column public.v2_books.description is
  'Descrição livre do exemplar, limitada a 280 caracteres (Spec 028).';

-- Suporte a fotos de anúncios e localização (Spec 022, 023 e ADR 0017)
alter table public.v2_books
  add column if not exists category text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists neighborhood text,
  add column if not exists photo_url text,
  add column if not exists photos text[] default '{}'::text[];

comment on column public.v2_books.photo_url is 'URL da foto principal da capa do livro';
comment on column public.v2_books.photos is 'URLs adicionais da galeria de fotos do livro';
comment on column public.v2_books.city is 'Cidade onde o livro está localizado';
comment on column public.v2_books.state is 'Estado onde o livro está localizado';
comment on column public.v2_books.neighborhood is 'Bairro de Piripiri onde o livro está localizado';


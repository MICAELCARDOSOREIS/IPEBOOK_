-- Adiciona o status 'paused' para permitir pausar e reativar anúncios de livros (Issue #91).
alter table public.v2_books drop constraint if exists v2_books_status_check;
alter table public.v2_books add constraint v2_books_status_check check (status in ('available', 'reserved', 'paused'));

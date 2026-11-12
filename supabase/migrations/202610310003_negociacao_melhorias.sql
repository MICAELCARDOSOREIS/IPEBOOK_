-- Migração: 202610310003_negociacao_melhorias.sql
-- Descrição: Mensagem inicial e livro de contrapartida em propostas de negociação (Spec 113, ADR 0087).

alter table public.v2_book_requests
  add column if not exists initial_message text,
  add column if not exists offered_book_id uuid references public.v2_books(id) on delete set null;

-- Restrição de tamanho máximo da mensagem inicial (500 caracteres)
alter table public.v2_book_requests
  drop constraint if exists v2_book_requests_initial_message_len,
  add constraint v2_book_requests_initial_message_len
    check (initial_message is null or length(trim(initial_message)) <= 500);

-- Índice para busca de propostas que oferecem um determinado livro
create index if not exists v2_book_requests_offered_book_idx
  on public.v2_book_requests (offered_book_id)
  where offered_book_id is not null;

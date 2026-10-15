-- Pedidos desta versão; a tabela legada book_requests permanece intacta.
-- O aceite atômico será entregue em migração posterior.
create table public.v2_book_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.v2_books(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create unique index v2_book_requests_one_pending_per_user_idx
  on public.v2_book_requests (listing_id, requester_id) where status = 'pending';
create unique index v2_book_requests_one_accepted_per_book_idx
  on public.v2_book_requests (listing_id) where status = 'accepted';
create index v2_book_requests_requester_idx on public.v2_book_requests (requester_id);

create function public.guard_v2_book_request_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.listing_id <> old.listing_id or new.requester_id <> old.requester_id then
    raise exception 'Participantes do pedido não podem ser alterados';
  end if;
  if old.status <> 'pending' or new.status not in ('accepted', 'rejected') then
    raise exception 'Transição inválida do pedido';
  end if;
  return new;
end;
$$;

create trigger guard_v2_book_request_before_update
before update on public.v2_book_requests
for each row execute function public.guard_v2_book_request_update();

alter table public.v2_book_requests enable row level security;

create policy "Participantes consultam pedidos desta versão" on public.v2_book_requests
  for select to authenticated using (
    requester_id = (select auth.uid()) or exists (
      select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id = (select auth.uid())
    )
  );
create policy "Leitor solicita livro de outra pessoa nesta versão" on public.v2_book_requests
  for insert to authenticated with check (
    requester_id = (select auth.uid()) and status = 'pending' and exists (
      select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id <> (select auth.uid()) and b.status = 'available'
    )
  );
create policy "Dono responde pedido desta versão" on public.v2_book_requests
  for update to authenticated using (
    exists (
      select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id = (select auth.uid())
    )
  );

grant select, insert, update on public.v2_book_requests to authenticated;

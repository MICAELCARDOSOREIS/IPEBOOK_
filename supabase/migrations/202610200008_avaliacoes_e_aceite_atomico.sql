-- A avaliação pertence às duas pessoas de um pedido aceito.
drop policy if exists "usuário só cria avaliação em seu próprio nome" on public.v2_ratings;
create policy "participante avalia contraparte de pedido aceito"
  on public.v2_ratings for insert to authenticated
  with check (
    rater_id = (select auth.uid())
    and exists (
      select 1
      from public.v2_book_requests pedido
      join public.v2_books livro on livro.id = pedido.listing_id
      where pedido.id = request_id
        and pedido.status = 'accepted'
        and (
          (pedido.requester_id = (select auth.uid()) and rated_user_id = livro.owner_id)
          or (livro.owner_id = (select auth.uid()) and rated_user_id = pedido.requester_id)
        )
    )
  );

-- O cliente só pode recusar diretamente; aceitar exige a RPC transacional.
drop policy if exists "Dono responde pedido desta versão" on public.v2_book_requests;
create policy "Dono recusa pedido desta versão"
  on public.v2_book_requests for update to authenticated
  using (
    exists (select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id = (select auth.uid()))
  )
  with check (
    status = 'rejected'
    and exists (select 1 from public.v2_books b
      where b.id = listing_id and b.owner_id = (select auth.uid()))
  );

-- Uma chamada RPC executa aceite, rejeição dos concorrentes e reserva do livro
-- na mesma transação do PostgreSQL. O bloqueio da linha serializa aceites rivais.
create function public.accept_book_request(target_request_id uuid)
returns public.v2_book_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  pedido public.v2_book_requests%rowtype;
  livro public.v2_books%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Autenticação obrigatória';
  end if;

  select b.* into livro
  from public.v2_books b
  join public.v2_book_requests r on r.listing_id = b.id
  where r.id = target_request_id
  for update of b;

  if not found or livro.owner_id <> (select auth.uid()) or livro.status <> 'available' then
    raise exception 'Pedido não pode ser aceito';
  end if;

  update public.v2_book_requests
     set status = 'accepted'
   where id = target_request_id and status = 'pending'
  returning * into pedido;
  if not found then
    raise exception 'Pedido não está pendente';
  end if;

  update public.v2_book_requests
     set status = 'rejected'
   where listing_id = livro.id and id <> target_request_id and status = 'pending';

  update public.v2_books set status = 'reserved' where id = livro.id;
  return pedido;
end;
$$;

revoke all on function public.accept_book_request(uuid) from public;
grant execute on function public.accept_book_request(uuid) to authenticated;

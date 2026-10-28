-- Spec 101 / ADR 0077: quem pediu pode cancelar o próprio pedido pendente (e quem anunciou é avisado), e quem
-- favoritou um livro é avisado quando o preço baixa ou o livro sai do ar. Mesmo padrão das Specs 098 e 100.

alter table public.v2_notifications drop constraint if exists v2_notifications_type_check;
alter table public.v2_notifications add constraint v2_notifications_type_check check (
  type in ('request_received', 'request_accepted', 'request_rejected', 'request_cancelled', 'new_message',
    'rating_received', 'favorite_update', 'safety_tip', 'system', 'search_alert_match', 'meeting_update')
);

-- Pedido cancelado por quem pediu.
alter table public.v2_book_requests drop constraint if exists v2_book_requests_status_check;
alter table public.v2_book_requests add constraint v2_book_requests_status_check
  check (status in ('pending', 'accepted', 'rejected', 'cancelled'));

create or replace function public.guard_v2_book_request_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.listing_id <> old.listing_id or new.requester_id <> old.requester_id then
    raise exception 'Participantes do pedido não podem ser alterados';
  end if;
  if old.status <> 'pending' or new.status not in ('accepted', 'rejected', 'cancelled') then
    raise exception 'Transição inválida do pedido';
  end if;
  return new;
end;
$$;

drop policy if exists "Leitor cancela o próprio pedido pendente" on public.v2_book_requests;
create policy "Leitor cancela o próprio pedido pendente"
  on public.v2_book_requests for update to authenticated
  using (requester_id = (select auth.uid()) and status = 'pending')
  with check (requester_id = (select auth.uid()) and status = 'cancelled');

-- O dono não pode marcar um pedido como cancelado: a política dele só aceita 'rejected' (ADR 0074 mantido).

create or replace function public.v2_notify_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  livro public.v2_books%rowtype;
begin
  select * into livro from public.v2_books where id = new.listing_id;
  if not found then return new; end if;

  if tg_op = 'INSERT' then
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      livro.owner_id,
      'Novo pedido para o seu livro',
      'Alguém tem interesse em "' || left(livro.title, 80) || '". Veja o pedido e responda.',
      'request_received',
      '/pedidos-recebidos'
    );
  elsif new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      new.requester_id,
      'Seu pedido foi aceito',
      'Combine a entrega de "' || left(livro.title, 80) || '" pelo chat e escolha o local e o horário do encontro.',
      'request_accepted',
      '/negociacao/' || new.id::text
    );
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      new.requester_id,
      'Seu pedido não foi aceito',
      'O pedido de "' || left(livro.title, 80) || '" não seguiu adiante. Que tal procurar outros livros?',
      'request_rejected',
      '/meus-pedidos'
    );
  elsif new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      livro.owner_id,
      'Pedido cancelado',
      'Quem pediu "' || left(livro.title, 80) || '" desistiu do pedido.',
      'request_cancelled',
      '/pedidos-recebidos'
    );
  end if;
  return new;
end;
$$;
revoke all on function public.v2_notify_request_change() from public, anon, authenticated;

-- Livro favoritado: preço baixou ou deixou de estar disponível.
create or replace function public.v2_notify_favorite_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  titulo text;
  mensagem text;
  rota text;
begin
  if tg_op = 'DELETE' then
    if old.status <> 'available' then return old; end if;
    titulo := 'Um livro favorito saiu do ar';
    mensagem := '"' || left(old.title, 80) || '" foi removido por quem anunciou.';
    rota := '/favoritos';
  elsif old.status = 'available' and new.status in ('reserved', 'paused', 'delivered') then
    titulo := 'Um livro favorito não está mais disponível';
    mensagem := '"' || left(new.title, 80) || '" foi '
      || case new.status when 'reserved' then 'reservado' when 'paused' then 'pausado' else 'entregue' end
      || '. Procure outras opções na pesquisa.';
    rota := '/livro/' || new.id::text;
  elsif new.status = 'available' and old.price is not null and new.price is not null and new.price < old.price then
    titulo := 'Preço baixou num livro favorito';
    mensagem := '"' || left(new.title, 80) || '" agora custa R$ '
      || replace(to_char(new.price, 'FM999999990.00'), '.', ',') || '.';
    rota := '/livro/' || new.id::text;
  else
    return coalesce(new, old);
  end if;

  insert into public.v2_notifications (user_id, title, message, type, action_url)
  select f.user_id, titulo, mensagem, 'favorite_update', rota
  from public.v2_favorites f
  where f.book_id = coalesce(new.id, old.id) and f.user_id <> coalesce(new.owner_id, old.owner_id);
  return coalesce(new, old);
end;
$$;
revoke all on function public.v2_notify_favorite_change() from public, anon, authenticated;

drop trigger if exists v2_book_notifies_favorites on public.v2_books;
create trigger v2_book_notifies_favorites
after update of status, price on public.v2_books
for each row execute function public.v2_notify_favorite_change();

-- Antes de excluir: depois, a cascata já apagou os favoritos.
drop trigger if exists v2_book_delete_notifies_favorites on public.v2_books;
create trigger v2_book_delete_notifies_favorites
before delete on public.v2_books
for each row execute function public.v2_notify_favorite_change();

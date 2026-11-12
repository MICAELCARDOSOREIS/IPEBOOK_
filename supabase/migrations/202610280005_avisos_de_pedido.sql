-- Spec 098 / ADR 0074: avisos de pedido. O app tem os tipos `request_received` e `request_accepted`, mas nada os
-- criava no servidor: quem anunciava nunca sabia de um "Tenho interesse", e quem pedia nunca sabia do aceite.
-- Segue o padrão dos avisos de encontro: gatilho SECURITY DEFINER, sem depender do app. O push chega pelo gatilho
-- de `v2_notifications` (Spec 096).

drop trigger if exists v2_request_notifies on public.v2_book_requests;
drop function if exists public.v2_notify_request_change() cascade;

create function public.v2_notify_request_change()
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
    -- Pedido novo: avisa quem anunciou o livro.
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      livro.owner_id,
      'Novo pedido para o seu livro',
      'Alguém tem interesse em "' || left(livro.title, 80) || '". Veja o pedido e responda.',
      'request_received',
      '/pedidos-recebidos'
    );
  elsif new.status = 'accepted' and old.status is distinct from 'accepted' then
    -- Pedido aceito: avisa quem pediu e leva à negociação.
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (
      new.requester_id,
      'Seu pedido foi aceito',
      'Combine a entrega de "' || left(livro.title, 80) || '" pelo chat e escolha o local e o horário do encontro.',
      'request_accepted',
      '/negociacao/' || new.id::text
    );
  end if;
  return new;
end;
$$;
revoke all on function public.v2_notify_request_change() from public, anon, authenticated;

create trigger v2_request_notifies
after insert or update of status on public.v2_book_requests
for each row execute function public.v2_notify_request_change();

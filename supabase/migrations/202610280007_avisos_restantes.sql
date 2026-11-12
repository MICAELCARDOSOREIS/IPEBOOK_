-- Spec 100 / ADR 0076: avisos que ainda faltavam. Mensagem nova no chat, pedido recusado e avaliação
-- recebida não geravam nada em `v2_notifications`, então nem a central nem o push (Spec 096) avisavam.
-- Mesmo padrão da Spec 098: gatilhos SECURITY DEFINER, sem depender do app.

alter table public.v2_notifications drop constraint if exists v2_notifications_type_check;
alter table public.v2_notifications add constraint v2_notifications_type_check check (
  type in ('request_received', 'request_accepted', 'request_rejected', 'new_message', 'rating_received',
    'safety_tip', 'system', 'search_alert_match', 'meeting_update')
);

-- Pedido recusado (inclusive os recusados automaticamente quando outro pedido do livro é aceito).
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
  end if;
  return new;
end;
$$;
revoke all on function public.v2_notify_request_change() from public, anon, authenticated;

-- Mensagem nova no chat: avisa a outra pessoa da negociação. Enquanto houver um aviso de mensagem
-- não lido da mesma negociação, não cria outro (a central não enche e o push não repete).
create or replace function public.v2_notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pedido public.v2_book_requests%rowtype;
  dono uuid;
  destino uuid;
  rota text;
begin
  select * into pedido from public.v2_book_requests where id = new.request_id;
  if not found then return new; end if;
  select owner_id into dono from public.v2_books where id = pedido.listing_id;
  if dono is null then return new; end if;

  destino := case when new.sender_id = pedido.requester_id then dono else pedido.requester_id end;
  if destino = new.sender_id then return new; end if;
  rota := '/negociacao/' || new.request_id::text;

  if exists (
    select 1 from public.v2_notifications
    where user_id = destino and type = 'new_message' and action_url = rota and not read
  ) then
    return new;
  end if;

  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values (destino, 'Nova mensagem na negociação', left(new.content, 120), 'new_message', rota);
  return new;
end;
$$;
revoke all on function public.v2_notify_new_message() from public, anon, authenticated;

drop trigger if exists v2_message_notifies on public.v2_negotiation_messages;
create trigger v2_message_notifies
after insert on public.v2_negotiation_messages
for each row execute function public.v2_notify_new_message();

-- Avaliação recebida: avisa quem foi avaliado e leva às avaliações do próprio perfil.
create or replace function public.v2_notify_rating_received()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values (
    new.rated_user_id,
    'Você recebeu uma avaliação',
    'Sua negociação foi avaliada com ' || new.score::text || ' de 5 estrelas.',
    'rating_received',
    '/perfil/avaliacoes'
  );
  return new;
end;
$$;
revoke all on function public.v2_notify_rating_received() from public, anon, authenticated;

drop trigger if exists v2_rating_notifies on public.v2_ratings;
create trigger v2_rating_notifies
after insert on public.v2_ratings
for each row execute function public.v2_notify_rating_received();

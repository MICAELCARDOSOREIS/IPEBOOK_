-- Spec 111 / ADR 0085: Notificações comunitárias e fechamento de ciclos de interação.
-- 1. Entrega por QR Code avisa tanto o dono quanto o solicitante para avaliação mútua.
-- 2. Onboarding: boas-vindas e dica de segurança nos Pontos Seguros ao criar perfil.
-- 3. Favoritos: aviso quando um livro pausado/reservado volta a ficar disponível.
-- 4. Moderação: retorno aos denunciantes quando a denúncia é resolvida.

-- 1. Entrega por QR Code avisa ambas as partes da negociação
create or replace function public.complete_delivery(target_request_id uuid, informado text)
returns table (resultado text, concluida_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario uuid := (select auth.uid());
  pedido public.v2_book_requests%rowtype;
  dono uuid;
  registro public.v2_delivery_codes%rowtype;
  agora timestamptz := now();
begin
  if usuario is null then raise exception 'Sessão obrigatória para concluir a entrega'; end if;
  select * into pedido from public.v2_book_requests where id = target_request_id;
  if not found or pedido.status <> 'accepted' then
    raise exception 'Negociação não encontrada ou ainda não aceita';
  end if;
  if pedido.requester_id <> usuario then
    raise exception 'Só quem recebe o livro lê o QR da entrega';
  end if;
  if exists (select 1 from public.v2_deliveries d where d.request_id = target_request_id) then
    raise exception 'A entrega desta negociação já foi concluída';
  end if;
  if not exists (select 1 from public.v2_meetings m where m.request_id = target_request_id and m.status = 'confirmed') then
    raise exception 'Confirme o encontro antes de concluir a entrega';
  end if;

  select * into registro from public.v2_delivery_codes c where c.request_id = target_request_id for update;
  if not found or registro.expires_at <= agora then
    return query select 'expirado'::text, null::timestamptz;
    return;
  end if;
  if registro.attempts >= 5 then
    return query select 'bloqueado'::text, null::timestamptz;
    return;
  end if;
  if registro.code <> upper(coalesce(informado, '')) then
    update public.v2_delivery_codes c set attempts = c.attempts + 1 where c.request_id = target_request_id;
    return query select 'incorreto'::text, null::timestamptz;
    return;
  end if;

  insert into public.v2_deliveries (request_id, completed_by, completed_at) values (target_request_id, usuario, agora);
  delete from public.v2_delivery_codes c where c.request_id = target_request_id;

  -- RN-01 (Spec 111): avisa o anunciante e o solicitante para avaliarem a negociação.
  select owner_id into dono from public.v2_books where id = pedido.listing_id;
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values
    (dono, 'Entrega confirmada', 'A entrega do livro foi confirmada. Avalie a negociação para fortalecer nossa comunidade.',
     'meeting_update', '/negociacao/' || target_request_id::text),
    (pedido.requester_id, 'Entrega confirmada', 'Você confirmou o recebimento do livro. Que tal avaliar o leitor parceiro?',
     'meeting_update', '/negociacao/' || target_request_id::text);

  return query select 'ok'::text, agora;
end;
$$;
revoke all on function public.complete_delivery(uuid, text) from public, anon;
grant execute on function public.complete_delivery(uuid, text) to authenticated;

-- 2. Onboarding: boas-vindas e dica de segurança
create or replace function public.v2_onboarding_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values
    (new.id, 'Boas-vindas ao IpêBook!', 'Conecte-se com leitores de Piripiri e encontre sua próxima leitura.',
     'system', '/pesquisa'),
    (new.id, 'Dica de segurança: Pontos Seguros', 'Sempre marque entregas nos Pontos Seguros cadastrados (Praça da Bandeira, Estação Ferroviária, IFPI).',
     'safety_tip', '/ajuda');
  return new;
end;
$$;
revoke all on function public.v2_onboarding_notifications() from public, anon, authenticated;

drop trigger if exists v2_profile_onboarding on public.v2_profiles;
create trigger v2_profile_onboarding
after insert on public.v2_profiles
for each row execute function public.v2_onboarding_notifications();

-- 3. Favorito volta a ficar disponível
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
  elsif old.status in ('reserved', 'paused') and new.status = 'available' then
    titulo := 'Livro favorito disponível novamente!';
    mensagem := '"' || left(new.title, 80) || '" voltou a ficar disponível para troca ou doação.';
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

-- 4. Moderação: retorno aos denunciantes ao resolver
create or replace function public.v2_moderation_resolve(
  target_kind text,
  target uuid,
  decision text,
  note text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  dono uuid;
  livro record;
begin
  if not public.v2_is_moderator() then
    raise exception 'Acesso restrito a moderadores';
  end if;

  if target_kind not in ('listing', 'user') then
    raise exception 'Tipo de alvo inválido';
  end if;

  if decision not in ('dismiss', 'remove_listing', 'suspend_user') then
    raise exception 'Decisão inválida';
  end if;

  if target_kind = 'listing' then
    select * into livro from public.v2_books where id = target;
    if not found then raise exception 'Anúncio não encontrado'; end if;
    dono := livro.owner_id;
  else
    dono := target;
  end if;

  if decision = 'dismiss' then
    if target_kind = 'listing' then
      insert into public.v2_notifications (user_id, title, message, type, action_url)
      select distinct r.reporter_id, 'Denúncia analisada',
        'A denúncia que você enviou sobre o anúncio foi analisada pela moderação. Obrigado por colaborar com a comunidade.',
        'system', '/ajuda'
      from public.v2_reports r where r.listing_id = target and r.status = 'open';

      update public.v2_reports set status = 'dismissed', resolved_at = now() where listing_id = target and status = 'open';
      if livro.moderation_hold then
        update public.v2_books set status = 'available', moderation_hold = false where id = target;
      end if;
    else
      insert into public.v2_notifications (user_id, title, message, type, action_url)
      select distinct r.reporter_id, 'Denúncia analisada',
        'A denúncia que você enviou sobre o perfil foi analisada pela moderação. Obrigado por colaborar com a comunidade.',
        'system', '/ajuda'
      from public.v2_user_reports r where r.reported_user_id = target and r.status = 'open';

      update public.v2_user_reports set status = 'dismissed', resolved_at = now() where reported_user_id = target and status = 'open';
    end if;
    return 'dismissed';
  end if;

  if decision = 'remove_listing' then
    if target_kind <> 'listing' then raise exception 'Decisão inválida'; end if;

    insert into public.v2_notifications (user_id, title, message, type, action_url)
    select distinct r.reporter_id, 'Denúncia analisada',
      'A denúncia que você enviou sobre o anúncio foi analisada e o anúncio foi removido por violar as regras. Obrigado por ajudar nossa comunidade.',
      'system', '/ajuda'
    from public.v2_reports r where r.listing_id = target and r.status = 'open';

    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (dono, 'Anúncio removido pela moderação',
      '"' || left(livro.title, 80) || '" foi removido por não seguir as regras da comunidade.', 'system', '/meus-anuncios');

    update public.v2_reports set status = 'actioned', resolved_at = now() where listing_id = target and status = 'open';
    delete from public.v2_books where id = target;
    return 'removed';
  end if;

  -- suspend_user
  insert into public.v2_suspended_users (user_id, reason, suspended_by)
  values (dono, coalesce(nullif(trim(note), ''), 'Denúncias da comunidade'), (select auth.uid()))
  on conflict (user_id) do nothing;
  update public.v2_books set status = 'paused' where owner_id = dono and status = 'available';

  insert into public.v2_notifications (user_id, title, message, type, action_url)
  select distinct r.reporter_id, 'Denúncia analisada',
    'A denúncia que você enviou foi analisada e providências foram tomadas pela moderação. Obrigado por colaborar com a comunidade.',
    'system', '/ajuda'
  from public.v2_user_reports r where r.reported_user_id = dono and r.status = 'open';

  update public.v2_reports set status = 'actioned', resolved_at = now()
    where status = 'open' and listing_id in (select id from public.v2_books where owner_id = dono);
  update public.v2_user_reports set status = 'actioned', resolved_at = now() where reported_user_id = dono and status = 'open';

  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values (dono, 'Conta suspensa',
    'Sua conta foi suspensa pela moderação. Fale com a equipe do IpêBook para saber mais.', 'system', '/ajuda');
  return 'suspended';
end;
$$;
revoke all on function public.v2_moderation_resolve(text, uuid, text, text) from public, anon;
grant execute on function public.v2_moderation_resolve(text, uuid, text, text) to authenticated;

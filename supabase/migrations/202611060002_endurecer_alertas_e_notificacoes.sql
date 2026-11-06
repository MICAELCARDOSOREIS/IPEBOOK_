-- Endurece limites de alertas e evita fan-out ilimitado de notificações/push.

create or replace function public.v2_enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quem uuid := (select auth.uid());
  total int;
begin
  if quem is null or current_setting('role', true) is distinct from 'authenticated' then
    return new;
  end if;

  if tg_table_name = 'v2_search_alerts' then
    select count(*) into total
      from public.v2_search_alerts
      where user_id = quem and active;
    if total >= 20 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 20 alertas ativos atingido.';
    end if;
  elsif tg_table_name = 'v2_books' then
    select count(*) into total from public.v2_books
      where owner_id = quem and created_at > now() - interval '24 hours';
    if total >= 15 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 15 anúncios por dia atingido. Tente de novo amanhã.';
    end if;
  elsif tg_table_name = 'v2_book_requests' then
    select count(*) into total from public.v2_book_requests
      where requester_id = quem and created_at > now() - interval '24 hours';
    if total >= 10 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 10 pedidos por dia atingido. Tente de novo amanhã.';
    end if;
  elsif tg_table_name = 'v2_negotiation_messages' then
    select count(*) into total from public.v2_negotiation_messages
      where sender_id = quem and created_at > now() - interval '5 minutes';
    if total >= 30 then
      raise exception using errcode = 'IBLIM', message = 'Muitas mensagens em pouco tempo. Espere alguns minutos.';
    end if;
  elsif tg_table_name in ('v2_reports', 'v2_user_reports') then
    select (select count(*) from public.v2_reports where reporter_id = quem and created_at > now() - interval '24 hours')
         + (select count(*) from public.v2_user_reports where reporter_id = quem and created_at > now() - interval '24 hours')
      into total;
    if total >= 10 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 10 denúncias por dia atingido. Fale com a equipe se precisar.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists v2_search_alerts_rate_limit on public.v2_search_alerts;
create trigger v2_search_alerts_rate_limit
before insert on public.v2_search_alerts
for each row execute function public.v2_enforce_rate_limit();

create or replace function public.v2_enforce_favorites_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.v2_favorites where user_id = new.user_id) >= 100 then
    raise exception using errcode = 'IBLIM', message = 'Limite de 100 favoritos atingido.';
  end if;
  return new;
end;
$$;
revoke all on function public.v2_enforce_favorites_limit() from public, anon, authenticated;

drop trigger if exists v2_favorites_rate_limit on public.v2_favorites;
create trigger v2_favorites_rate_limit
before insert on public.v2_favorites
for each row execute function public.v2_enforce_favorites_limit();

create or replace function public.v2_notify_search_alerts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  select a.user_id, 'Livro encontrado para seu alerta',
    'Um novo anúncio corresponde a “' || a.query || '”.', 'search_alert_match', '/livro/' || new.id::text
  from public.v2_search_alerts a
  where a.active and a.user_id <> new.owner_id
    and new.modality = any (a.modalities)
    and (position(lower(a.query) in lower(new.title)) > 0
      or position(lower(a.query) in lower(new.author)) > 0
      or position(lower(a.query) in lower(coalesce(new.category, ''))) > 0)
    and not exists (
      select 1 from public.v2_notifications n
      where n.user_id = a.user_id
        and n.type = 'search_alert_match'
        and n.action_url = '/livro/' || new.id::text
    )
  limit 100;
  return new;
end;
$$;

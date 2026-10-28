-- Spec 102 / ADR 0078: moderação. As denúncias (Specs 011 e 091) eram gravadas, mas ninguém as analisava.
-- Moderadores (cadastrados só pelo painel do Supabase) veem a fila, arquivam denúncias, removem anúncios e
-- suspendem contas. Anúncio com 3 denúncias de pessoas diferentes é pausado sozinho até a análise.

create table public.v2_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.v2_moderators is 'Contas com acesso à moderação. Inserir só pelo painel/SQL do Supabase.';
alter table public.v2_moderators enable row level security;
revoke all on public.v2_moderators from anon, authenticated, public;

create table public.v2_suspended_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 1 and 300),
  suspended_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.v2_suspended_users enable row level security;
revoke all on public.v2_suspended_users from anon, authenticated, public;

create function public.v2_is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.v2_moderators where user_id = (select auth.uid()));
$$;
revoke all on function public.v2_is_moderator() from public, anon;
grant execute on function public.v2_is_moderator() to authenticated;

create function public.v2_is_suspended(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.v2_suspended_users where user_id = target);
$$;
revoke all on function public.v2_is_suspended(uuid) from public, anon;
grant execute on function public.v2_is_suspended(uuid) to authenticated;

-- Situação da denúncia.
alter table public.v2_reports
  add column status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  add column resolved_at timestamptz;
alter table public.v2_user_reports
  add column status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  add column resolved_at timestamptz;

-- Anúncio retido pela moderação (pausa automática por denúncias).
alter table public.v2_books add column moderation_hold boolean not null default false;

-- Cliente não mexe na retenção nem reativa anúncio retido ou de conta suspensa; as funções da moderação
-- (SECURITY DEFINER) rodam como dona das tabelas e passam.
create function public.v2_guard_moderation_hold()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.moderation_hold is distinct from old.moderation_hold then
      raise exception 'Retenção da moderação não pode ser alterada';
    end if;
    if new.status = 'available' and old.status <> 'available'
      and (old.moderation_hold or public.v2_is_suspended(old.owner_id)) then
      raise exception 'Anúncio em análise pela moderação';
    end if;
  end if;
  return new;
end;
$$;

create trigger v2_books_guard_moderation_hold
before update on public.v2_books
for each row execute function public.v2_guard_moderation_hold();

-- Conta suspensa não anuncia, não pede e não manda mensagem (políticas restritivas somam às existentes).
create policy "Conta suspensa não publica" on public.v2_books
  as restrictive for insert to authenticated
  with check (not public.v2_is_suspended((select auth.uid())));
create policy "Conta suspensa não pede livro" on public.v2_book_requests
  as restrictive for insert to authenticated
  with check (not public.v2_is_suspended((select auth.uid())));
create policy "Conta suspensa não envia mensagem" on public.v2_negotiation_messages
  as restrictive for insert to authenticated
  with check (not public.v2_is_suspended((select auth.uid())));

-- Fila: denúncias abertas agrupadas por alvo (anúncio ou pessoa).
create function public.v2_moderation_queue()
returns table (
  kind text,
  target_id uuid,
  target_label text,
  owner_id uuid,
  reasons text[],
  details text[],
  report_count bigint,
  first_reported_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.v2_is_moderator() then
    raise exception 'Acesso restrito à moderação';
  end if;
  return query
    select 'listing'::text, b.id, b.title, b.owner_id,
      array_agg(distinct r.reason), array_remove(array_agg(r.details), null),
      count(*), min(r.created_at)
    from public.v2_reports r join public.v2_books b on b.id = r.listing_id
    where r.status = 'open'
    group by b.id, b.title, b.owner_id
    union all
    select 'user'::text, p.id, p.name, p.id,
      array_agg(distinct u.reason), array_remove(array_agg(u.details), null),
      count(*), min(u.created_at)
    from public.v2_user_reports u join public.v2_profiles p on p.id = u.reported_user_id
    where u.status = 'open'
    group by p.id, p.name
    order by 7 desc, 8 asc;
end;
$$;
revoke all on function public.v2_moderation_queue() from public, anon;
grant execute on function public.v2_moderation_queue() to authenticated;

-- Decisão do moderador sobre um alvo: 'dismiss' arquiva, 'remove_listing' tira o anúncio do ar,
-- 'suspend_user' suspende a conta e pausa os anúncios disponíveis dela.
create function public.v2_moderation_resolve(target_kind text, target uuid, decision text, note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  livro public.v2_books%rowtype;
  dono uuid;
begin
  if not public.v2_is_moderator() then
    raise exception 'Acesso restrito à moderação';
  end if;
  if target_kind not in ('listing', 'user') or decision not in ('dismiss', 'remove_listing', 'suspend_user') then
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
      update public.v2_reports set status = 'dismissed', resolved_at = now() where listing_id = target and status = 'open';
      -- Pausado só pelas denúncias: volta ao ar.
      if livro.moderation_hold then
        update public.v2_books set status = 'available', moderation_hold = false where id = target;
      end if;
    else
      update public.v2_user_reports set status = 'dismissed', resolved_at = now() where reported_user_id = target and status = 'open';
    end if;
    return 'dismissed';
  end if;

  if decision = 'remove_listing' then
    if target_kind <> 'listing' then raise exception 'Decisão inválida'; end if;
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (dono, 'Anúncio removido pela moderação',
      '"' || left(livro.title, 80) || '" foi removido por não seguir as regras da comunidade.', 'system', '/meus-anuncios');
    delete from public.v2_books where id = target;
    return 'removed';
  end if;

  -- suspend_user
  insert into public.v2_suspended_users (user_id, reason, suspended_by)
  values (dono, coalesce(nullif(trim(note), ''), 'Denúncias da comunidade'), (select auth.uid()))
  on conflict (user_id) do nothing;
  update public.v2_books set status = 'paused' where owner_id = dono and status = 'available';
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

-- Moderador desfaz uma suspensão.
create function public.v2_moderation_unsuspend(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.v2_is_moderator() then
    raise exception 'Acesso restrito à moderação';
  end if;
  delete from public.v2_suspended_users where user_id = target;
end;
$$;
revoke all on function public.v2_moderation_unsuspend(uuid) from public, anon;
grant execute on function public.v2_moderation_unsuspend(uuid) to authenticated;

-- Três denúncias abertas de pessoas diferentes pausam o anúncio até a análise.
create function public.v2_auto_pause_reported_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  livro public.v2_books%rowtype;
begin
  select * into livro from public.v2_books where id = new.listing_id;
  if not found or livro.status <> 'available' then return new; end if;
  if (select count(distinct reporter_id) from public.v2_reports where listing_id = new.listing_id and status = 'open') >= 3 then
    update public.v2_books set status = 'paused', moderation_hold = true where id = livro.id;
    insert into public.v2_notifications (user_id, title, message, type, action_url)
    values (livro.owner_id, 'Anúncio pausado para análise',
      '"' || left(livro.title, 80) || '" recebeu denúncias e ficou pausado até a moderação analisar.', 'system', '/meus-anuncios');
  end if;
  return new;
end;
$$;
revoke all on function public.v2_auto_pause_reported_listing() from public, anon, authenticated;

create trigger v2_report_auto_pauses_listing
after insert on public.v2_reports
for each row execute function public.v2_auto_pause_reported_listing();
